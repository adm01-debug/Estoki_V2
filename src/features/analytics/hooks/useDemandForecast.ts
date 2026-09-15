import { useCallback, useState } from "react";
import { toast } from "sonner";
import { aiInvoke } from "@/lib/ai-invoke";

interface DemandData {
  sku: string;
  history: { date: Date; quantity: number }[];
}

export interface PrevisaoDemanda {
  produto_id: string;
  produto_nome: string;
  demanda_prevista: number;
  tendencia: "alta" | "estavel" | "baixa";
  confianca: number;
  recomendacao: string;
}

export function useDemandForecast(data: DemandData[] = []) {
  const [loading, setLoading] = useState(false);
  const [previsoesIA, setPrevisoesIA] = useState<PrevisaoDemanda[]>([]);

  const movingAverage = useCallback(
    (sku: string, periods = 3) => {
      const item = data.find((d) => d.sku === sku);
      if (!item) return 0;
      const recent = item.history.slice(-periods);
      return recent.reduce((acc, h) => acc + h.quantity, 0) / periods;
    },
    [data]
  );
  const exponentialSmoothing = useCallback(
    (sku: string, alpha = 0.3) => {
      const item = data.find((d) => d.sku === sku);
      if (!item || item.history.length === 0) return 0;
      let forecast = item.history[0].quantity;
      item.history.forEach((h) => {
        forecast = alpha * h.quantity + (1 - alpha) * forecast;
      });
      return forecast;
    },
    [data]
  );
  const trend = useCallback(
    (sku: string) => {
      const item = data.find((d) => d.sku === sku);
      if (!item || item.history.length < 2) return "stable";
      const first = item.history.slice(0, 3).reduce((a, h) => a + h.quantity, 0) / 3;
      const last = item.history.slice(-3).reduce((a, h) => a + h.quantity, 0) / 3;
      if (last > first * 1.1) return "increasing";
      if (last < first * 0.9) return "decreasing";
      return "stable";
    },
    [data]
  );

  const gerarPrevisaoIA = async (produtoId?: string) => {
    setLoading(true);
    try {
      const {
        data: response,
        error,
        circuitOpen,
      } = await aiInvoke<{
        success: boolean;
        previsoes: PrevisaoDemanda[];
        fallback?: boolean;
      }>("previsao-demanda", { produto_id: produtoId });

      if (error) {
        toast.error(
          circuitOpen
            ? "IA indisponível no momento. Aguarde alguns segundos e tente novamente."
            : "Não foi possível gerar a previsão com IA."
        );
        return;
      }

      if (response?.success) {
        setPrevisoesIA(response.previsoes);
        if (response.fallback) {
          toast.info("Previsão gerada por heurística (IA indisponível).");
        }
        return response;
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    movingAverage,
    exponentialSmoothing,
    trend,
    gerarPrevisaoIA,
    previsoesIA,
    loading,
  };
}
