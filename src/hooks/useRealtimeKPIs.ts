import { useEffect, useCallback, useState } from "react";
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

  const invalidateQueries = useCallback((queryKeys: string[][]) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
    setStatus(prev => ({
      ...prev,
      lastUpdate: new Date(),
      updatesCount: prev.updatesCount + 1,
    }));
  }, [queryClient]);

  useEffect(() => {
    console.log("[Realtime KPIs] Setting up realtime subscriptions...");

    const channel = supabase
      .channel("kpi-realtime-updates")
      // Listen to metricas_operacionais changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "metricas_operacionais",
        },
        (payload) => {
          console.log("[Realtime] Metrics update:", payload.eventType);
          invalidateQueries([["metricas_operacionais"], ["dashboard"]]);
          options.onMetricUpdate?.();
          
          if (showToasts && payload.eventType === "INSERT") {
            toast.info("KPIs atualizados", {
              description: "Métricas operacionais atualizadas automaticamente",
              duration: 3000,
            });
          }
        }
      )
      // Listen to posicoes_estoque changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "posicoes_estoque",
        },
        (payload) => {
          console.log("[Realtime] Position update:", payload.eventType);
          invalidateQueries([
            ["posicoes_estoque"],
            ["posicoes_estoque_count"],
            ["ocupacao_por_porta_palete"],
            ["dashboard"],
          ]);
          options.onPositionUpdate?.();
        }
      )
      // Listen to estoque_posicao changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "estoque_posicao",
        },
        (payload) => {
          console.log("[Realtime] Stock position update:", payload.eventType);
          invalidateQueries([
            ["estoque_posicao"],
            ["posicoes_estoque"],
            ["dashboard"],
          ]);
          options.onPositionUpdate?.();
        }
      )
      // Listen to eventos_triagem changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "eventos_triagem",
        },
        (payload) => {
          console.log("[Realtime] Triage event update:", payload.eventType);
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
      // Listen to eventos_picking changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "eventos_picking",
        },
        (payload) => {
          console.log("[Realtime] Picking event update:", payload.eventType);
          invalidateQueries([["metricas_operacionais"], ["eventos_picking"], ["dashboard"]]);
          options.onPickingUpdate?.();
        }
      )
      // Listen to tarefas changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "tarefas",
        },
        (payload) => {
          console.log("[Realtime] Task update:", payload.eventType);
          invalidateQueries([["tarefas"], ["ondas_separacao"], ["dashboard"]]);
          options.onTaskUpdate?.();
        }
      )
      // Listen to lotes changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "lotes",
        },
        (payload) => {
          console.log("[Realtime] Lote update:", payload.eventType);
          invalidateQueries([["lotes"], ["recebimentos"], ["dashboard"]]);
          options.onLoteUpdate?.();
          
          if (showToasts && payload.eventType === "INSERT") {
            toast.info("Novo lote recebido", { duration: 2000 });
          }
        }
      )
      // Listen to alertas_historico changes
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "alertas_historico",
        },
        (payload) => {
          console.log("[Realtime] Alert update:", payload.eventType);
          invalidateQueries([["alertas"], ["alertas_historico"], ["dashboard"]]);
        }
      )
      .subscribe((subscriptionStatus) => {
        console.log("[Realtime KPIs] Subscription status:", subscriptionStatus);
        const isConnected = subscriptionStatus === "SUBSCRIBED";
        setStatus(prev => ({ ...prev, isConnected }));
        
        if (isConnected) {
          console.log("[Realtime KPIs] Successfully subscribed to all channels");
        }
      });

    return () => {
      console.log("[Realtime KPIs] Cleaning up subscriptions...");
      supabase.removeChannel(channel);
      setStatus(prev => ({ ...prev, isConnected: false }));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [invalidateQueries, showToasts]);

  return status;
}
