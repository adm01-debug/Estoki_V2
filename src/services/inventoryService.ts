 import { supabase } from "@/lib/supabase";
 import { logger } from "@/utils/logger";
 import { Database } from "@/integrations/supabase/types";

 type RastreamentoInsert = Database['public']['Tables']['rastreamento_historico']['Insert'];
 type EstoquePosicaoInsert = Database['public']['Tables']['estoque_posicao']['Insert'];

 interface InventoryFilters extends Record<string, unknown> {
   produtoId?: string;
   tipo?: Database['public']['Tables']['rastreamento_historico']['Row']['tipo_evento'];
 }

export const inventoryService = {
  async getStockByPosition(posicaoId: string) {
     try {
       const { data, error } = await supabase
         .from("estoque_posicao")
         .select(`
           *,
           produto:produtos(*)
         `)
         .eq("posicao_id", posicaoId);
       if (error) throw error;
       return data;
     } catch (error) {
       logger.error("Erro ao buscar estoque por posição", error, { posicaoId });
       throw error;
     }
  },

  async adjustStock(params: { 
    produtoId: string, 
    posicaoId: string, 
    quantidade: number, 
    motivo: string,
    operadorId: string 
  }) {
     try {
       // Registro histórico do ajuste
       const { error: histError } = await supabase
         .from("rastreamento_historico")
         .insert({
           produto_id: params.produtoId,
           posicao_id: params.posicaoId,
           tipo_evento: "ajuste_estoque",
           quantidade: params.quantidade,
           descricao: params.motivo,
           operador_id: params.operadorId
         } as RastreamentoInsert);

       if (histError) throw histError;

       // Atualização real
       const { data: current, error: fetchError } = await supabase
         .from("estoque_posicao")
         .select("quantidade")
         .eq("produto_id", params.produtoId)
         .eq("posicao_id", params.posicaoId)
         .maybeSingle();

       if (fetchError) throw fetchError;

       if (current) {
         const { error: updateError } = await supabase
           .from("estoque_posicao")
           .update({ quantidade: current.quantidade + params.quantidade })
           .eq("produto_id", params.produtoId)
           .eq("posicao_id", params.posicaoId);
         if (updateError) throw updateError;
       } else {
         const { error: insertError } = await supabase
           .from("estoque_posicao")
           .insert({
             produto_id: params.produtoId,
             posicao_id: params.posicaoId,
             quantidade: params.quantidade
           } as EstoquePosicaoInsert);
         if (insertError) throw insertError;
       }
       logger.info("Ajuste de estoque realizado com sucesso", params);
     } catch (error) {
       logger.error("Erro ao ajustar estoque", error, params);
       throw error;
     }
  },

   async getMovements(filters?: InventoryFilters) {
     try {
       let query = supabase
         .from("rastreamento_historico")
         .select(`
           *,
           produto:produtos(nome, sku),
           operador:profiles(nome)
         `)
         .order("created_at", { ascending: false });

       if (filters?.produtoId) query = query.eq("produto_id", filters.produtoId);
       if (filters?.tipo) query = query.eq("tipo_evento", filters.tipo);

       const { data, error } = await query.limit(100);
       if (error) throw error;
       return data;
     } catch (error) {
       logger.error("Erro ao buscar movimentações", error, filters);
       throw error;
     }
  }
};
