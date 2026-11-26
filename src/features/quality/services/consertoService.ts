import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { Database } from "@/integrations/supabase/types";

export type RecuperacaoRow = Database["public"]["Tables"]["recuperacao_materiais"]["Row"];

export const STATUS_CONSERTO = ["em_recuperacao", "recuperado", "sucata"] as const;
export type StatusConserto = (typeof STATUS_CONSERTO)[number];

export interface RecuperacaoComLote extends RecuperacaoRow {
  lotes: { numero_lote: string | null; produtos: { nome: string; sku: string } | null } | null;
}

export interface PlanoConserto {
  loteId?: string | null;
  produtoId?: string | null;
  quantidade: number;
  defeito: string;
  operadorId?: string | null;
}

export interface ResultadoConserto {
  recuperada: number;
  perda: number;
  status: Extract<StatusConserto, "recuperado" | "sucata">;
  observacoes?: string;
}

/** Regras que a tela precisa mostrar antes de tentar gravar (o banco repete as mesmas). */
export function validarResultado(original: number, resultado: ResultadoConserto): string | null {
  const { recuperada, perda, status } = resultado;

  if (!Number.isInteger(recuperada) || recuperada < 0) return "Quantidade recuperada inválida";
  if (!Number.isInteger(perda) || perda < 0) return "Quantidade de perda inválida";
  if (recuperada + perda === 0) return "Informe quanto foi recuperado ou perdido";
  if (recuperada + perda > original)
    return `Recuperado + perda (${recuperada + perda}) passa das ${original} unidades que entraram no setor`;
  if (status === "recuperado" && recuperada === 0)
    return "Status recuperado exige ao menos 1 unidade recuperada";
  if (status === "sucata" && perda === 0) return "Status sucata exige ao menos 1 unidade perdida";

  return null;
}

async function operadorAtual(): Promise<string | null> {
  const { data } = await supabase.auth.getUser();
  return data?.user?.id ?? null;
}

interface Checkpoint {
  loteId?: string | null;
  produtoId?: string | null;
  quantidade: number;
  setorOrigem: string;
  setorDestino: string;
  operadorId: string | null;
  integridade: "completo" | "incompleto" | "com_avaria";
  observacoes?: string;
}

/**
 * A timeline e registro secundario: se ela falhar a recuperacao continua valida, entao o erro
 * e registrado mas nao derruba a operacao principal (que ja foi gravada).
 */
async function registrarCheckpoint(checkpoint: Checkpoint): Promise<void> {
  if (checkpoint.quantidade <= 0) return;

  const { error } = await supabase.from("setores_checkpoint").insert({
    lote_id: checkpoint.loteId ?? null,
    produto_id: checkpoint.produtoId ?? null,
    quantidade: checkpoint.quantidade,
    setor_origem: checkpoint.setorOrigem,
    setor_destino: checkpoint.setorDestino,
    operador_id: checkpoint.operadorId,
    status_integridade: checkpoint.integridade,
    observacoes: checkpoint.observacoes ?? null,
  });

  if (error) logger.error("Falha ao registrar checkpoint de setor", error);
}

export const consertoService = {
  /** Abre uma recuperacao no setor de conserto. Devolve null quando nao ha nada a recuperar. */
  async registrarPlanoConserto(plano: PlanoConserto): Promise<RecuperacaoRow | null> {
    if (!Number.isFinite(plano.quantidade) || plano.quantidade <= 0) return null;
    if (!plano.loteId && !plano.produtoId)
      throw new Error("Conserto precisa de lote ou produto para rastrear a origem");

    const quantidade = Math.trunc(plano.quantidade);
    const operadorId = plano.operadorId ?? (await operadorAtual());

    const { data, error } = await supabase
      .from("recuperacao_materiais")
      .insert({
        lote_id: plano.loteId ?? null,
        produto_id: plano.produtoId ?? null,
        quantidade_original: quantidade,
        quantidade_recuperada: 0,
        quantidade_perda: 0,
        defeito_identificado: plano.defeito,
        status: "em_recuperacao",
        operador_responsavel: operadorId,
      })
      .select()
      .single();

    if (error) {
      logger.error("Erro ao abrir recuperacao de materiais", error, { loteId: plano.loteId });
      throw error;
    }

    await registrarCheckpoint({
      loteId: plano.loteId,
      produtoId: plano.produtoId,
      quantidade,
      setorOrigem: "triagem",
      setorDestino: "conserto",
      operadorId,
      integridade: "com_avaria",
      observacoes: plano.defeito,
    });

    return data;
  },

  async listar(): Promise<RecuperacaoComLote[]> {
    const { data, error } = await supabase
      .from("recuperacao_materiais")
      .select(`*, lotes ( numero_lote, produtos (nome, sku) )`)
      .order("created_at", { ascending: false })
      .limit(200);

    if (error) {
      logger.error("Erro ao listar recuperacoes", error);
      throw error;
    }
    return (data ?? []) as RecuperacaoComLote[];
  },

  /** Fecha a recuperacao: quanto voltou ao estoque, quanto virou perda. */
  async registrarResultado(id: string, resultado: ResultadoConserto): Promise<RecuperacaoRow> {
    const { data: atual, error } = await supabase
      .from("recuperacao_materiais")
      .select("id, quantidade_original, lote_id, produto_id, operador_responsavel")
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Erro ao carregar recuperacao", error, { id });
      throw error;
    }

    const invalido = validarResultado(atual.quantidade_original, resultado);
    if (invalido) throw new Error(invalido);

    const { data, error: erroUpdate } = await supabase
      .from("recuperacao_materiais")
      .update({
        quantidade_recuperada: resultado.recuperada,
        quantidade_perda: resultado.perda,
        status: resultado.status,
        data_saida: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (erroUpdate) {
      logger.error("Erro ao fechar recuperacao", erroUpdate, { id });
      throw erroUpdate;
    }

    const voltouAoEstoque = resultado.status === "recuperado";

    await registrarCheckpoint({
      loteId: atual.lote_id,
      produtoId: atual.produto_id,
      quantidade: voltouAoEstoque ? resultado.recuperada : resultado.perda,
      setorOrigem: "conserto",
      setorDestino: voltouAoEstoque ? "estoque" : "descarte",
      operadorId: atual.operador_responsavel ?? (await operadorAtual()),
      integridade: voltouAoEstoque ? "completo" : "incompleto",
      observacoes: resultado.observacoes,
    });

    return data;
  },
};
