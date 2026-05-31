import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect, useCallback, useMemo, useRef } from 'react';
import { useToast } from '@/hooks/use-toast';
import { inventoryService } from '@/services/inventoryService';
import { logger } from '@/utils/logger';
import type { PosicaoEstoque, StatusPosicao, TipoPosicao, SaldoPosicao } from '@/types/inventory';
import type { Database } from '@/integrations/supabase/types';

export type { PosicaoEstoque, StatusPosicao, TipoPosicao, SaldoPosicao };

type PosicaoInsert = Database['public']['Tables']['posicoes_estoque']['Insert'];
type PosicaoUpdate = Database['public']['Tables']['posicoes_estoque']['Update'];

export const useEstoque = (options?: { enableRealtime?: boolean; prefetch?: boolean }) => {
   const queryClient = useQueryClient();
   const { toast } = useToast();
   const subscriptionRef = useRef<any>(null);
 
   useEffect(() => {
     if (!options?.enableRealtime) return;
 
     if (subscriptionRef.current) {
       subscriptionRef.current.unsubscribe();
     }
 
     subscriptionRef.current = supabase
       .channel('inventory-changes')
       .on(
         'postgres_changes',
         { event: '*', schema: 'public', table: 'posicoes_estoque' },
         () => {
           queryClient.invalidateQueries({ queryKey: ['estoque-posicoes'] });
         }
       )
       .on(
         'postgres_changes',
         { event: '*', schema: 'public', table: 'estoque_posicao' },
         () => {
           // This table handles occupancy (saldos)
           queryClient.invalidateQueries({ queryKey: ['estoque-posicoes'] });
         }
       )
       .subscribe();
 
     return () => {
       if (subscriptionRef.current) {
         subscriptionRef.current.unsubscribe();
       }
     };
   }, [options?.enableRealtime, queryClient]);

    const { data: posicoes, isLoading, error, refetch } = useQuery<PosicaoEstoque[], Error>({
      queryKey: ['estoque-posicoes'],
      queryFn: () => inventoryService.getAll(),
      staleTime: 1000 * 60 * 2, // 2 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes
    });

  const createPosicao = useMutation({
    mutationFn: inventoryService.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['estoque-posicoes'] });
      toast({ title: 'Sucesso', description: 'Posição criada com sucesso!' });
    },
     onError: (error: Error) => {
       logger.error('Falha ao criar posição', error);
       toast({ title: 'Erro', description: 'Falha ao criar posição', variant: 'destructive' });
     }
  });

  const updatePosicao = useMutation({
    mutationFn: async ({ id, ids, status, motivo }: { id?: string; ids?: string[]; status: string; motivo?: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      const posIds = ids && ids.length > 0 ? ids : (id ? [id] : []);
      if (posIds.length === 0) throw new Error('ID não fornecido');
      return inventoryService.updateStatus(posIds, status, motivo, user?.id);
    },
      onSuccess: (data) => {
        queryClient.invalidateQueries({ queryKey: ['estoque-posicoes'] });
        const count = Array.isArray(data) ? data.length : 1;
        toast({ 
          title: 'Sucesso', 
          description: count > 1 ? `${count} posições atualizadas!` : 'Posição atualizada!' 
        });
      },
      onError: (error: Error) => {
        logger.error('Falha ao atualizar posição', error);
        toast({ title: 'Erro', description: 'Falha ao atualizar posição', variant: 'destructive' });
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


  const estatisticas = useMemo(() => {
    const lista = Array.isArray(posicoes) ? posicoes : [];
    const total = lista.length;
    const ocupados = lista.filter((p: PosicaoEstoque) => p.status === 'ocupado').length;
    const livres = lista.filter((p: PosicaoEstoque) => p.status === 'livre').length;
    const bloqueados = lista.filter((p: PosicaoEstoque) => p.status === 'bloqueado').length;
    const reservados = lista.filter((p: PosicaoEstoque) => p.status === 'reservado').length;
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
