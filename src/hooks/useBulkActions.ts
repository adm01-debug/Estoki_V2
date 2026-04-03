import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export type BulkActionType = "delete" | "update" | "duplicate" | "export" | "restore" | "archive";

export interface BulkAction<T> {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link';
  confirm?: {
    title: string;
    description: string;
  };
  handler?: (items: T[]) => Promise<void>;
}

interface BulkActionOptions {
  table: string;
  queryKey: string[];
  onSuccess?: (action: BulkActionType, count: number) => void;
  onError?: (action: BulkActionType, error: Error) => void;
}

export function useBulkActions<T extends { id: string }>(options: BulkActionOptions) {
  const { table, queryKey, onSuccess, onError } = options;
  const queryClient = useQueryClient();

  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);

  const toggleSelection = useCallback((id: string) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }, []);

  const selectAll = useCallback((ids: string[]) => {
    setSelectedIds(new Set(ids));
  }, []);

  const clearSelection = useCallback(() => {
    setSelectedIds(new Set());
  }, []);

  const isSelected = useCallback(
    (id: string) => selectedIds.has(id),
    [selectedIds]
  );

  const bulkDeleteMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      setIsProcessing(true);
      setProgress(0);

      const batchSize = 50;
      const batches = Math.ceil(ids.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const batch = ids.slice(i * batchSize, (i + 1) * batchSize);
        const { error } = await (supabase
          .from(table as any) as any)
          .delete()
          .in("id", batch);

        if (error) throw error;
        setProgress(((i + 1) / batches) * 100);
      }

      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(`${count} registro(s) excluído(s)`);
      onSuccess?.("delete", count);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao excluir: ${error.message}`);
      onError?.("delete", error);
    },
    onSettled: () => {
      setIsProcessing(false);
      setProgress(0);
    },
  });

  const bulkUpdateMutation = useMutation({
    mutationFn: async ({
      ids,
      updates,
    }: {
      ids: string[];
      updates: Partial<T>;
    }) => {
      setIsProcessing(true);
      setProgress(0);

      const batchSize = 50;
      const batches = Math.ceil(ids.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const batch = ids.slice(i * batchSize, (i + 1) * batchSize);
        const { error } = await (supabase
          .from(table as any) as any)
          .update(updates)
          .in("id", batch);

        if (error) throw error;
        setProgress(((i + 1) / batches) * 100);
      }

      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(`${count} registro(s) atualizado(s)`);
      onSuccess?.("update", count);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao atualizar: ${error.message}`);
      onError?.("update", error);
    },
    onSettled: () => {
      setIsProcessing(false);
      setProgress(0);
    },
  });

  const bulkDuplicateMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      setIsProcessing(true);
      setProgress(0);

      const { data: records, error: fetchError } = await (supabase
        .from(table as any) as any)
        .select("*")
        .in("id", ids);

      if (fetchError) throw fetchError;

      const duplicates = (records as any[]).map((record: any) => {
        const { id, created_at, updated_at, ...rest } = record;
        return {
          ...rest,
          name: record.name ? `${record.name} (cópia)` : undefined,
        };
      });

      const batchSize = 50;
      const batches = Math.ceil(duplicates.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const batch = duplicates.slice(i * batchSize, (i + 1) * batchSize);
        const { error } = await (supabase.from(table as any) as any).insert(batch);

        if (error) throw error;
        setProgress(((i + 1) / batches) * 100);
      }

      return duplicates.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(`${count} registro(s) duplicado(s)`);
      onSuccess?.("duplicate", count);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao duplicar: ${error.message}`);
      onError?.("duplicate", error);
    },
    onSettled: () => {
      setIsProcessing(false);
      setProgress(0);
    },
  });

  const bulkRestoreMutation = useMutation({
    mutationFn: async (ids: string[]) => {
      setIsProcessing(true);
      setProgress(0);

      const batchSize = 50;
      const batches = Math.ceil(ids.length / batchSize);

      for (let i = 0; i < batches; i++) {
        const batch = ids.slice(i * batchSize, (i + 1) * batchSize);
        const { error } = await (supabase
          .from(table as any) as any)
          .update({ deleted_at: null })
          .in("id", batch);

        if (error) throw error;
        setProgress(((i + 1) / batches) * 100);
      }

      return ids.length;
    },
    onSuccess: (count) => {
      queryClient.invalidateQueries({ queryKey });
      clearSelection();
      toast.success(`${count} registro(s) restaurado(s)`);
      onSuccess?.("restore", count);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao restaurar: ${error.message}`);
      onError?.("restore", error);
    },
    onSettled: () => {
      setIsProcessing(false);
      setProgress(0);
    },
  });

  return {
    selectedIds: Array.from(selectedIds),
    selectedCount: selectedIds.size,
    isProcessing,
    progress,
    toggleSelection,
    selectAll,
    clearSelection,
    isSelected,
    bulkDelete: (ids?: string[]) =>
      bulkDeleteMutation.mutate(ids || Array.from(selectedIds)),
    bulkUpdate: (updates: Partial<T>, ids?: string[]) =>
      bulkUpdateMutation.mutate({
        ids: ids || Array.from(selectedIds),
        updates,
      }),
    bulkDuplicate: (ids?: string[]) =>
      bulkDuplicateMutation.mutate(ids || Array.from(selectedIds)),
    bulkRestore: (ids?: string[]) =>
      bulkRestoreMutation.mutate(ids || Array.from(selectedIds)),
    isDeleting: bulkDeleteMutation.isPending,
    isUpdating: bulkUpdateMutation.isPending,
    isDuplicating: bulkDuplicateMutation.isPending,
    isRestoring: bulkRestoreMutation.isPending,
  };
}
