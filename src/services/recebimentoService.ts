 import { supabase } from "@/lib/supabase";
 import { logger } from "@/utils/logger";
 import { Database } from "@/integrations/supabase/types";

 type LoteRow = Database['public']['Tables']['lotes']['Row'];
 type LoteInsert = Database['public']['Tables']['lotes']['Insert'];
 type LoteUpdate = Database['public']['Tables']['lotes']['Update'];
 type StatusRecebimento = Database['public']['Enums']['status_recebimento'];

export const recebimentoService = {
   async getAll(status?: StatusRecebimento) {
     try {
       let query = supabase.from("lotes").select("*").order("created_at", { ascending: false }).limit(500);
       if (status) query = query.eq("status", status);
       const { data, error } = await query;
       if (error) throw error;
       return data;
     } catch (error) {
       logger.error("Erro ao buscar todos os recebimentos (lotes)", error, { status });
       throw error;
     }
   },

   async getById(id: string) {
     try {
       const { data, error } = await supabase.from("lotes").select("*").eq("id", id).single();
       if (error) throw error;
       return data;
     } catch (error) {
       logger.error("Erro ao buscar recebimento por ID", error, { id });
       throw error;
     }
   },

   async create(recebimento: Omit<LoteInsert, 'id' | 'created_at' | 'status'>) {
     try {
       const { data, error } = await supabase.from("lotes").insert({ ...recebimento, status: "aguardando" as StatusRecebimento }).select().single();
       if (error) throw error;
       logger.info("Novo recebimento (lote) criado", { id: data.id });
       return data;
     } catch (error) {
       logger.error("Erro ao criar recebimento", error, { recebimento });
       throw error;
     }
   },

   async iniciarConferencia(id: string, conferido_por: string) {
     try {
       const { data, error } = await supabase.from("lotes").update({ status: "recebido" as StatusRecebimento, conferido_por } as LoteUpdate).eq("id", id).select().single();
       if (error) throw error;
       logger.info("Conferência de recebimento iniciada", { id, conferido_por });
       return data;
     } catch (error) {
       logger.error("Erro ao iniciar conferência", error, { id });
       throw error;
     }
   },

   async finalizar(id: string, hasDivergencia: boolean) {
     try {
       const status: StatusRecebimento = hasDivergencia ? "divergencia" : "conferido";
       const { data, error } = await supabase.from("lotes").update({ status, data_conferencia: new Date().toISOString() } as LoteUpdate).eq("id", id).select().single();
       if (error) throw error;
       logger.info("Conferência de recebimento finalizada", { id, status });
       return data;
     } catch (error) {
       logger.error("Erro ao finalizar conferência", error, { id });
       throw error;
     }
   },
};

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
