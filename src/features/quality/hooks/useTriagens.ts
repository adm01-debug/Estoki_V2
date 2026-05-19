import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { triagemService } from '@/services/triagemService';
import type { Database } from '@/integrations/supabase/types';

type TriagemRow = Database['public']['Tables']['eventos_triagem']['Row'];
type TriagemInsert = Database['public']['Tables']['eventos_triagem']['Insert'];
type TriagemUpdate = Database['public']['Tables']['eventos_triagem']['Update'];

export const useTriagens = (options?: { enableRealtime?: boolean }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!options?.enableRealtime) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = supabase
      .channel('triagem-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos_triagem' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['triagens'] });
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [options?.enableRealtime, queryClient]);

  const { data: triagens, isLoading, error, refetch } = useQuery({
    queryKey: ['triagens'],
    queryFn: () => triagemService.getAll()
  });

  const createTriagem = useMutation({
    mutationFn: triagemService.create,
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
      return triagemService.update(id, dados as any);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triagens'] });
      toast({ title: 'Sucesso', description: 'Triagem atualizada!' });
    }
  });

  return { triagens, isLoading, error, refetch, createTriagem, updateTriagem };
};
