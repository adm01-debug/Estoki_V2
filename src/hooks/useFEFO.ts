import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para rotação de estoque FEFO (First Expired, First Out).
 * Prioriza a saída de itens com data de validade mais próxima.
 */
 export function useFEFO(produtoId?: string, sku?: string) {
  return useQuery({
    queryKey: ["fefo", produtoId],
    queryFn: async () => {
      let query = supabase
        .from("lotes")
         .select(`
           id,
           numero_lote,
           data_validade,
           quantidade_atual,
           produto:produtos(nome, sku),
           estoque_posicao(
             posicao:posicoes_estoque(codigo)
           )
         `)
        .gt("quantidade_atual", 0)
        .not("data_validade", "is", null)
        .order("data_validade", { ascending: true });

       if (produtoId) query = query.eq("produto_id", produtoId);
        // Fix SKU filtering for joined tables in Supabase
        if (sku) query = query.eq("produto.sku", sku);

      const { data, error } = await query;

      if (error) throw error;

      const now = new Date();
      return (data as any[]).map(item => {
        const validade = new Date(item.data_validade);
        return {
          ...item,
          dias_para_vencer: Math.ceil(
            (validade.getTime() - now.getTime()) / (1000 * 3600 * 24)
          )
        };
      });
    },
  });
}
