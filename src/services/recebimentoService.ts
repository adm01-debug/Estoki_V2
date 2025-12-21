import { supabase } from "@/integrations/supabase/client";

export const recebimentoService = {
  async getAll(status?: string) {
    let query = supabase.from("recebimentos").select("*").order("created_at", { ascending: false });
    if (status) query = query.eq("status", status);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async getById(id: string) {
    const { data, error } = await supabase.from("recebimentos").select("*").eq("id", id).single();
    if (error) throw error;
    return data;
  },

  async create(recebimento: { nf_numero: string; fornecedor_id: string }) {
    const { data, error } = await supabase.from("recebimentos").insert({ ...recebimento, status: "pendente" }).select().single();
    if (error) throw error;
    return data;
  },

  async iniciarConferencia(id: string, conferente_id: string) {
    const { data, error } = await supabase.from("recebimentos").update({ status: "conferindo", conferente_id }).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },

  async finalizar(id: string, hasDivergencia: boolean) {
    const status = hasDivergencia ? "divergencia" : "finalizado";
    const { data, error } = await supabase.from("recebimentos").update({ status, data_recebimento: new Date().toISOString() }).eq("id", id).select().single();
    if (error) throw error;
    return data;
  },
};
