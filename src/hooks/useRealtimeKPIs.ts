import { useEffect, useCallback, useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RealtimeKPIOptions {
  onMetricUpdate?: () => void;
  onPositionUpdate?: () => void;
  onTriageUpdate?: () => void;
  onPickingUpdate?: () => void;
  onTaskUpdate?: () => void;
  onLoteUpdate?: () => void;
  showToasts?: boolean;
}

interface RealtimeStatus {
  isConnected: boolean;
  lastUpdate: Date | null;
  updatesCount: number;
}

export function useRealtimeKPIs(options: RealtimeKPIOptions = {}) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<RealtimeStatus>({
    isConnected: false,
    lastUpdate: null,
    updatesCount: 0,
  });

  const showToasts = options.showToasts ?? false;

  // Debounced invalidation — batches rapid updates into a single invalidation
  const pendingKeysRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const invalidateQueries = useCallback((queryKeys: string[][]) => {
    queryKeys.forEach(key => {
      pendingKeysRef.current.add(JSON.stringify(key));
    });

    // Debounce: batch invalidations within 300ms window
    if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
    debounceTimerRef.current = setTimeout(() => {
      const keys = Array.from(pendingKeysRef.current);
      pendingKeysRef.current.clear();
      keys.forEach(keyStr => {
        queryClient.invalidateQueries({ queryKey: JSON.parse(keyStr) });
      });
      setStatus(prev => ({
        ...prev,
        lastUpdate: new Date(),
        updatesCount: prev.updatesCount + 1,
      }));
    }, 300);
  }, [queryClient]);

  useEffect(() => {
    const channel = supabase
      .channel("kpi-realtime-updates")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "metricas_operacionais" },
        (payload) => {
          invalidateQueries([["metricas_operacionais"], ["dashboard"]]);
          options.onMetricUpdate?.();
          if (showToasts && payload.eventType === "INSERT") {
            toast.info("KPIs atualizados", { duration: 3000 });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "posicoes_estoque" },
        () => {
          invalidateQueries([
            ["posicoes_estoque"],
            ["posicoes_estoque_count"],
            ["ocupacao_por_porta_palete"],
            ["dashboard"],
          ]);
          options.onPositionUpdate?.();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "estoque_posicao" },
        () => {
          invalidateQueries([
            ["estoque_posicao"],
            ["posicoes_estoque"],
            ["dashboard"],
          ]);
          options.onPositionUpdate?.();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "eventos_triagem" },
        (payload) => {
          invalidateQueries([
            ["triagem_por_produto"],
            ["eventos_triagem"],
            ["dashboard"],
          ]);
          options.onTriageUpdate?.();
          if (showToasts && payload.eventType === "INSERT") {
            toast.success("Triagem registrada", { duration: 2000 });
          }
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "eventos_picking" },
        () => {
          invalidateQueries([["metricas_operacionais"], ["eventos_picking"], ["dashboard"]]);
          options.onPickingUpdate?.();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tarefas" },
        () => {
          invalidateQueries([["tarefas"], ["ondas_separacao"], ["dashboard"]]);
          options.onTaskUpdate?.();
        }
      )
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "lotes" },
        (payload) => {
          invalidateQueries([["lotes"], ["recebimentos"], ["dashboard"]]);
          options.onLoteUpdate?.();
          if (showToasts && payload.eventType === "INSERT") {
            toast.info("Novo lote recebido", { duration: 2000 });
          }
        }
      )
       .on(
         "postgres_changes",
         { event: "*", schema: "public", table: "alertas_historico" },
         () => {
           invalidateQueries([["alertas"], ["alertas_historico"], ["dashboard"]]);
         }
       )
       .on(
         "postgres_changes",
         { event: "*", schema: "public", table: "rastreamento_historico" },
         () => {
           invalidateQueries([["rastreamento_historico"], ["atividades_recentes"], ["dashboard"]]);
         }
       )
      .subscribe((subscriptionStatus) => {
        const isConnected = subscriptionStatus === "SUBSCRIBED";
        setStatus(prev => ({ ...prev, isConnected }));
      });

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      supabase.removeChannel(channel);
      setStatus(prev => ({ ...prev, isConnected: false }));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invalidateQueries, showToasts]);

  return status;
}
