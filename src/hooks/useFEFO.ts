import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Hook para rotação de estoque FEFO (First Expired, First Out).
 * Prioriza a saída de itens com data de validade mais próxima.
 */
export function useFEFO(produtoId?: string) {
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
          produto:produtos(nome, sku)
        `)
        .gt("quantidade_atual", 0)
        .not("data_validade", "is", null)
        .order("data_validade", { ascending: true });

      if (produtoId) {
        query = query.eq("produto_id", produtoId);
      }

      const { data, error } = await query;

      if (error) throw error;

      return (data as any[]).map(item => ({
        ...item,
        dias_para_vencer: Math.ceil(
          (new Date(item.data_validade).getTime() - new Date().getTime()) / (1000 * 3600 * 24)
        )
      }));
    },
  });
}
