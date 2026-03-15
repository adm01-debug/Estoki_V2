// @ts-nocheck
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface SavedFilter {
  id: string;
  user_id: string;
  entity_type: string;
  name: string;
  filters: Record<string, any>;
  is_default: boolean;
  is_shared: boolean;
  description?: string;
  icon: string;
  color: string;
  usage_count: number;
  last_used_at?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateFilterInput {
  name: string;
  filters: Record<string, any>;
  description?: string;
  icon?: string;
  color?: string;
  is_shared?: boolean;
  is_default?: boolean;
}

export function useSavedFilters(entityType: string) {
  const queryClient = useQueryClient();
  const queryKey = ["saved-filters", entityType];

  const { data: filters = [], isLoading, error } = useQuery({
    queryKey,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("saved_filters")
        .select("*")
        .eq("entity_type", entityType)
        .order("usage_count", { ascending: false });

      if (error) throw error;
      return data as SavedFilter[];
    },
  });

  const defaultFilter = filters.find((f) => f.is_default);

  const saveMutation = useMutation({
    mutationFn: async (input: CreateFilterInput) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("saved_filters")
        .insert({
          user_id: user.id,
          entity_type: entityType,
          name: input.name,
          filters: input.filters,
          description: input.description,
          icon: input.icon || "filter",
          color: input.color || "blue",
          is_shared: input.is_shared || false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Filtro salvo com sucesso!");
    },
    onError: (error: Error) => {
      toast.error(`Erro ao salvar filtro: ${error.message}`);
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<SavedFilter> & { id: string }) => {
      const { data, error } = await supabase
        .from("saved_filters")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Filtro atualizado!");
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("saved_filters")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Filtro removido!");
    },
  });

  const setDefaultMutation = useMutation({
    mutationFn: async (id: string) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      await supabase
        .from("saved_filters")
        .update({ is_default: false })
        .eq("entity_type", entityType)
        .eq("user_id", user.id);

      const { error } = await supabase
        .from("saved_filters")
        .update({ is_default: true })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Filtro padrão definido!");
    },
  });

  const incrementUsage = async (id: string) => {
    await supabase.rpc("increment_filter_usage", { filter_id: id });
    queryClient.invalidateQueries({ queryKey });
  };

  const duplicateMutation = useMutation({
    mutationFn: async (filter: SavedFilter) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Usuário não autenticado");

      const { data, error } = await supabase
        .from("saved_filters")
        .insert({
          user_id: user.id,
          entity_type: entityType,
          name: `${filter.name} (cópia)`,
          filters: filter.filters,
          description: filter.description,
          icon: filter.icon,
          color: filter.color,
          is_shared: false,
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      toast.success("Filtro duplicado!");
    },
  });

  return {
    filters,
    defaultFilter,
    isLoading,
    error,
    saveFilter: saveMutation.mutate,
    updateFilter: updateMutation.mutate,
    deleteFilter: deleteMutation.mutate,
    setDefault: setDefaultMutation.mutate,
    duplicateFilter: duplicateMutation.mutate,
    incrementUsage,
    isSaving: saveMutation.isPending,
    isDeleting: deleteMutation.isPending,
  };
}
