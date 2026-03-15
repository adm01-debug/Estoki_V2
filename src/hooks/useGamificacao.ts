import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useGamificacao = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: perfil, isLoading, error, refetch } = useQuery({
    queryKey: ['gamificacao-perfil'],
    queryFn: async () => {
      const { data, error } = await supabase.from('gamificacao_usuarios').select('*').single();
      if (error && error.code !== 'PGRST116') throw error;
      return data;
    }
  });

  const { data: conquistas } = useQuery({
    queryKey: ['gamificacao-conquistas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('conquistas_definicoes').select('*');
      if (error) throw error;
      return data;
    }
  });

  const adicionarPontos = useMutation({
    mutationFn: async (pontos: number) => {
      const { data, error } = await supabase.rpc('adicionar_pontos', { p_pontos: pontos });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, pontos) => {
      queryClient.invalidateQueries({ queryKey: ['gamificacao-perfil'] });
      toast({ title: 'Pontos!', description: `+${pontos} pontos adicionados!` });
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('gamificacao-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'gamificacao_usuarios' }, () => {
        queryClient.invalidateQueries({ queryKey: ['gamificacao-perfil'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'conquistas' }, () => {
        queryClient.invalidateQueries({ queryKey: ['gamificacao-conquistas'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return { perfil, conquistas, isLoading, error, refetch, adicionarPontos };
};
