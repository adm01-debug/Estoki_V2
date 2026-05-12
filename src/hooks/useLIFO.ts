import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para rotação de estoque LIFO (Last-In, First-Out).
 * Prioriza a saída de itens que entraram por último no estoque.
 */
export function useLIFO(produtoId?: string) {
  return useQuery({
    queryKey: ["lifo", produtoId],
    queryFn: async () => {
      let query = supabase
        .from("lotes")
        .select(`
          id,
          numero_lote,
          data_recebimento,
          quantidade_atual,
          produto:produtos(nome, sku)
        `)
        .gt("quantidade_atual", 0)
        .order("data_recebimento", { ascending: false });

      if (produtoId) {
        query = query.eq("produto_id", produtoId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return data;
    },
  });
}
