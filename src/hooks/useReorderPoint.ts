import { useQuery } from "@tanstack/react-query";
import { useLeadTime } from "./useLeadTime";
import { useSafetyStock } from "./useSafetyStock";

/**
 * Calcula o Ponto de Pedido (ROP):
 * ROP = (Demanda Média Diária * Lead Time Médio) + Estoque de Segurança
 */
export function useReorderPoint(produtoId: string) {
  const { data: leadTimeData } = useLeadTime(undefined, produtoId);
  const { data: safetyStock } = useSafetyStock(produtoId);

  return useQuery({
    queryKey: ["reorder-point", produtoId],
    queryFn: async () => {
      const demandaMediaDiaria = 10; // Mock
      
      if (!leadTimeData || safetyStock === undefined) return 0;

      const rop = (demandaMediaDiaria * leadTimeData.lead_time_medio) + safetyStock;

      return Math.ceil(rop);
    },
    enabled: !!leadTimeData && safetyStock !== undefined,
  });
}
