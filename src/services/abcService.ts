import { supabase } from "@/integrations/supabase/client";

export interface ABCAnalysisResult {
  id: string;
  nome: string;
  sku: string;
  valorTotal: number;
  percent: number;
  classe: "A" | "B" | "C";
}

export const abcService = {
  async getAnalysis(): Promise<ABCAnalysisResult[]> {
    const { data, error } = await supabase
      .from("lotes")
      .select(`
        quantidade_atual,
        produto:produtos(id, nome, sku, preco_venda)
      `)
      .gt("quantidade_atual", 0);

    if (error) throw error;

    const productMap = new Map<string, { id: string; nome: string; sku: string; valorTotal: number }>();
    
    data.forEach((item: any) => {
      const prod = item.produto;
      if (!prod) return;
      const valor = (prod.preco_venda || 0) * (item.quantidade_atual || 0);
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
  }
};
