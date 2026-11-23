import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import type { PickingTask } from "../types";

export const pickingService = {
  async getTasks(): Promise<PickingTask[]> {
    const { data, error } = await supabase
      .from("tarefas")
      .select(
        `
        *,
        produto:produtos(nome, sku, barcode),
        posicao_origem:posicoes_estoque!posicao_origem_id(codigo)
      `
      )
      .eq("tipo", "separacao")
      .order("prioridade", { ascending: false });

    if (error) {
      logger.error("Erro ao buscar tarefas de picking", error);
      throw error;
    }

    return (data || []).map((t) => ({
      ...t,
      produto_nome: (t.produto as any)?.nome || "Produto Indefinido",
      produto_sku: (t.produto as any)?.sku || undefined,
      produto_barcode: (t.produto as any)?.barcode || undefined,
      posicao_origem_codigo: (t.posicao_origem as any)?.codigo || "---",
    })) as PickingTask[];
  },

  async updateTaskStatus(
    taskId: string,
    status: string,
    userId?: string,
    qty?: number
  ): Promise<void> {
    if (status === "em_andamento") {
      const { error } = await supabase.rpc("iniciar_tarefa_picking", {
        p_tarefa_id: taskId,
      } as any);

      if (error) {
        logger.error("Erro ao iniciar tarefa de picking", error, { taskId });
        throw error;
      }
      return;
    }

    if (status === "concluida") {
      if (!qty) {
        throw new Error("Quantidade é obrigatória para concluir a tarefa");
      }
      const { error } = await supabase.rpc("concluir_tarefa_picking", {
        p_tarefa_id: taskId,
        p_quantidade: qty,
        p_codigo_lido: null,
      } as any);

      if (error) {
        logger.error("Erro ao concluir tarefa de picking", error, { taskId, qty });
        throw error;
      }
      return;
    }

    // Demais transicoes (cancelar, etc.) continuam via UPDATE simples
    const updates: any = { status, updated_at: new Date().toISOString() };
    const { error } = await supabase.from("tarefas").update(updates).eq("id", taskId);

    if (error) {
      logger.error("Erro ao atualizar status da tarefa", error, { taskId, status });
      throw error;
    }
  },
};
