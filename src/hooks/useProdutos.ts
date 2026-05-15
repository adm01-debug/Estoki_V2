  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { useMemo } from 'react';
 import { supabase } from '@/integrations/supabase/client';
 import { toast } from 'sonner';
 import { useAuditLog } from './useAuditLog';
 import { Produto } from '@/components/produtos/ProdutoDetailDialog';
 
 export const useProdutos = () => {
   const queryClient = useQueryClient();
   const { log } = useAuditLog();
 
   const { data: produtos = [], isLoading, error, refetch } = useQuery({
     queryKey: ['produtos'],
     queryFn: async () => {
       const { data, error } = await supabase.from('produtos').select('*').order('nome');
       if (error) throw error;
       return data as Produto[];
     }
   });
 
   const createProduto = useMutation({
     mutationFn: async (novoProduto: any) => {
       const { data, error } = await supabase.from('produtos').insert(novoProduto).select().single();
       if (error) throw error;
       return data;
     },
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
     mutationFn: async ({ id, ...dados }: any) => {
       const { data, error } = await supabase.from('produtos').update(dados).eq('id', id).select().single();
       if (error) throw error;
       return data;
     },
     onSuccess: (data) => {
       queryClient.invalidateQueries({ queryKey: ['produtos'] });
       toast.success('Produto atualizado!');
       log.custom('update', 'produtos', { 
         detalhes: `Produto ${data.nome} atualizado`,
         id: data.id 
       });
     }
   });
 
   const deleteProduto = useMutation({
     mutationFn: async (id: string) => {
       const { error } = await supabase.from('produtos').delete().eq('id', id);
       if (error) throw error;
     },
     onSuccess: (_, id) => {
       queryClient.invalidateQueries({ queryKey: ['produtos'] });
       toast.success('Produto removido!');
       log.custom('delete', 'produtos', { id });
     }
   });
 
    const bulkCreateProdutos = useMutation({
      mutationFn: async (novosProdutos: any[]) => {
        const { data, error } = await supabase.from('produtos').insert(novosProdutos).select();
        if (error) throw error;
        return data;
      },
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
      total: produtos.length,
      curvaA: produtos.filter((p) => p.curva_abc === 'A').length,
      curvaB: produtos.filter((p) => p.curva_abc === 'B').length,
      curvaC: produtos.filter((p) => p.curva_abc === 'C').length,
    }), [produtos]);
 
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