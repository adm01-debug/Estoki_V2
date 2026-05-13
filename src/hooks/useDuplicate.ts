 import { useMutation, useQueryClient } from "@tanstack/react-query";
 import { supabase } from "@/integrations/supabase/client";
 import { toast } from "sonner";
 import { Database } from "@/integrations/supabase/types";
 
 type TableName = keyof Database['public']['Tables'];
 
 interface DuplicateOptions<T extends Record<string, unknown>> {
   table: TableName;
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

 export function useDuplicate<T extends Record<string, unknown>>(
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
         .from(table)
         .select("*")
         .eq("id" as never, sourceId as never)
         .single();
 
       if (fetchError) throw fetchError;
       if (!sourceRecord) throw new Error("Registro não encontrado");
 
       const newData = { ...(sourceRecord as Record<string, unknown>) };
 
       allExcludeFields.forEach((field) => {
         delete newData[field];
       });
 
       if (nameField && newData[nameField]) {
         newData[nameField] = `${String(newData[nameField])}${nameSuffix}`;
       }
 
       let finalData = newData;
       if (transformData) {
         finalData = { ...newData, ...transformData(sourceRecord as unknown as T) };
       }
 
       const { data: newRecord, error: insertError } = await supabase
         .from(table)
         .insert(finalData as any)
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
         table: TableName;
         foreignKey: string;
         excludeFields?: string[];
       }>;
     }) => {
       const { data: sourceRecord, error: fetchError } = await supabase
         .from(table)
         .select("*")
         .eq("id" as never, sourceId as never)
         .single();
 
       if (fetchError) throw fetchError;
       if (!sourceRecord) throw new Error("Registro não encontrado");
 
       const newData = { ...(sourceRecord as Record<string, unknown>) };
       allExcludeFields.forEach((field) => {
         delete newData[field];
       });
 
       if (nameField && newData[nameField]) {
         newData[nameField] = `${String(newData[nameField])}${nameSuffix}`;
       }
 
       let finalData = newData;
       if (transformData) {
         finalData = { ...newData, ...transformData(sourceRecord as unknown as T) };
       }
 
       const { data: newRecord, error: insertError } = await supabase
         .from(table)
         .insert(finalData as any)
         .select()
         .single();
 
       if (insertError) throw insertError;
 
       for (const relation of relations) {
         const { data: relatedRecords } = await supabase
           .from(relation.table)
           .select("*")
           .eq(relation.foreignKey as never, sourceId as never);
 
         if (relatedRecords && relatedRecords.length > 0) {
           const newRelatedRecords = relatedRecords.map((record: Record<string, unknown>) => {
             const newRelRecord = { ...record };
             [...DEFAULT_EXCLUDE_FIELDS, ...(relation.excludeFields || [])].forEach(
               (field) => delete newRelRecord[field]
             );
             newRelRecord[relation.foreignKey] = (newRecord as Record<string, unknown>).id;
             return newRelRecord;
           });
 
           await supabase.from(relation.table).insert(newRelatedRecords as any);
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
