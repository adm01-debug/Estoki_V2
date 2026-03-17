import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';

export const useGamificacao = () => {
  const queryClient = useQueryClient();

  const { data: perfil, isLoading, error, refetch } = useQuery({
    queryKey: ['gamificacao-perfil'],
    queryFn: async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) return null;

      const { data, error } = await supabase
        .from('gamificacao_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;
      return data;
    },
  });

  const { data: conquistas } = useQuery({
    queryKey: ['gamificacao-conquistas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('conquistas_definicoes').select('*');
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    const channel = supabase
      .channel('gamificacao-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gamificacao_usuarios' }, () => {
        queryClient.invalidateQueries({ queryKey: ['gamificacao-perfil'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conquistas_definicoes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['gamificacao-conquistas'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    perfil,
    conquistas,
    isLoading,
    error,
    refetch,
  };
};
