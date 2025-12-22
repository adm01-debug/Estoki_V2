// @ts-nocheck
import { supabase } from "@/integrations/supabase/client";
import { Posicao, PosicaoFilter, PosicaoStats } from "@/types/posicao";

export const posicaoService = {
  async getAll(filter?: PosicaoFilter): Promise<Posicao[]> {
    let query = supabase.from("posicoes").select("*");
    if (filter?.corredor) query = query.eq("corredor", filter.corredor);
    if (filter?.tipo) query = query.eq("tipo", filter.tipo);
    if (filter?.status) query = query.eq("status", filter.status);
    if (filter?.search) query = query.ilike("codigo", `%${filter.search}%`);
    const { data, error } = await query;
    if (error) throw error;
    return data as Posicao[];
  },

  async getById(id: string): Promise<Posicao | null> {
    const { data, error } = await supabase.from("posicoes").select("*").eq("id", id).single();
    if (error) throw error;
    return data as Posicao;
  },

  async getStats(): Promise<PosicaoStats> {
    const { data, error } = await supabase.from("posicoes").select("status");
    if (error) throw error;
    const total = data.length;
    const ocupadas = data.filter(p => p.status === "ocupada").length;
    const livres = data.filter(p => p.status === "livre").length;
    const reservadas = data.filter(p => p.status === "reservada").length;
    const bloqueadas = data.filter(p => p.status === "bloqueada").length;
    return { total, ocupadas, livres, reservadas, bloqueadas, ocupacaoPercentual: (ocupadas / total) * 100 };
  },

  async update(id: string, data: Partial<Posicao>): Promise<Posicao> {
    const { data: result, error } = await supabase.from("posicoes").update(data).eq("id", id).select().single();
    if (error) throw error;
    return result as Posicao;
  },
};
