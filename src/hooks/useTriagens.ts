import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type TriagemRow = Database['public']['Tables']['eventos_triagem']['Row'];
type TriagemInsert = Database['public']['Tables']['eventos_triagem']['Insert'];
type TriagemUpdate = Database['public']['Tables']['eventos_triagem']['Update'];

export const useTriagens = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: triagens, isLoading, error, refetch } = useQuery({
    queryKey: ['triagens'],
    queryFn: async () => {
      const { data, error } = await supabase.from('eventos_triagem').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createTriagem = useMutation({
    mutationFn: async (novaTriagem: TriagemInsert) => {
      const { data, error } = await supabase.from('eventos_triagem').insert(novaTriagem).select().single();
      if (error) throw error;
      return data as TriagemRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triagens'] });
      toast({ title: 'Sucesso', description: 'Triagem registrada!' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao registrar triagem', variant: 'destructive' });
    }
  });

  const updateTriagem = useMutation({
    mutationFn: async ({ id, ...dados }: TriagemUpdate & { id: string }) => {
      const { data, error } = await supabase.from('eventos_triagem').update(dados).eq('id', id).select().single();
      if (error) throw error;
      return data as TriagemRow;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triagens'] });
      toast({ title: 'Sucesso', description: 'Triagem atualizada!' });
    }
  });


  return { triagens, isLoading, error, refetch, createTriagem, updateTriagem };
};
