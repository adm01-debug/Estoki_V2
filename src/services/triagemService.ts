// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export const triagemService = {
  async getAll(resultado?: string) {
    let query = supabase.from("eventos_triagem").select("*").order("created_at", { ascending: false });
    if (resultado) query = query.eq("resultado", resultado);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("eventos_triagem").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },

  async create(triagem: { lote_id?: string; operador_id?: string }) {
    const { data, error } = await supabase.from("eventos_triagem").insert({ ...triagem, data_inicio: new Date().toISOString() }).select().single();
    if (error) throw error;
    return data;
  },

  async update(id: string, updateData: Record<string, unknown>) {
    const { data: result, error } = await supabase.from("eventos_triagem").update(updateData).eq("id", id).select().single();
    if (error) throw error;
    return result;
  },

  async finalizar(id: string, resultado: { resultado: string; observacoes?: string }) {
    return this.update(id, { ...resultado, data_fim: new Date().toISOString() });
  },
};
