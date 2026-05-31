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
        produto:produtos(nome),
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
      posicao_origem_codigo: (t.posicao_origem as any)?.codigo || "---",
    })) as PickingTask[];
  },

  async updateTaskStatus(
    taskId: string,
    status: string,
    userId?: string,
    qty?: number
  ): Promise<void> {
    const updates: any = { status, updated_at: new Date().toISOString() };

    if (status === "em_andamento") {
      updates.data_inicio = new Date().toISOString();
      updates.operador_id = userId;
    }
    if (status === "concluido") {
      updates.data_conclusao = new Date().toISOString();
      updates.quantidade_executada = qty;
    }

    const { error } = await supabase.from("tarefas").update(updates).eq("id", taskId);

    if (error) {
      logger.error("Erro ao atualizar status da tarefa", error, { taskId, status });
      throw error;
    }

    // Se concluiu, registrar evento de picking
    if (status === "concluido" && qty) {
      const { data: task } = await supabase.from("tarefas").select("*").eq("id", taskId).single();

      if (task) {
        const { error: eventError } = await supabase.from("eventos_picking").insert({
          tarefa_id: taskId,
          operador_id: userId,
          produto_id: task.produto_id,
          posicao_id: task.posicao_origem_id,
          quantidade_solicitada: task.quantidade,
          quantidade_separada: qty,
          correto: qty === task.quantidade,
          data_inicio: task.data_inicio || new Date().toISOString(),
          data_fim: new Date().toISOString(),
        });

        if (eventError) logger.error("Erro ao registrar evento de picking", eventError);
      }
    }
  },
};
