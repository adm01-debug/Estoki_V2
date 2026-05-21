import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { useAuditLog } from './useAuditLog';
import { productService } from '@/services/productService';
import type { Produto, ProdutoInsert, ProdutoUpdate } from '@/types/product';

export const useProdutos = (options?: { enableRealtime?: boolean }) => {
  const queryClient = useQueryClient();
  const { log } = useAuditLog();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!options?.enableRealtime) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = supabase
      .channel('products-changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'produtos' },
        () => {
          queryClient.invalidateQueries({ queryKey: ['produtos'] });
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [options?.enableRealtime, queryClient]);

  const { data: result, isLoading, error, refetch } = useQuery({
    queryKey: ['produtos', { page: 1, pageSize: 100 }],
    queryFn: () => productService.getAll({ page: 1, pageSize: 100 })
  });

  const produtos = useMemo(() => result?.data || [], [result?.data]);

  const createProduto = useMutation({
    mutationFn: productService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Produto cadastrado com sucesso!');
      log.custom('create', 'produtos', { 
        detalhes: `Produto ${data.nome} (${data.sku}) cadastrado`,
        id: data.id 
      });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao salvar produto');
    }
  });

  const updateProduto = useMutation({
    mutationFn: async ({ id, ...dados }: { id: string } & ProdutoUpdate) => {
      return productService.update(id, dados);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Produto atualizado!');
      log.custom('update', 'produtos', { 
        detalhes: `Produto ${data.nome} atualizado`,
        id: data.id 
      });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao atualizar produto');
    }
  });

  const deleteProduto = useMutation({
    mutationFn: productService.delete,
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success('Produto removido!');
      log.custom('delete', 'produtos', { id });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao remover produto');
    }
  });

  const bulkCreateProdutos = useMutation({
    mutationFn: productService.bulkCreate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['produtos'] });
      toast.success(`${data.length} produtos importados com sucesso!`);
      log.custom('bulk_create', 'produtos', { 
        detalhes: `${data.length} produtos importados via CSV`,
      });
    },
    onError: (err: any) => {
      toast.error(err.message || 'Erro ao importar produtos');
    }
  });

  const stats = useMemo(() => ({
    total: result?.total || 0,
    curvaA: produtos.filter((p) => p.curva_abc === 'A').length,
    curvaB: produtos.filter((p) => p.curva_abc === 'B').length,
    curvaC: produtos.filter((p) => p.curva_abc === 'C').length,
  }), [produtos, result?.total]);

  return {
    produtos,
    loading: isLoading,
    error,
    refetch,
    createProduto,
    updateProduto,
    deleteProduto,
    bulkCreateProdutos,
    stats
  };
};
