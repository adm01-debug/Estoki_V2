import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

// Note: There's no 'recebimentos' table in the schema. 
// This hook simulates recebimento tracking using lotes table.

export type StatusRecebimento = 
  | 'aguardando' 
  | 'chegou' 
  | 'conferencia' 
  | 'divergencia' 
  | 'ok' 
  | 'finalizado';

export interface Recebimento {
  id: string;
  numero_lote: string;
  fornecedor: string;
  produto_nome: string;
  produto_id: string;
  nf_entrada?: string;
  quantidade_inicial: number;
  quantidade_atual: number;
  data_recebimento: string;
  data_validade?: string;
  data_fabricacao?: string;
  created_at: string;
}

export function useRecebimentos() {
  const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecebimentos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Using lotes table as the source for recebimentos
      const { data, error: fetchError } = await supabase
        .from('lotes')
        .select(`
          id,
          numero_lote,
          fornecedor,
          nf_entrada,
          quantidade_inicial,
          quantidade_atual,
          data_recebimento,
          data_validade,
          data_fabricacao,
          created_at,
          produtos (id, nome)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mapped: Recebimento[] = (data || []).map(lote => ({
        id: lote.id,
        numero_lote: lote.numero_lote,
        fornecedor: lote.fornecedor || 'Não informado',
        produto_nome: lote.produtos?.nome || 'Produto desconhecido',
        produto_id: lote.produtos?.id || '',
        nf_entrada: lote.nf_entrada || undefined,
        quantidade_inicial: lote.quantidade_inicial,
        quantidade_atual: lote.quantidade_atual,
        data_recebimento: lote.data_recebimento,
        data_validade: lote.data_validade || undefined,
        data_fabricacao: lote.data_fabricacao || undefined,
        created_at: lote.created_at,
      }));

      setRecebimentos(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar recebimentos';
      setError(message);
      console.error('Erro ao buscar recebimentos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecebimentos();

    // Realtime subscription
    const channel = supabase
      .channel('lotes_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'lotes' },
        () => {
          fetchRecebimentos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecebimentos]);

  const createRecebimento = async (input: {
    produto_id: string;
    numero_lote: string;
    fornecedor?: string;
    nf_entrada?: string;
    quantidade: number;
    data_validade?: string;
    data_fabricacao?: string;
  }): Promise<Recebimento | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('lotes')
        .insert([{
          produto_id: input.produto_id,
          numero_lote: input.numero_lote,
          fornecedor: input.fornecedor,
          nf_entrada: input.nf_entrada,
          quantidade_inicial: input.quantidade,
          quantidade_atual: input.quantidade,
          data_recebimento: new Date().toISOString(),
          data_validade: input.data_validade,
          data_fabricacao: input.data_fabricacao,
        }])
        .select(`
          id,
          numero_lote,
          fornecedor,
          nf_entrada,
          quantidade_inicial,
          quantidade_atual,
          data_recebimento,
          data_validade,
          data_fabricacao,
          created_at,
          produtos (id, nome)
        `)
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Recebimento registrado',
        description: `Lote ${input.numero_lote} cadastrado com sucesso`,
      });

      const mapped: Recebimento = {
        id: data.id,
        numero_lote: data.numero_lote,
        fornecedor: data.fornecedor || 'Não informado',
        produto_nome: data.produtos?.nome || 'Produto desconhecido',
        produto_id: data.produtos?.id || '',
        nf_entrada: data.nf_entrada || undefined,
        quantidade_inicial: data.quantidade_inicial,
        quantidade_atual: data.quantidade_atual,
        data_recebimento: data.data_recebimento,
        data_validade: data.data_validade || undefined,
        data_fabricacao: data.data_fabricacao || undefined,
        created_at: data.created_at,
      };

      return mapped;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar recebimento';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const getRecebimentoById = async (id: string): Promise<Recebimento | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('lotes')
        .select(`
          id,
          numero_lote,
          fornecedor,
          nf_entrada,
          quantidade_inicial,
          quantidade_atual,
          data_recebimento,
          data_validade,
          data_fabricacao,
          created_at,
          produtos (id, nome)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      return {
        id: data.id,
        numero_lote: data.numero_lote,
        fornecedor: data.fornecedor || 'Não informado',
        produto_nome: data.produtos?.nome || 'Produto desconhecido',
        produto_id: data.produtos?.id || '',
        nf_entrada: data.nf_entrada || undefined,
        quantidade_inicial: data.quantidade_inicial,
        quantidade_atual: data.quantidade_atual,
        data_recebimento: data.data_recebimento,
        data_validade: data.data_validade || undefined,
        data_fabricacao: data.data_fabricacao || undefined,
        created_at: data.created_at,
      };
    } catch (err) {
      console.error('Erro ao buscar recebimento:', err);
      return null;
    }
  };

  return {
    recebimentos,
    loading,
    error,
    refetch: fetchRecebimentos,
    createRecebimento,
    getRecebimentoById,
  };
}
