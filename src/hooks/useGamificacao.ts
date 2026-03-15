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

  const adicionarXp = useMutation({
    mutationFn: async ({ quantidade, tipo, descricao }: { quantidade: number; tipo: string; descricao: string }) => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Usuário não autenticado');
      const { data, error } = await supabase.rpc('adicionar_xp', { 
        p_user_id: user.id, 
        p_quantidade: quantidade, 
        p_tipo: tipo, 
        p_descricao: descricao 
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (_, vars) => {
      queryClient.invalidateQueries({ queryKey: ['gamificacao-perfil'] });
      toast({ title: 'XP!', description: `+${vars.quantidade} XP!` });
    }
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
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return { perfil, conquistas, isLoading, error, refetch, adicionarXp };
};
