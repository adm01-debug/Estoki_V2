import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface DuplicateOptions<T> {
  table: string;
  queryKey: string[];
  excludeFields?: string[];
  transformData?: (data: T) => Partial<T>;
  nameField?: string;
  nameSuffix?: string;
  onSuccess?: (newRecord: T) => void;
  onError?: (error: Error) => void;
}

const DEFAULT_EXCLUDE_FIELDS = [
  "id",
  "created_at",
  "updated_at",
  "deleted_at",
];

export function useDuplicate<T extends Record<string, any>>(
  options: DuplicateOptions<T>
) {
  const {
    table,
    queryKey,
    excludeFields = [],
    transformData,
    nameField = "name",
    nameSuffix = " (cópia)",
    onSuccess,
    onError,
  } = options;

  const queryClient = useQueryClient();

  const allExcludeFields = [...DEFAULT_EXCLUDE_FIELDS, ...excludeFields];

  const duplicateMutation = useMutation({
    mutationFn: async (sourceId: string) => {
      const { data: sourceRecord, error: fetchError } = await supabase
        .from(table as any)
        .select("*")
        .eq("id", sourceId)
        .single();

      if (fetchError) throw fetchError;
      if (!sourceRecord) throw new Error("Registro não encontrado");

      let newData = { ...(sourceRecord as any) } as any;

      allExcludeFields.forEach((field) => {
        delete newData[field];
      });

      if (nameField && newData[nameField]) {
        newData[nameField] = `${newData[nameField]}${nameSuffix}`;
      }

      if (transformData) {
        newData = { ...newData, ...transformData(sourceRecord as unknown as T) };
      }

      const { data: newRecord, error: insertError } = await supabase
        .from(table as any)
        .insert(newData)
        .select()
        .single();

      if (insertError) throw insertError;
      return newRecord as unknown as T;
    },
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Registro duplicado com sucesso!");
      onSuccess?.(newRecord);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao duplicar: ${error.message}`);
      onError?.(error);
    },
  });

  const duplicateWithRelationsMutation = useMutation({
    mutationFn: async ({
      sourceId,
      relations,
    }: {
      sourceId: string;
      relations: Array<{
        table: string;
        foreignKey: string;
        excludeFields?: string[];
      }>;
    }) => {
      const { data: sourceRecord, error: fetchError } = await supabase
        .from(table as any)
        .select("*")
        .eq("id", sourceId)
        .single();

      if (fetchError) throw fetchError;

      let newData = { ...sourceRecord } as any;
      allExcludeFields.forEach((field) => {
        delete newData[field];
      });

      if (nameField && newData[nameField]) {
        newData[nameField] = `${newData[nameField]}${nameSuffix}`;
      }

      if (transformData) {
        newData = { ...newData, ...transformData(sourceRecord as unknown as T) };
      }

      const { data: newRecord, error: insertError } = await supabase
        .from(table as any)
        .insert(newData)
        .select()
        .single();

      if (insertError) throw insertError;

      for (const relation of relations) {
        const { data: relatedRecords } = await supabase
          .from(relation.table as any)
          .select("*")
          .eq(relation.foreignKey, sourceId);

        if (relatedRecords && relatedRecords.length > 0) {
          const newRelatedRecords = relatedRecords.map((record: any) => {
            const newRelRecord = { ...record };
            [...DEFAULT_EXCLUDE_FIELDS, ...(relation.excludeFields || [])].forEach(
              (field) => delete newRelRecord[field]
            );
            newRelRecord[relation.foreignKey] = (newRecord as any).id;
            return newRelRecord;
          });

          await supabase.from(relation.table as any).insert(newRelatedRecords as any);
        }
      }

      return newRecord as unknown as T;
    },
    onSuccess: (newRecord) => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Registro e relacionamentos duplicados!");
      onSuccess?.(newRecord);
    },
    onError: (error: Error) => {
      toast.error(`Erro ao duplicar: ${error.message}`);
      onError?.(error);
    },
  });

  return {
    duplicate: duplicateMutation.mutate,
    duplicateWithRelations: duplicateWithRelationsMutation.mutate,
    isDuplicating:
      duplicateMutation.isPending || duplicateWithRelationsMutation.isPending,
  };
}
