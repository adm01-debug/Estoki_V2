import { supabase } from "@/integrations/supabase/client";

export const triagemService = {
  async getAll(status?: string) {
    let query = supabase.from("triagens").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("triagens").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },

  async create(triagem: { lote_id: string; operador_id: string }) {
    const { data, error } = await supabase.from("triagens").insert({ ...triagem, status: "em_andamento" }).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, data: Record<string, unknown>) {
    const { data: result, error } = await supabase.from("triagens").update(data).eq("id", id).select().single();
    if (error) throw error;
    return result;
  },

  async finalizar(id: string, resultado: { quantidade_aprovada: number; quantidade_reprovada: number; observacoes?: string }) {
    return this.update(id, { ...resultado, status: "concluida", fim: new Date().toISOString() });
  },
};
