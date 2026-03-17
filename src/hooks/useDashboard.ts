import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useDashboard = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // Run all counts in parallel with a single Promise.all
      const [posResult, triResult, lotResult] = await Promise.all([
        supabase.from('posicoes_estoque').select('id', { count: 'exact', head: true }),
        supabase.from('eventos_triagem').select('id', { count: 'exact', head: true }),
        supabase.from('lotes').select('id', { count: 'exact', head: true }),
      ]);

      return {
        totalPosicoes: posResult.count ?? 0,
        totalTriagens: triResult.count ?? 0,
        totalRecebimentos: lotResult.count ?? 0,
      };
    },
    staleTime: 2 * 60 * 1000, // 2 min — dashboard data is semi-fresh
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
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lotes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return { stats, isLoading, error, refetch };
};
