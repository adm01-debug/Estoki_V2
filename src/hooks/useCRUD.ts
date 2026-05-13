 import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/lib/supabase';
 import { Database } from '@/integrations/supabase/types';
 import { logger } from '@/utils/logger';
import { toast } from 'sonner';

 type TableName = keyof Database['public']['Tables'];

export interface BaseEntity { id: string; created_at?: string; updated_at?: string; deleted_at?: string | null; }
export interface PaginatedResult<T> { data: T[]; total: number; page: number; pageSize: number; totalPages: number; }
export interface CRUDConfig<T> {
   tableName: TableName;
  orderBy?: { column: keyof T | string; ascending?: boolean };
  softDeleteColumn?: string;
  defaultFilters?: Record<string, unknown>;
  messages?: { createSuccess?: string; updateSuccess?: string; deleteSuccess?: string; error?: string };
}


export function useCRUD<T extends BaseEntity>(config: CRUDConfig<T>) {
  const { tableName, orderBy, softDeleteColumn = 'deleted_at', defaultFilters = {}, messages = {} } = config;
  const queryClient = useQueryClient();
  const queryKey = [tableName];

  const useList = (options?: { search?: string; searchColumns?: string[]; filters?: Record<string, unknown>; page?: number; pageSize?: number }) => {
    const { search = '', searchColumns = [], filters = {}, page = 1, pageSize = 20 } = options || {};
    return useQuery({
      queryKey: [...queryKey, 'list', { search, filters, page, pageSize }],
      queryFn: async (): Promise<PaginatedResult<T>> => {
         let query = supabase.from(tableName as any).select('*', { count: 'exact' });
        if (softDeleteColumn) query = query.is(softDeleteColumn, null);
        Object.entries({ ...defaultFilters, ...filters }).forEach(([key, value]) => {
           if (value !== undefined && value !== null && value !== '') query = (query as any).eq(key, value);
        });
        if (search && searchColumns.length > 0) {
          const orConditions = searchColumns.map(col => `${col}.ilike.%${search}%`).join(',');
          query = query.or(orConditions);
        }
        if (orderBy) query = query.order(String(orderBy.column), { ascending: orderBy.ascending ?? true });
        const from = (page - 1) * pageSize;
        query = query.range(from, from + pageSize - 1);
         try {
           const { data, error, count } = await query;
           if (error) throw error;
           return { data: (data || []) as unknown as T[], total: count || 0, page, pageSize, totalPages: Math.ceil((count || 0) / pageSize) };
         } catch (error) {
           logger.error(`Erro ao listar ${tableName}`, error, { filters, search, page });
           throw error;
         }
      },
    });
  };

  const useGetById = (id: string) => useQuery({
    queryKey: [...queryKey, id],
     queryFn: async () => {
       try {
         const { data, error } = await supabase.from(tableName as any).select('*').eq('id', id).single();
         if (error) throw error;
         return data as unknown as T;
       } catch (error) {
         logger.error(`Erro ao buscar ${tableName} por ID`, error, { id });
         throw error;
       }
     },
    enabled: !!id,
  });

  const createMutation = useMutation({
    mutationFn: async (newData: Partial<T>) => {
       try {
         const { data, error } = await supabase.from(tableName as any).insert(newData as any).select().single();
         if (error) throw error;
         logger.info(`Registro criado em ${tableName}`, { id: (data as any).id });
         return data as unknown as T;
       } catch (error) {
         logger.error(`Erro ao criar registro em ${tableName}`, error, { newData });
         throw error;
       }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success(messages.createSuccess || 'Registro criado!'); },
    onError: () => toast.error(messages.error || 'Erro ao criar registro'),
  });

  const updateMutation = useMutation({
     mutationFn: async ({ id, data: updateData }: { id: string; data: Partial<T> }) => {
       try {
         const { data, error } = await supabase.from(tableName as any).update(updateData as any).eq('id', id).select().single();
         if (error) throw error;
         logger.info(`Registro atualizado em ${tableName}`, { id });
         return data as unknown as T;
       } catch (error) {
         logger.error(`Erro ao atualizar registro em ${tableName}`, error, { id, updateData });
         throw error;
       }
     },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success(messages.updateSuccess || 'Registro atualizado!'); },
    onError: () => toast.error(messages.error || 'Erro ao atualizar registro'),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
       try {
         const { error } = await supabase.from(tableName as any).delete().eq('id', id);
         if (error) throw error;
         logger.info(`Registro removido de ${tableName}`, { id });
       } catch (error) {
         logger.error(`Erro ao remover registro de ${tableName}`, error, { id });
         throw error;
       }
     },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success(messages.deleteSuccess || 'Registro removido!'); },
    onError: () => toast.error(messages.error || 'Erro ao remover registro'),
  });

  const softDeleteMutation = useMutation({
    mutationFn: async (id: string) => {
       try {
         const { error } = await supabase.from(tableName as any).update({ [softDeleteColumn]: new Date().toISOString() } as any).eq('id', id);
         if (error) throw error;
         logger.info(`Registro arquivado em ${tableName}`, { id });
       } catch (error) {
         logger.error(`Erro ao arquivar registro em ${tableName}`, error, { id });
         throw error;
       }
     },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey }); toast.success('Registro arquivado!'); },
  });

  const bulkDelete = async (ids: string[]) => {
     try {
       const { error } = await supabase.from(tableName as any).delete().in('id', ids);
       if (error) throw error;
       queryClient.invalidateQueries({ queryKey });
       logger.info(`Exclusão em massa realizada em ${tableName}`, { count: ids.length });
       toast.success(`${ids.length} registros removidos!`);
     } catch (error) {
       logger.error(`Erro na exclusão em massa em ${tableName}`, error, { ids });
       toast.error('Erro na exclusão em massa');
     }
  };

  return {
    useList, useGetById, create: createMutation.mutate, update: updateMutation.mutate,
    delete: deleteMutation.mutate, softDelete: softDeleteMutation.mutate, bulkDelete,
    isCreating: createMutation.isPending, isUpdating: updateMutation.isPending, isDeleting: deleteMutation.isPending,
  };
}

export default useCRUD;
