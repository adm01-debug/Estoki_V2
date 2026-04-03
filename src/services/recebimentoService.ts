import { supabase } from "@/integrations/supabase/client";

export const recebimentoService = {
  async getAll(status?: string) {
    let query = supabase.from("lotes").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("lotes").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },

  async create(recebimento: { numero_lote: string; fornecedor?: string; produto_id: string; quantidade_inicial: number; quantidade_atual: number }) {
    const { data, error } = await supabase.from("lotes").insert({ ...recebimento, status: "aguardando" }).select().single();
    if (error) throw error;
    return data;
  },

  async iniciarConferencia(id: string, conferido_por: string) {
    const { data, error } = await supabase.from("lotes").update({ status: "recebido", conferido_por }).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async finalizar(id: string, hasDivergencia: boolean) {
    const status = hasDivergencia ? "divergencia" : "conferido";
    const { data, error } = await supabase.from("lotes").update({ status, data_conferencia: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
};
