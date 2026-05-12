import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

export const useRecebimentos = () => {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: recebimentos, isLoading, error, refetch } = useQuery({
    queryKey: ['recebimentos'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('lotes')
        .select('*, produto:produtos(nome, sku)')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data;
    }
  });

  const createRecebimento = useMutation({
    mutationFn: async (novo: any) => {
      const payload = {
        numero_lote: novo.numero_lote,
        produto_id: novo.produto_id,
        quantidade_inicial: novo.quantidade || novo.quantidade_inicial || 0,
        quantidade_atual: novo.quantidade || novo.quantidade_atual || 0,
        quantidade_pedida: novo.quantidade_pedida,
        fornecedor: novo.fornecedor,
        nf_entrada: novo.nf_entrada,
        previsao_chegada: novo.previsao_chegada,
        pedido_compra: novo.pedido_compra,
        data_validade: novo.data_validade,
        data_fabricacao: novo.data_fabricacao,
        status: novo.status || 'aguardando',
      };
      const { data, error } = await supabase.from('lotes').insert(payload).select().single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      toast({ title: 'Sucesso', description: 'Recebimento registrado!' });
    },
    onError: () => {
      toast({ title: 'Erro', description: 'Falha ao registrar', variant: 'destructive' });
    }
  });

  useEffect(() => {
    const channel = supabase
      .channel('recebimentos-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lotes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['recebimentos'] });
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [queryClient]);

  return { recebimentos, isLoading, error, refetch, createRecebimento };
};
