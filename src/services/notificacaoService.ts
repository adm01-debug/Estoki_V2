import { supabase } from "@/integrations/supabase/client";

export const notificacaoService = {
  async getAll(userId: string, unreadOnly = false) {
    let query = supabase.from("notificacoes").select("*").eq("user_id", userId).order("created_at", { ascending: false });
    if (unreadOnly) query = query.eq("lida", false);
    const { data, error } = await query;
    if (error) throw error;
    return data;
  },

  async markAsRead(id: string) {
    const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("id", id);
    if (error) throw error;
  },

  async markAllAsRead(userId: string) {
    const { error } = await supabase.from("notificacoes").update({ lida: true }).eq("user_id", userId).eq("lida", false);
    if (error) throw error;
  },

  async create(notification: { user_id: string; tipo: string; titulo: string; mensagem?: string; data?: unknown }) {
    const { mensagem, ...rest } = notification;
    const payload = { ...rest, mensagem: mensagem ?? "" };
    const { data, error } = await supabase.from("notificacoes").insert([payload]).select().single();
    if (error) throw error;
    return data;
  },

  async getUnreadCount(userId: string) {
    const { count, error } = await supabase.from("notificacoes").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("lida", false);
    if (error) throw error;
    return count || 0;
  },
};
