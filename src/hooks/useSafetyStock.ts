import { useQuery } from "@tanstack/react-query";
import { useLeadTime } from "./useLeadTime";

/**
 * Calcula o Estoque de Segurança baseado na fórmula:
 * SS = Z * σL * D_avg
 * Onde:
 * Z = Fator de nível de serviço (ex: 1.65 para 95%)
 * σL = Desvio padrão do Lead Time
 * D_avg = Demanda média diária
 */
export function useSafetyStock(produtoId: string, serviceLevel = 1.65) {
  const { data: leadTimeData, isLoading: loadingLT } = useLeadTime(undefined, produtoId);

  return useQuery({
    queryKey: ["safety-stock", produtoId, serviceLevel],
    queryFn: async () => {
      // Simulando demanda média diária de 10 unidades
      const demandaMediaDiaria = 10;
      
      if (!leadTimeData || leadTimeData.lead_time_medio === 0) return 0;

      // Desvio padrão é a raiz da variância
      const sigmaLT = Math.sqrt(leadTimeData.variancia);
      
      // Estoque de segurança
      const ss = serviceLevel * sigmaLT * demandaMediaDiaria;

      return Math.ceil(ss);
    },
    enabled: !!leadTimeData,
  });
}