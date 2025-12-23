import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useEstoque = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: posicoes, isLoading, error, refetch } = useQuery({
    queryKey: ['estoque-posicoes'],
    queryFn: async () => {
      const { data, error } = await supabase.from('posicoes_estoque').select('*').order('codigo');
      if (error) throw error;
      return data;
    }
  });

  const createPosicao = useMutation({
    mutationFn: async (novaPosicao: any) => {
      const { data, error } = await supabase.from('posicoes_estoque').insert(novaPosicao).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque-posicoes'] });
      toast({ title: 'Sucesso', description: 'Posição criada com sucesso!' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao criar posição', variant: 'destructive' });
    }
  });

  const updatePosicao = useMutation({
    mutationFn: async ({ id, ...dados }: any) => {
      const { data, error } = await supabase.from('posicoes_estoque').update(dados).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque-posicoes'] });
      toast({ title: 'Sucesso', description: 'Posição atualizada!' });
    }
  });

  const deletePosicao = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('posicoes_estoque').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque-posicoes'] });
      toast({ title: 'Sucesso', description: 'Posição removida!' });
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('estoque-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posicoes_estoque' }, () => {
        queryClient.invalidateQueries({ queryKey: ['estoque-posicoes'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return { posicoes, isLoading, error, refetch, createPosicao, updatePosicao, deletePosicao };
};
