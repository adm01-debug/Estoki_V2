import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { pickingService } from "../services/pickingService";
import type { PickingTask } from "../types";
export type { PickingTask };

export function usePicking(options?: { enableRealtime?: boolean }) {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!options?.enableRealtime) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = supabase
      .channel("picking-tasks-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "tarefas", filter: "tipo=eq.separacao" },
        () => {
          queryClient.invalidateQueries({ queryKey: ["picking-tasks"] });
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [options?.enableRealtime, queryClient]);

  const {
    data: tasks = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ["picking-tasks"],
    queryFn: pickingService.getTasks,
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({
      taskId,
      status,
      qty,
    }: {
      taskId: string;
      status: string;
      qty?: number;
    }) => {
      return pickingService.updateTaskStatus(taskId, status, user?.id, qty);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["picking-tasks"] });
      toast.success("Tarefa atualizada com sucesso!");
    },
    onError: (err: Error) => {
      toast.error(`Erro ao atualizar tarefa: ${err.message}`);
    },
  });

  return {
    tasks,
    isLoading,
    error,
    refetch,
    startTask: (taskId: string) => updateTaskStatus.mutate({ taskId, status: "em_andamento" }),
    finishTask: (taskId: string, qty: number) =>
      updateTaskStatus.mutate({ taskId, status: "concluido", qty }),
    cancelTask: (taskId: string) => updateTaskStatus.mutate({ taskId, status: "cancelado" }),
  };
}
