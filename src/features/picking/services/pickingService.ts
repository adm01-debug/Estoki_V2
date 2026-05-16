import { supabase } from '@/integrations/supabase/client';
import type { PickingTask } from '../types';

export const pickingService = {
  async getTasks(): Promise<PickingTask[]> {
    const { data, error } = await supabase
      .from("tarefas")
      .select(`
        *,
        produto:produtos(nome),
        posicao_origem:posicoes_estoque!posicao_origem_id(codigo)
      `)
      .eq("tipo", "separacao")
      .order("prioridade", { ascending: false });

    if (error) throw error;
    
    return (data || []).map(t => ({
      ...t,
      produto_nome: (t.produto as any)?.nome,
      posicao_origem_codigo: (t.posicao_origem as any)?.codigo
    })) as PickingTask[];
  },

  async updateTaskStatus(taskId: string, status: string, userId?: string, qty?: number): Promise<void> {
    const updates: any = { status, updated_at: new Date().toISOString() };
    
    if (status === "em_andamento") {
      updates.data_inicio = new Date().toISOString();
      updates.operador_id = userId;
    }
    if (status === "concluido") {
      updates.data_conclusao = new Date().toISOString();
      updates.quantidade_executada = qty;
    }

    const { error } = await supabase
      .from("tarefas")
      .update(updates)
      .eq("id", taskId);

    if (error) throw error;
  }
};
