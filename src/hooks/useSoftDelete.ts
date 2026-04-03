import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface SoftDeleteOptions {
  table: string;
  queryKey: string[];
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

export function useSoftDelete(options: SoftDeleteOptions) {
  const { table, queryKey, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  const softDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from(table as any) as any)
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Registro removido!");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao remover: ${error.message}`);
      onError?.(error);
    },
  });

  const restoreMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await (supabase
        .from(table as any) as any)
        .update({ deleted_at: null })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Registro restaurado!");
      onSuccess?.();
    },
    onError: (error: Error) => {
      toast.error(`Erro ao restaurar: ${error.message}`);
      onError?.(error);
    },
  });

  return {
    softDelete: softDeleteMutation.mutate,
    restore: restoreMutation.mutate,
    isDeleting: softDeleteMutation.isPending,
    isRestoring: restoreMutation.isPending,
  };
}
