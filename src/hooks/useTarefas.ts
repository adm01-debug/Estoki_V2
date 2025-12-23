import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export const useTarefas = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tarefas, isLoading, error, refetch } = useQuery({
    queryKey: ['tarefas'],
    queryFn: async () => {
      const { data, error } = await supabase.from('tarefas').select('*').order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createTarefa = useMutation({
    mutationFn: async (nova: any) => {
      const { data, error } = await supabase.from('tarefas').insert(nova).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      toast({ title: 'Sucesso', description: 'Tarefa criada!' });
    }
  });

  const completarTarefa = useMutation({
    mutationFn: async (id: string) => {
      const { data, error } = await supabase.from('tarefas').update({ status: 'concluida' }).eq('id', id).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tarefas'] });
      toast({ title: 'Tarefa concluída!', description: 'Parabéns!' });
    }
  });

  return { tarefas, isLoading, error, refetch, createTarefa, completarTarefa };
};
