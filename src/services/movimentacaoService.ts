import { supabase } from "@/integrations/supabase/client";

export const movimentacaoService = {
  async getAll(filters?: { tipo?: string; produto_id?: string; data_inicio?: string; data_fim?: string }) {
    let query = supabase.from("movimentacoes").select("*").order("created_at", { ascending: false });
    if (filters?.tipo) query = query.eq("tipo", filters.tipo);
    if (filters?.produto_id) query = query.eq("produto_id", filters.produto_id);
    if (filters?.data_inicio) query = query.gte("created_at", filters.data_inicio);
    if (filters?.data_fim) query = query.lte("created_at", filters.data_fim);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async create(movimentacao: { tipo: string; produto_id: string; origem_id?: string; destino_id?: string; quantidade: number; operador_id: string; motivo?: string }) {
    const { data, error } = await supabase.from("movimentacoes").insert(movimentacao).select().single();
    if (error) throw error;
    return data;
  },

  async getByProduto(produtoId: string) {
    const { data, error } = await supabase.from("movimentacoes").select("*").eq("produto_id", produtoId).order("created_at", { ascending: false });
    if (error) throw error;
    return data;
  },
};
