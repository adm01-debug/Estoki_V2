import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useRecebimentos = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: recebimentos, isLoading, error, refetch } = useQuery({
    queryKey: ['recebimentos'],
    queryFn: async () => {
      const { data, error } = await supabase.from('recebimentos').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createRecebimento = useMutation({
    mutationFn: async (novo: any) => {
      const { data, error } = await supabase.from('recebimentos').insert(novo).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      toast({ title: 'Sucesso', description: 'Recebimento registrado!' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao registrar', variant: 'destructive' });
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('recebimentos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recebimentos' }, () => {
        queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return { recebimentos, isLoading, error, refetch, createRecebimento };
};
