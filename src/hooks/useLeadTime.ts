import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { differenceInDays } from "date-fns";

export interface LeadTimeData {
  fornecedor_id: string;
  produto_id: string;
  lead_time_medio: number;
  variancia: number;
  total_pedidos: number;
}

export function useLeadTime(fornecedorId?: string, produtoId?: string) {
  return useQuery({
    queryKey: ["lead-time", fornecedorId, produtoId],
    queryFn: async () => {
      // Simulando cálculo baseado no histórico de recebimentos
      // Em uma aplicação real, isso poderia ser uma view no Supabase ou calculada via Edge Function
      const { data, error } = await supabase
        .from("lotes")
        .select("created_at, data_recebimento, fornecedor_id, produto_id")
        .not("data_recebimento", "is", null);

      if (error) throw error;

      const filteredData = data.filter(l => 
        (!fornecedorId || l.fornecedor_id === fornecedorId) &&
        (!produtoId || l.produto_id === produtoId)
      );

      if (filteredData.length === 0) return { lead_time_medio: 0, variancia: 0, total_pedidos: 0 };

      const leadTimes = filteredData.map(l => 
        differenceInDays(new Date(l.data_recebimento!), new Date(l.created_at))
      );

      const sum = leadTimes.reduce((acc, curr) => acc + curr, 0);
      const avg = sum / leadTimes.length;
      
      const sqDiff = leadTimes.map(lt => Math.pow(lt - avg, 2));
      const variance = sqDiff.reduce((acc, curr) => acc + curr, 0) / sqDiff.length;

      return {
        lead_time_medio: Math.round(avg * 10) / 10,
        variancia: Math.round(variance * 10) / 10,
        total_pedidos: leadTimes.length
      };
    },
    enabled: true
  });
}