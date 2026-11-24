import { supabase } from "@/integrations/supabase/client";
import {
  calcularScoreFornecedor,
  calcularTendencia,
  RESULTADO_APROVADO,
  RESULTADOS_COM_PROBLEMA,
  diferencaEmDias,
  type TendenciaFornecedor,
} from "@/lib/fornecedorScore";

export interface FornecedorScore {
  id: string;
  fornecedor: string;
  total_entregas: number;
  entregas_conformes: number;
  entregas_divergentes: number;
  lead_time_medio_dias: number | null;
  score: number | null;
  ultima_entrega: string | null;
}

export interface MetricasFornecedor {
  nome: string;
  entregasTotais: number;
  entregasConformes: number;
  entregasDivergentes: number;
  entregasNoPrazo: number;
  entregasComPrevisao: number;
  desviosDias: number[];
  itensRecebidos: number;
  triagens: number;
  triagensAprovadas: number;
  trocas: number;
  primeiraEntrega: string | null;
  ultimaEntrega: string | null;
  janelaRecente: { total: number; conformes: number };
  janelaAnterior: { total: number; conformes: number };
}

export interface ResultadoRecalculoScores {
  fornecedores: number;
  atualizados: number;
  falhas: string[];
}

const JANELA_DIAS = 30;
const MS_POR_DIA = 86_400_000;

const vazio = (nome: string): MetricasFornecedor => ({
  nome,
  entregasTotais: 0,
  entregasConformes: 0,
  entregasDivergentes: 0,
  entregasNoPrazo: 0,
  entregasComPrevisao: 0,
  desviosDias: [],
  itensRecebidos: 0,
  triagens: 0,
  triagensAprovadas: 0,
  trocas: 0,
  primeiraEntrega: null,
  ultimaEntrega: null,
  janelaRecente: { total: 0, conformes: 0 },
  janelaAnterior: { total: 0, conformes: 0 },
});

/** Fórmula única das métricas de fornecedor, a partir dos lotes e das triagens reais. */
export async function calcularMetricasPorFornecedor(): Promise<MetricasFornecedor[]> {
  const { data: lotes, error: erroLotes } = await supabase
    .from("lotes")
    .select(
      "id, fornecedor, quantidade_inicial, status, created_at, data_recebimento, previsao_chegada"
    )
    .not("fornecedor", "is", null)
    .limit(2000);
  if (erroLotes) throw erroLotes;

  const { data: triagens, error: erroTriagens } = await supabase
    .from("eventos_triagem")
    .select("id, resultado, lote_id")
    .limit(2000);
  if (erroTriagens) throw erroTriagens;

  const referencia = (lotes || []).reduce<string | null>((maior, lote) => {
    const data = lote.data_recebimento || lote.created_at;
    if (!data) return maior;
    return !maior || data > maior ? data : maior;
  }, null);
  const referenciaMs = referencia ? new Date(referencia).getTime() : null;

  const acumulados = new Map<string, MetricasFornecedor>();
  const fornecedorDoLote = new Map<string, string>();

  (lotes || []).forEach((lote) => {
    const nome = lote.fornecedor;
    if (!nome) return;

    fornecedorDoLote.set(lote.id, nome);
    const atual = acumulados.get(nome) ?? vazio(nome);
    acumulados.set(nome, atual);

    atual.entregasTotais++;
    atual.itensRecebidos += lote.quantidade_inicial || 0;

    const divergente = lote.status === "divergencia";
    if (divergente) atual.entregasDivergentes++;
    else atual.entregasConformes++;

    const desvio = diferencaEmDias(lote.data_recebimento, lote.previsao_chegada);
    if (desvio !== null) {
      atual.entregasComPrevisao++;
      if (desvio <= 0) atual.entregasNoPrazo++;
      atual.desviosDias.push(desvio);
    }

    const entrega = lote.data_recebimento;
    if (!entrega) return;

    if (!atual.ultimaEntrega || entrega > atual.ultimaEntrega) atual.ultimaEntrega = entrega;
    if (!atual.primeiraEntrega || entrega < atual.primeiraEntrega) atual.primeiraEntrega = entrega;

    if (referenciaMs === null) return;
    const diasAtras = Math.floor((referenciaMs - new Date(entrega).getTime()) / MS_POR_DIA);
    const janela =
      diasAtras <= JANELA_DIAS
        ? atual.janelaRecente
        : diasAtras <= JANELA_DIAS * 2
          ? atual.janelaAnterior
          : null;
    if (!janela) return;

    janela.total++;
    if (!divergente) janela.conformes++;
  });

  (triagens || []).forEach((triagem) => {
    const nome = triagem.lote_id ? fornecedorDoLote.get(triagem.lote_id) : undefined;
    if (!nome) return;

    const atual = acumulados.get(nome) ?? vazio(nome);
    acumulados.set(nome, atual);

    atual.triagens++;
    if (triagem.resultado === RESULTADO_APROVADO) atual.triagensAprovadas++;
    if ((RESULTADOS_COM_PROBLEMA as readonly string[]).includes(triagem.resultado ?? "")) {
      atual.trocas++;
    }
  });

  return Array.from(acumulados.values());
}

export function tendenciaDasMetricas(metricas: MetricasFornecedor): TendenciaFornecedor {
  const conformidade = (janela: { total: number; conformes: number }) =>
    janela.total > 0 ? (janela.conformes / janela.total) * 100 : null;
  return calcularTendencia(
    conformidade(metricas.janelaRecente),
    conformidade(metricas.janelaAnterior)
  );
}

export async function fetchFornecedorScores(): Promise<FornecedorScore[]> {
  const { data, error } = await supabase
    .from("fornecedor_scores")
    .select("*")
    .order("score", { ascending: false });
  if (error) throw error;
  return (data as FornecedorScore[]) || [];
}

/**
 * Reconstrói `fornecedor_scores` a partir dos lotes reais.
 * `lead_time_medio_dias` guarda o desvio absoluto médio (em dias) entre a previsão
 * de chegada e o recebimento — mesma grandeza já gravada em produção.
 */
export async function recalcularFornecedorScores(): Promise<ResultadoRecalculoScores> {
  const metricas = await calcularMetricasPorFornecedor();
  if (metricas.length === 0) return { fornecedores: 0, atualizados: 0, falhas: [] };

  const falhas: string[] = [];
  let atualizados = 0;

  for (const metrica of metricas) {
    const { score, leadTimeMedioDias } = calcularScoreFornecedor({
      totalEntregas: metrica.entregasTotais,
      entregasConformes: metrica.entregasConformes,
      desviosDias: metrica.desviosDias,
    });

    const { error } = await supabase.from("fornecedor_scores").upsert(
      {
        fornecedor: metrica.nome,
        total_entregas: metrica.entregasTotais,
        entregas_conformes: metrica.entregasConformes,
        entregas_divergentes: metrica.entregasDivergentes,
        lead_time_medio_dias: leadTimeMedioDias,
        score,
        ultima_entrega: metrica.ultimaEntrega,
      },
      { onConflict: "fornecedor" }
    );

    if (error) {
      falhas.push(metrica.nome);
      if (import.meta.env.DEV) console.error(`Falha ao gravar score de ${metrica.nome}:`, error);
    } else {
      atualizados++;
    }
  }

  return { fornecedores: metricas.length, atualizados, falhas };
}
