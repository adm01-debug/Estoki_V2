import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useDashboard = () => {
  const queryClient = useQueryClient();

  const { data: stats, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const getCount = async (table: 'posicoes_estoque' | 'eventos_triagem' | 'lotes') => {
        const { count, error } = await supabase
          .from(table)
          .select('id', { count: 'exact', head: true });

        if (error) {
          console.error(`[useDashboard] Failed counting ${table}:`, error.message);
          return 0;
        }

        return count ?? 0;
      };

      const [totalPosicoes, totalTriagens, totalRecebimentos] = await Promise.all([
        getCount('posicoes_estoque'),
        getCount('eventos_triagem'),
        getCount('lotes'),
      ]);

      return {
        totalPosicoes,
        totalTriagens,
        totalRecebimentos,
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
