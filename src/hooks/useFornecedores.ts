import { useState, useEffect, useCallback } from "react";
import {
  calcularMetricasPorFornecedor,
  tendenciaDasMetricas,
  type MetricasFornecedor,
} from "@/services/fornecedorScoreService";
import {
  calcularScoreFornecedor,
  classificacaoPorScore,
  type ClassificacaoFornecedor,
  type TendenciaFornecedor,
} from "@/lib/fornecedorScore";

export type { ClassificacaoFornecedor } from "@/lib/fornecedorScore";

export interface Fornecedor {
  id: string;
  nome: string;
  categoria: string;

  // Qualidade medida nos lotes recebidos
  entregas_totais: number;
  entregas_no_prazo: number;
  /** Quantos lotes têm previsão de chegada registrada (base da pontualidade). */
  entregas_com_previsao: number;
  /** null quando nenhum lote do fornecedor tem previsão de chegada registrada. */
  percentual_pontualidade: number | null;

  itens_recebidos: number;
  /** null quando o fornecedor não tem nenhuma triagem registrada. */
  itens_aprovados: number | null;
  triagens: number;
  /** null quando não há triagem para calcular. */
  percentual_qualidade: number | null;

  trocas_devolucoes: number;
  /** null quando não há entrega para servir de base. */
  taxa_problemas: number | null;

  /** null quando não há entrega registrada para o fornecedor. */
  classificacao: ClassificacaoFornecedor | null;
  /** null quando não há entrega registrada para o fornecedor. */
  pontuacao: number | null;

  tendencia: TendenciaFornecedor;

  created_at: string;
  updated_at: string;
}

const arredondar1 = (valor: number) => Math.round(valor * 10) / 10;

const paraFornecedor = (metrica: MetricasFornecedor): Fornecedor => {
  const { score } = calcularScoreFornecedor({
    totalEntregas: metrica.entregasTotais,
    entregasConformes: metrica.entregasConformes,
    desviosDias: metrica.desviosDias,
  });

  const percentualQualidade =
    metrica.triagens > 0 ? arredondar1((metrica.triagensAprovadas / metrica.triagens) * 100) : null;

  return {
    id: metrica.nome,
    nome: metrica.nome,
    categoria: "Geral",
    entregas_totais: metrica.entregasTotais,
    entregas_no_prazo: metrica.entregasNoPrazo,
    entregas_com_previsao: metrica.entregasComPrevisao,
    percentual_pontualidade:
      metrica.entregasComPrevisao > 0
        ? arredondar1((metrica.entregasNoPrazo / metrica.entregasComPrevisao) * 100)
        : null,
    itens_recebidos: metrica.itensRecebidos,
    itens_aprovados:
      percentualQualidade === null
        ? null
        : Math.round(metrica.itensRecebidos * (percentualQualidade / 100)),
    triagens: metrica.triagens,
    percentual_qualidade: percentualQualidade,
    trocas_devolucoes: metrica.trocas,
    taxa_problemas:
      metrica.entregasTotais > 0
        ? arredondar1((metrica.trocas / metrica.entregasTotais) * 100)
        : null,
    classificacao: classificacaoPorScore(score),
    pontuacao: score,
    tendencia: tendenciaDasMetricas(metrica),
    created_at: metrica.primeiraEntrega ?? metrica.ultimaEntrega ?? "",
    updated_at: metrica.ultimaEntrega ?? metrica.primeiraEntrega ?? "",
  };
};

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const metricas = await calcularMetricasPorFornecedor();
      const lista = metricas.map(paraFornecedor);
      lista.sort((a, b) => (b.pontuacao ?? -1) - (a.pontuacao ?? -1));
      setFornecedores(lista);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro ao calcular métricas");
      if (import.meta.env.DEV) console.error("Erro ao calcular métricas de fornecedores:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
  }, [carregar]);

  const getEstatisticasGerais = useCallback(() => {
    const media = (valores: (number | null)[]) => {
      const medidos = valores.filter((valor): valor is number => valor !== null);
      return medidos.length > 0
        ? arredondar1(medidos.reduce((acc, valor) => acc + valor, 0) / medidos.length)
        : null;
    };

    return {
      total: fornecedores.length,
      classificacaoA: fornecedores.filter((f) => f.classificacao === "A").length,
      classificacaoB: fornecedores.filter((f) => f.classificacao === "B").length,
      classificacaoC: fornecedores.filter((f) => f.classificacao === "C").length,
      classificacaoD: fornecedores.filter((f) => f.classificacao === "D").length,
      pontualidadeMedia: media(fornecedores.map((f) => f.percentual_pontualidade)),
      qualidadeMedia: media(fornecedores.map((f) => f.percentual_qualidade)),
      totalTrocas: fornecedores.reduce((acc, f) => acc + f.trocas_devolucoes, 0),
    };
  }, [fornecedores]);

  const getFornecedorById = useCallback(
    (id: string): Fornecedor | undefined => fornecedores.find((f) => f.id === id || f.nome === id),
    [fornecedores]
  );

  const getTopFornecedores = useCallback(
    (limit = 5): Fornecedor[] => fornecedores.filter((f) => f.pontuacao !== null).slice(0, limit),
    [fornecedores]
  );

  const getFornecedoresCriticos = useCallback(
    (): Fornecedor[] =>
      fornecedores.filter((f) => f.classificacao === "D" || (f.taxa_problemas ?? 0) > 10),
    [fornecedores]
  );

  return {
    fornecedores,
    loading,
    error,
    refetch: carregar,
    getEstatisticasGerais,
    getFornecedorById,
    getTopFornecedores,
    getFornecedoresCriticos,
  };
}
