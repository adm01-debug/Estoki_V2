import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { PosicaoEstoque } from "@/types/inventory";
import type { Database } from "@/integrations/supabase/types";

type PosicaoInsert = Database["public"]["Tables"]["posicoes_estoque"]["Insert"];
type PosicaoUpdate = Database["public"]["Tables"]["posicoes_estoque"]["Update"];

export const inventoryService = {
  async getAll(limit = 1000): Promise<PosicaoEstoque[]> {
    const { data, error } = await supabase
      .from("posicoes_estoque")
      .select(
        `
        *,
        saldos:estoque_posicao(
          id,
          produto_id,
          lote_id,
          quantidade,
          data_entrada,
          produto:produtos(nome, sku, curva_abc),
          lote:lotes(numero_lote, data_validade)
        )
      `
      )
      .order("codigo")
      .limit(limit);

    if (error) {
      logger.error("Erro ao buscar posições de estoque", error);
      throw error;
    }
    return (data || []) as unknown as PosicaoEstoque[];
  },

  async getAllOccupied(): Promise<PosicaoEstoque[]> {
    const { data, error } = await supabase
      .from("posicoes_estoque")
      .select(
        `
        *,
        saldos:estoque_posicao(
          id,
          produto_id,
          lote_id,
          quantidade,
          data_entrada,
          produto:produtos(nome, sku, curva_abc),
          lote:lotes(numero_lote, data_validade)
        )
      `
      )
      .eq("status", "ocupado")
      .order("updated_at", { ascending: false });

    if (error) {
      logger.error("Erro ao buscar posições ocupadas", error);
      throw error;
    }
    return (data || []) as unknown as PosicaoEstoque[];
  },

  async getById(id: string): Promise<PosicaoEstoque | null> {
    const { data, error } = await supabase
      .from("posicoes_estoque")
      .select(
        `
        *,
        saldos:estoque_posicao(
          id,
          produto_id,
          lote_id,
          quantidade,
          data_entrada,
          produto:produtos(nome, sku, curva_abc),
          lote:lotes(numero_lote, data_validade)
        )
      `
      )
      .eq("id", id)
      .single();

    if (error) {
      logger.error("Erro ao buscar posição por ID", error, { id });
      throw error;
    }
    return data as unknown as PosicaoEstoque;
  },

  async updateStatus(
    ids: string[],
    status: string,
    motivo?: string,
    operadorId?: string
  ): Promise<void> {
    const updates: PosicaoUpdate = {
      status: status as any,
      updated_at: new Date().toISOString(),
    };

    if (status === "bloqueado") {
      updates.bloqueado_por = operadorId;
      updates.bloqueado_em = new Date().toISOString();
    } else if (status === "reservado") {
      updates.reservado_por = operadorId;
      updates.reservado_em = new Date().toISOString();
    } else if (status === "livre") {
      updates.bloqueado_por = null;
      updates.bloqueado_em = null;
      updates.reservado_por = null;
      updates.reservado_em = null;
    }

    const { error } = await supabase.from("posicoes_estoque").update(updates).in("id", ids);

    if (error) {
      logger.error("Erro ao atualizar status de posições", error, { ids, status });
      throw error;
    }

    if (operadorId) {
      const logs = ids.map((posId) => ({
        posicao_id: posId,
        status_novo: status,
        operador_id: operadorId,
        motivo: motivo || "Alteração manual via painel",
      }));
      await supabase.from("posicao_status_log").insert(logs);
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase.from("posicoes_estoque").delete().eq("id", id);
    if (error) {
      logger.error("Erro ao deletar posição de estoque", error, { id });
      throw error;
    }
  },

  async create(posicao: PosicaoInsert): Promise<PosicaoEstoque> {
    const { data, error } = await supabase
      .from("posicoes_estoque")
      .insert(posicao)
      .select()
      .single();

    if (error) {
      logger.error("Erro ao criar posição de estoque", error, { posicao });
      throw error;
    }
    return data as unknown as PosicaoEstoque;
  },
};
