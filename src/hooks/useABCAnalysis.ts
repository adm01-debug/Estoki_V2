import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/**
 * Realiza a análise Curva ABC dos produtos baseada no valor total em estoque.
 * Classe A: 80% do valor total (mais importantes)
 * Classe B: 15% seguintes
 * Classe C: 5% finais
 */
export function useABCAnalysis() {
  return useQuery({
    queryKey: ["abc-analysis"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("lotes")
        .select(`
          quantidade_atual,
          produto:produtos(id, nome, sku, preco_venda)
        `)
        .gt("quantidade_atual", 0);

      if (error) throw error;

      // Agrupar por produto e calcular valor total
      const productMap = new Map<string, { id: string; nome: string; sku: string; valorTotal: number }>();
      
      data.forEach((item: any) => {
        const prod = item.produto;
        const valor = (prod.preco_venda || 0) * item.quantidade_atual;
        if (productMap.has(prod.id)) {
          const existing = productMap.get(prod.id)!;
          existing.valorTotal += valor;
        } else {
          productMap.set(prod.id, {
            id: prod.id,
            nome: prod.nome,
            sku: prod.sku,
            valorTotal: valor
          });
        }
      });

      const sortedProducts = Array.from(productMap.values()).sort((a, b) => b.valorTotal - a.valorTotal);
      const totalValue = sortedProducts.reduce((acc, p) => acc + p.valorTotal, 0);
      
      let cumulativeValue = 0;
      return sortedProducts.map(p => {
        cumulativeValue += p.valorTotal;
        const percent = totalValue > 0 ? (cumulativeValue / totalValue) * 100 : 0;
        let classe: "A" | "B" | "C" = "C";
        
        if (percent <= 80) classe = "A";
        else if (percent <= 95) classe = "B";
        
        return { ...p, percent, classe };
      });
    },
  });
}
