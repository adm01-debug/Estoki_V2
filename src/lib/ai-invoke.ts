/**
 * Wrapper único para invocar edge functions de IA com Circuit Breaker.
 *
 * Motivo: quando o AI Gateway está indisponível (403/429/5xx),
 * cada chamada isolada gera latência e mensagem de erro para o usuário.
 * O circuit breaker abre após 4 falhas consecutivas e fast-fails durante
 * 45s, evitando cascata e melhorando UX.
 */
import { supabase } from "@/integrations/supabase/client";
import { CircuitBreaker, CircuitBreakerError } from "@/lib/circuit-breaker";
import { logger } from "@/utils/logger";

const aiBreaker = new CircuitBreaker({
  name: "ai-gateway",
  failureThreshold: 4,
  resetTimeout: 45_000,
});

export interface AiInvokeResult<T = unknown> {
  data: T | null;
  error: Error | null;
  circuitOpen: boolean;
}

export async function aiInvoke<T = unknown>(
  functionName: string,
  body?: Record<string, unknown>
): Promise<AiInvokeResult<T>> {
  try {
    const data = await aiBreaker.execute(async () => {
      const { data, error } = await supabase.functions.invoke(functionName, { body });
      if (error) throw error;
      return data as T;
    });
    return { data, error: null, circuitOpen: false };
  } catch (err) {
    if (err instanceof CircuitBreakerError) {
      logger.warn("AI circuit aberto — fast-fail", { functionName });
      return {
        data: null,
        error: new Error(
          "Serviço de IA temporariamente indisponível. Tente novamente em alguns segundos."
        ),
        circuitOpen: true,
      };
    }
    return {
      data: null,
      error: err instanceof Error ? err : new Error(String(err)),
      circuitOpen: false,
    };
  }
}

export function getAiBreakerStats() {
  return aiBreaker.getStats();
}
