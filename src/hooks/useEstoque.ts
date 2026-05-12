import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useCallback, useMemo } from 'react';
import { useToast } from '@/hooks/use-toast';
import type { Database } from '@/integrations/supabase/types';

type PosicaoInsert = Database['public']['Tables']['posicoes_estoque']['Insert'];
type PosicaoUpdate = Database['public']['Tables']['posicoes_estoque']['Update'];

export type StatusPosicao = 'livre' | 'ocupado' | 'reservado' | 'bloqueado';
export type TipoPosicao = 'porta_palete' | 'box';

 export interface SaldoPosicao {
   id: string;
   produto_id: string;
   lote_id: string | null;
   quantidade: number;
   data_entrada: string;
   produto?: {
     nome: string;
     sku: string;
     categoria?: string;
   };
   lote?: {
     numero_lote: string;
     data_validade?: string;
   };
 }
 
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
   saldos?: SaldoPosicao[];
}

export const useEstoque = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: posicoes, isLoading, error, refetch } = useQuery({
    queryKey: ['estoque-posicoes'],
    queryFn: async () => {
       const { data, error } = await supabase
         .from('posicoes_estoque')
         .select(`
           *,
           saldos:estoque_posicao(
             *,
             produto:produtos(nome, sku, categoria),
             lote:lotes(numero_lote, data_validade)
           )
         `)
         .order('codigo');
 
      if (error) throw error;
       return data as PosicaoEstoque[];
    }
  });

  const createPosicao = useMutation({
    mutationFn: async (novaPosicao: PosicaoInsert) => {
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
     mutationFn: async ({ id, ids, ...dados }: (PosicaoUpdate & { id?: string; ids?: string[] })) => {
       if (ids && ids.length > 0) {
         const { data, error } = await supabase.from('posicoes_estoque').update(dados).in('id', ids).select();
         if (error) throw error;
         return data;
       } else if (id) {
         const { data, error } = await supabase.from('posicoes_estoque').update(dados).eq('id', id).select().single();
         if (error) throw error;
         return data;
       }
       throw new Error('ID ou lista de IDs não fornecida para atualização');
     },
     onSuccess: (data, variables) => {
       queryClient.invalidateQueries({ queryKey: ['estoque-posicoes'] });
       const count = Array.isArray(data) ? data.length : 1;
       toast({ 
         title: 'Sucesso', 
         description: count > 1 ? `${count} posições atualizadas!` : 'Posição atualizada!' 
       });
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

  const estatisticas = useMemo(() => {
    const lista = posicoes || [];
    const total = lista.length;
    const ocupadas = lista.filter((p) => p.status === 'ocupado').length;
    const livres = lista.filter((p) => p.status === 'livre').length;
    const bloqueadas = lista.filter((p) => p.status === 'bloqueado').length;
    const reservadas = lista.filter((p) => p.status === 'reservado').length;
    const taxaOcupacao = total > 0 ? (ocupadas / total) * 100 : 0;

    return {
      total,
      ocupadas,
      livres,
      bloqueadas,
      reservadas,
      taxaOcupacao,
      totalPosicoes: total,
      posicoesOcupadas: ocupadas,
      posicoesLivres: livres,
      posicoesBloqueadas: bloqueadas,
    };
  }, [posicoes]);

  // Keep getEstatisticas for backward compat but use memoized value
  const getEstatisticas = useCallback(() => estatisticas, [estatisticas]);

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
