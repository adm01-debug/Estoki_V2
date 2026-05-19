import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { receivingService } from '@/services/receivingService';

export const useRecebimentos = (options?: { enableRealtime?: boolean }) => {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!options?.enableRealtime) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = supabase
      .channel('receiving-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lotes' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [options?.enableRealtime, queryClient]);

  const { data: recebimentos, isLoading, error, refetch } = useQuery({
    queryKey: ['recebimentos'],
    queryFn: receivingService.getRecebimentos,
    staleTime: 1000 * 60 * 2, // 2 minutes
    gcTime: 1000 * 60 * 10, // 10 minutes
  });

  const createRecebimento = useMutation({
    mutationFn: (novo: any) => {
      const payload = {
        ...novo,
        quantidade_inicial: novo.quantidade || novo.quantidade_inicial,
        quantidade_atual: novo.quantidade || novo.quantidade_atual,
      };
      return receivingService.createRecebimento(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      toast({ title: 'Sucesso', description: 'Recebimento registrado!' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao registrar', variant: 'destructive' });
    }
  });

  return { recebimentos, isLoading, error, refetch, createRecebimento };
};
