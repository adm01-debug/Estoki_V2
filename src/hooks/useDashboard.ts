import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useDashboard = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [posicoes, triagens, recebimentos] = await Promise.all([
        supabase.from('posicoes_estoque').select('*', { count: 'exact', head: true }),
        supabase.from('eventos_triagem').select('*', { count: 'exact', head: true }),
        supabase.from('lotes').select('*', { count: 'exact', head: true })
      ]);
      return {
        totalPosicoes: posicoes.count || 0,
        totalTriagens: triagens.count || 0,
        totalRecebimentos: recebimentos.count || 0
      };
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posicoes_estoque' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos_triagem' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'recebimentos' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { stats, isLoading, error, refetch };
};
