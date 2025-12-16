import { useEffect, useCallback } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface RealtimeKPIOptions {
  onMetricUpdate?: () => void;
  onPositionUpdate?: () => void;
  onTriageUpdate?: () => void;
  onPickingUpdate?: () => void;
  onTaskUpdate?: () => void;
}

export function useRealtimeKPIs(options: RealtimeKPIOptions = {}) {
  const queryClient = useQueryClient();

  const invalidateQueries = useCallback((queryKeys: string[][]) => {
    queryKeys.forEach(key => {
      queryClient.invalidateQueries({ queryKey: key });
    });
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
          invalidateQueries([["metricas_operacionais"]]);
          options.onMetricUpdate?.();
          
          if (payload.eventType === "INSERT") {
            toast.info("Novas métricas disponíveis", {
              description: "Os KPIs foram atualizados automaticamente",
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
            ["posicoes_estoque_count"],
            ["ocupacao_por_porta_palete"],
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
          invalidateQueries([["triagem_por_produto"]]);
          options.onTriageUpdate?.();
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
          invalidateQueries([["metricas_operacionais"]]);
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
          invalidateQueries([["tarefas"], ["ondas_separacao"]]);
          options.onTaskUpdate?.();
        }
      )
      .subscribe((status) => {
        console.log("[Realtime KPIs] Subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log("[Realtime KPIs] Successfully subscribed to all channels");
        }
      });

    return () => {
      console.log("[Realtime KPIs] Cleaning up subscriptions...");
      supabase.removeChannel(channel);
    };
  }, [invalidateQueries, options]);
}
