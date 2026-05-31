import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export const qualityService = {
  async getAll(): Promise<any[]> {
    const { data, error } = await supabase
      .from("eventos_triagem")
      .select(
        `
        *,
        lotes (
          quantidade_inicial,
          numero_lote,
          produtos (nome, sku)
        )
      `
      )
      .order("created_at", { ascending: false });

    if (error) {
      logger.error("Erro ao buscar triagens", error);
      throw error;
    }
    return data || [];
  },

  async create(triagem: { lote_id?: string; operador_id?: string }) {
    const { data, error } = await supabase
      .from("eventos_triagem")
      .insert({ ...triagem, data_inicio: new Date().toISOString() })
      .select()
      .single();

    if (error) {
      logger.error("Erro ao iniciar nova triagem", error);
      throw error;
    }
    return data;
  },

  async update(id: string, updates: any) {
    const { data, error } = await supabase
      .from("eventos_triagem")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      logger.error("Erro ao atualizar triagem", error, { id });
      throw error;
    }
    return data;
  },

  async finalize(id: string, result: { resultado: string; observacoes?: string }) {
    return this.update(id, {
      ...result,
      data_fim: new Date().toISOString(),
    });
  },
};
