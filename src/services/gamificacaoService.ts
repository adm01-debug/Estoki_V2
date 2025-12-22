// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";

export const gamificacaoService = {
  async addXP(userId: string, xp: number) {
    const { data, error } = await supabase.rpc("add_user_xp", { p_user_id: userId, p_xp: xp });
    if (error) throw error;
    return data;
  },

  async getRanking(limit = 10) {
    const { data, error } = await supabase.from("usuario_xp").select("*, users:user_id(email)").order("xp_total", { ascending: false }).limit(limit);
    if (error) throw error;
    return data;
  },

  async getConquistas(userId: string) {
    const { data, error } = await supabase.from("usuario_conquistas").select("*, conquistas(*)").eq("user_id", userId);
    if (error) throw error;
    return data;
  },

  async checkAndUnlockConquista(userId: string, conquistaId: string) {
    const { error } = await supabase.from("usuario_conquistas").insert({ user_id: userId, conquista_id: conquistaId });
    if (error && error.code !== "23505") throw error; // Ignore duplicate
  },

  async getDesafiosDiarios(data: string) {
    const { data: desafios, error } = await supabase.from("desafios_diarios").select("*").eq("data", data);
    if (error) throw error;
    return desafios;
  },
};
