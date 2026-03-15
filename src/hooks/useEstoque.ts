import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useCallback } from 'react';
import { useToast } from '@/hooks/use-toast';

export type StatusPosicao = 'livre' | 'ocupado' | 'reservado' | 'bloqueado';
export type TipoPosicao = 'porta_palete' | 'box';

export interface PosicaoEstoque {
  id: string;
  codigo: string;
  tipo: TipoPosicao;
  status: StatusPosicao;
  zona?: string | null;
  secao?: string | null;
  nivel?: string | null;
  porta_palete?: string | null;
  box?: string | null;
  capacidade_kg?: number | null;
  created_at: string;
  updated_at: string;
}

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

  const getEstatisticas = useCallback(() => {
    const lista = posicoes || [];
    const total = lista.length;
    const ocupadas = lista.filter((p: any) => p.status === 'ocupado').length;
    const livres = lista.filter((p: any) => p.status === 'livre').length;
    const bloqueadas = lista.filter((p: any) => p.status === 'bloqueado').length;
    const reservadas = lista.filter((p: any) => p.status === 'reservado').length;
    const taxaOcupacao = total > 0 ? (ocupadas / total) * 100 : 0;

    return {
      total,
      ocupadas,
      livres,
      bloqueadas,
      reservadas,
      taxaOcupacao,
      // Legacy aliases
      totalPosicoes: total,
      posicoesOcupadas: ocupadas,
      posicoesLivres: livres,
      posicoesBloqueadas: bloqueadas,
    };
  }, [posicoes]);

  return {
    posicoes,
    loading: isLoading,
    isLoading,
    error,
    refetch,
    createPosicao,
    updatePosicao,
    deletePosicao,
    getEstatisticas,
  };
};
