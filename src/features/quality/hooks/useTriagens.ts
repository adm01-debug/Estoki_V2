import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { qualityService } from '@/services/qualityService';
import type { Database } from '@/integrations/supabase/types';

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

  const { data: triagens = [], isLoading, error, refetch } = useQuery({
    queryKey: ['triagens'],
    queryFn: qualityService.getAll
  });

  const createTriagem = useMutation({
    mutationFn: qualityService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triagens'] });
      toast({ title: 'Sucesso', description: 'Triagem iniciada!' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao iniciar triagem', variant: 'destructive' });
    }
  });

  const updateTriagem = useMutation({
    mutationFn: async ({ id, ...dados }: TriagemUpdate & { id: string }) => {
      return qualityService.update(id, dados);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['triagens'] });
      toast({ title: 'Sucesso', description: 'Triagem atualizada!' });
    }
  });

  return { triagens, isLoading, error, refetch, createTriagem, updateTriagem };
};
