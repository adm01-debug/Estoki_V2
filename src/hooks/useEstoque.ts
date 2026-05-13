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
    curva_abc?: string | null;
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
   bloqueado_por?: string | null;
   bloqueado_em?: string | null;
   reservado_por?: string | null;
   reservado_em?: string | null;
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
            id,
            produto_id,
            lote_id,
            quantidade,
            data_entrada,
            produto:produtos(nome, sku, curva_abc),
            lote:lotes(numero_lote, data_validade)
           )
         `)
         .order('codigo');
 
      if (error) throw error;
      return data as unknown as PosicaoEstoque[];
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
        const payload = { ...dados };
        
        // Se estiver bloqueando ou reservando, registra quem e quando
        // Note: auth should be handled here to get current user ID
        const { data: { user } } = await supabase.auth.getUser();
        
        if (dados.status === 'bloqueado' && user) {
          (payload as any).bloqueado_por = user.id;
          (payload as any).bloqueado_em = new Date().toISOString();
        } else if (dados.status === 'reservado' && user) {
          (payload as any).reservado_por = user.id;
          (payload as any).reservado_em = new Date().toISOString();
        } else if (dados.status === 'livre') {
          (payload as any).bloqueado_por = null;
          (payload as any).bloqueado_em = null;
          (payload as any).reservado_por = null;
          (payload as any).reservado_em = null;
        }

        let updatedData;
        if (ids && ids.length > 0) {
          const { data, error } = await supabase.from('posicoes_estoque').update(payload).in('id', ids).select();
          if (error) throw error;
          updatedData = data;
        } else if (id) {
          const { data, error } = await supabase.from('posicoes_estoque').update(payload).eq('id', id).select().single();
          if (error) throw error;
          updatedData = data;
        } else {
          throw new Error('ID ou lista de IDs não fornecida para atualização');
        }

        // Log status change if status was updated
        if (dados.status && user) {
          const posIds = ids || (id ? [id] : []);
          const logs = posIds.map(posId => ({
            posicao_id: posId,
            status_novo: dados.status as string,
            operador_id: user.id,
            motivo: (dados as any).motivo || 'Alteração manual via painel'
          }));
          await supabase.from('posicao_status_log').insert(logs);
        }

        return updatedData;
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
    const ocupados = lista.filter((p) => p.status === 'ocupado').length;
    const livres = lista.filter((p) => p.status === 'livre').length;
    const bloqueados = lista.filter((p) => p.status === 'bloqueado').length;
    const reservados = lista.filter((p) => p.status === 'reservado').length;
    const taxaOcupacao = total > 0 ? (ocupados / total) * 100 : 0;

    return {
      total,
      ocupados,
      livres,
      bloqueados,
      reservados,
      taxaOcupacao,
      totalPosicoes: total,
      posicoesOcupadas: ocupados,
      posicoesLivres: livres,
      posicoesBloqueadas: bloqueados,
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
