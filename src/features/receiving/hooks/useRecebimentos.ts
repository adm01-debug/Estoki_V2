import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';
import { receivingService } from '../services/receivingService';
import type { RecebimentoItem } from '../types';

export const useRecebimentos = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: recebimentos, isLoading, error, refetch } = useQuery({
    queryKey: ['recebimentos'],
    queryFn: receivingService.getRecebimentos
  });

  const createRecebimento = useMutation({
    mutationFn: (novo: any) => {
      const payload = {
        ...novo,
        quantidade_inicial: novo.quantidade || novo.quantidade_inicial,
        quantidade_atual: novo.quantidade || novo.quantidade_atual,
      };
      return receivingService.createRecebimento(payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      toast({ title: 'Sucesso', description: 'Recebimento registrado!' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao registrar', variant: 'destructive' });
    }
  });


  return { recebimentos, isLoading, error, refetch, createRecebimento };
};
