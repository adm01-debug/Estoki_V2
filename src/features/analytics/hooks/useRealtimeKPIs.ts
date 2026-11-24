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

  // Debounced invalidation — batches rapid updates into a single invalidation.
  // As chaves abaixo precisam ser as queryKeys reais do app (E-154):
  // invalidar chave inexistente nao invalida nada.
  const pendingKeysRef = useRef<Set<string>>(new Set());
  const debounceTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const invalidateQueries = useCallback(
    (queryKeys: string[][]) => {
      queryKeys.forEach((key) => {
        pendingKeysRef.current.add(JSON.stringify(key));
      });

      // Debounce: batch invalidations within 300ms window
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      debounceTimerRef.current = setTimeout(() => {
        const keys = Array.from(pendingKeysRef.current);
        pendingKeysRef.current.clear();
        keys.forEach((keyStr) => {
          queryClient.invalidateQueries({ queryKey: JSON.parse(keyStr) });
        });
        setStatus((prev) => ({
          ...prev,
          lastUpdate: new Date(),
          updatesCount: prev.updatesCount + 1,
        }));
      }, 300);
    },
    [queryClient]
  );

  const optionsRef = useRef(options);
  useEffect(() => {
    optionsRef.current = options;
  }, [options]);

  useEffect(() => {
    const channel = supabase
      .channel(`kpi-realtime-updates-${Math.random().toString(36).slice(2)}`)
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "metricas_operacionais" },
        (payload) => {
          invalidateQueries([["metricas-operacionais"], ["metas-kpi"]]);
          optionsRef.current.onMetricUpdate?.();
          if (optionsRef.current.showToasts && payload.eventType === "INSERT") {
            toast.info("KPIs atualizados", { duration: 3000 });
          }
        }
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "posicoes_estoque" }, () => {
        invalidateQueries([
          ["estoque-posicoes"],
          ["ocupacao-visual-v2"],
          ["operational-live"],
          ["dashboard-stats"],
        ]);
        optionsRef.current.onPositionUpdate?.();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "estoque_posicao" }, () => {
        invalidateQueries([["estoque-posicoes"], ["posicao-detalhe"], ["dashboard-stats"]]);
        optionsRef.current.onPositionUpdate?.();
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "eventos_triagem" },
        (payload) => {
          invalidateQueries([
            ["triagens"],
            ["fornecedor-scores"],
            ["dashboard-stats"],
            ["operational-live"],
          ]);
          optionsRef.current.onTriageUpdate?.();
          if (optionsRef.current.showToasts && payload.eventType === "INSERT") {
            toast.success("Triagem registrada", { duration: 2000 });
          }
        }
      )
      .on("postgres_changes", { event: "*", schema: "public", table: "eventos_picking" }, () => {
        invalidateQueries([["operational-live"], ["picking-tasks"]]);
        optionsRef.current.onPickingUpdate?.();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "tarefas" }, () => {
        invalidateQueries([
          ["tarefas"],
          ["picking-tasks"],
          ["putaway-tasks"],
          ["operational-live"],
        ]);
        optionsRef.current.onTaskUpdate?.();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "lotes" }, (payload) => {
        invalidateQueries([
          ["recebimentos"],
          ["lotes-list"],
          ["kanban-lotes"],
          ["curva-abc"],
          ["dashboard-stats"],
          ["operational-live"],
        ]);
        optionsRef.current.onLoteUpdate?.();
        if (optionsRef.current.showToasts && payload.eventType === "INSERT") {
          toast.info("Novo lote recebido", { duration: 2000 });
        }
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "alertas_historico" }, () => {
        invalidateQueries([["alertas_historico"], ["operational-live"]]);
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rastreamento_historico" },
        () => {
          invalidateQueries([["rastreamento_historico"], ["curva-abc"], ["dashboard-stats"]]);
        }
      )
      .subscribe((subscriptionStatus) => {
        const isConnected = subscriptionStatus === "SUBSCRIBED";
        setStatus((prev) => ({ ...prev, isConnected }));
      });

    return () => {
      if (debounceTimerRef.current) clearTimeout(debounceTimerRef.current);
      supabase.removeChannel(channel);
      setStatus((prev) => ({ ...prev, isConnected: false }));
    };
  }, [invalidateQueries]);

  return status;
}
