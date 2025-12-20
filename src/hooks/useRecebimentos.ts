import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type StatusRecebimento = 
  | 'aguardando' 
  | 'em_transito' 
  | 'recebido' 
  | 'em_conferencia' 
  | 'conferido' 
  | 'divergencia' 
  | 'cancelado';

export interface Recebimento {
  id: string;
  numero_lote: string;
  fornecedor: string;
  produto_nome: string;
  produto_id: string;
  nf_entrada?: string;
  quantidade_inicial: number;
  quantidade_atual: number;
  quantidade_pedida?: number;
  data_recebimento: string;
  data_validade?: string;
  data_fabricacao?: string;
  previsao_chegada?: string;
  pedido_compra?: string;
  status: StatusRecebimento;
  observacoes_conferencia?: string;
  conferido_por?: string;
  data_conferencia?: string;
  created_at: string;
}

export interface RecebimentoInput {
  produto_id: string;
  numero_lote: string;
  fornecedor?: string;
  nf_entrada?: string;
  quantidade: number;
  quantidade_pedida?: number;
  data_validade?: string;
  data_fabricacao?: string;
  previsao_chegada?: string;
  pedido_compra?: string;
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

      const { data, error: fetchError } = await supabase
        .from('lotes')
        .select(`
          id,
          numero_lote,
          fornecedor,
          nf_entrada,
          quantidade_inicial,
          quantidade_atual,
          quantidade_pedida,
          data_recebimento,
          data_validade,
          data_fabricacao,
          previsao_chegada,
          pedido_compra,
          status,
          observacoes_conferencia,
          conferido_por,
          data_conferencia,
          created_at,
          produtos (id, nome)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mapped: Recebimento[] = (data || []).map(lote => ({
        id: lote.id,
        numero_lote: lote.numero_lote,
        fornecedor: lote.fornecedor || 'Não informado',
        produto_nome: (lote.produtos as any)?.nome || 'Produto desconhecido',
        produto_id: (lote.produtos as any)?.id || '',
        nf_entrada: lote.nf_entrada || undefined,
        quantidade_inicial: lote.quantidade_inicial,
        quantidade_atual: lote.quantidade_atual,
        quantidade_pedida: lote.quantidade_pedida || undefined,
        data_recebimento: lote.data_recebimento,
        data_validade: lote.data_validade || undefined,
        data_fabricacao: lote.data_fabricacao || undefined,
        previsao_chegada: lote.previsao_chegada || undefined,
        pedido_compra: lote.pedido_compra || undefined,
        status: (lote.status as StatusRecebimento) || 'aguardando',
        observacoes_conferencia: lote.observacoes_conferencia || undefined,
        conferido_por: lote.conferido_por || undefined,
        data_conferencia: lote.data_conferencia || undefined,
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

  const createRecebimento = async (input: RecebimentoInput): Promise<Recebimento | null> => {
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
          quantidade_pedida: input.quantidade_pedida,
          data_recebimento: new Date().toISOString(),
          data_validade: input.data_validade,
          data_fabricacao: input.data_fabricacao,
          previsao_chegada: input.previsao_chegada,
          pedido_compra: input.pedido_compra,
          status: 'aguardando',
        }])
        .select(`
          id,
          numero_lote,
          fornecedor,
          nf_entrada,
          quantidade_inicial,
          quantidade_atual,
          quantidade_pedida,
          data_recebimento,
          data_validade,
          data_fabricacao,
          previsao_chegada,
          pedido_compra,
          status,
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
        produto_nome: (data.produtos as any)?.nome || 'Produto desconhecido',
        produto_id: (data.produtos as any)?.id || '',
        nf_entrada: data.nf_entrada || undefined,
        quantidade_inicial: data.quantidade_inicial,
        quantidade_atual: data.quantidade_atual,
        quantidade_pedida: data.quantidade_pedida || undefined,
        data_recebimento: data.data_recebimento,
        data_validade: data.data_validade || undefined,
        data_fabricacao: data.data_fabricacao || undefined,
        previsao_chegada: data.previsao_chegada || undefined,
        pedido_compra: data.pedido_compra || undefined,
        status: (data.status as StatusRecebimento) || 'aguardando',
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
          quantidade_pedida,
          data_recebimento,
          data_validade,
          data_fabricacao,
          previsao_chegada,
          pedido_compra,
          status,
          observacoes_conferencia,
          conferido_por,
          data_conferencia,
          created_at,
          produtos (id, nome)
        `)
        .eq('id', id)
        .maybeSingle();

      if (fetchError) throw fetchError;
      if (!data) return null;
      
      return {
        id: data.id,
        numero_lote: data.numero_lote,
        fornecedor: data.fornecedor || 'Não informado',
        produto_nome: (data.produtos as any)?.nome || 'Produto desconhecido',
        produto_id: (data.produtos as any)?.id || '',
        nf_entrada: data.nf_entrada || undefined,
        quantidade_inicial: data.quantidade_inicial,
        quantidade_atual: data.quantidade_atual,
        quantidade_pedida: data.quantidade_pedida || undefined,
        data_recebimento: data.data_recebimento,
        data_validade: data.data_validade || undefined,
        data_fabricacao: data.data_fabricacao || undefined,
        previsao_chegada: data.previsao_chegada || undefined,
        pedido_compra: data.pedido_compra || undefined,
        status: (data.status as StatusRecebimento) || 'aguardando',
        observacoes_conferencia: data.observacoes_conferencia || undefined,
        conferido_por: data.conferido_por || undefined,
        data_conferencia: data.data_conferencia || undefined,
        created_at: data.created_at,
      };
    } catch (err) {
      console.error('Erro ao buscar recebimento:', err);
      return null;
    }
  };

  const atualizarStatus = async (id: string, status: StatusRecebimento, observacoes?: string): Promise<boolean> => {
    try {
      const updates: Record<string, any> = { status };
      
      if (status === 'conferido') {
        updates.data_conferencia = new Date().toISOString();
      }
      
      if (observacoes) {
        updates.observacoes_conferencia = observacoes;
      }

      const { error: updateError } = await supabase
        .from('lotes')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Status atualizado',
        description: `Recebimento movido para: ${status}`,
      });

      await fetchRecebimentos();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const confirmarConferencia = async (
    id: string, 
    quantidadeRecebida: number, 
    observacoes?: string
  ): Promise<boolean> => {
    try {
      const recebimento = await getRecebimentoById(id);
      if (!recebimento) throw new Error('Recebimento não encontrado');

      const quantidadePedida = recebimento.quantidade_pedida || recebimento.quantidade_inicial;
      const temDivergencia = quantidadeRecebida !== quantidadePedida;

      const { error: updateError } = await supabase
        .from('lotes')
        .update({
          quantidade_atual: quantidadeRecebida,
          status: temDivergencia ? 'divergencia' : 'conferido',
          data_conferencia: new Date().toISOString(),
          observacoes_conferencia: observacoes,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: temDivergencia ? 'Divergência registrada' : 'Conferência concluída',
        description: temDivergencia 
          ? `Quantidade recebida (${quantidadeRecebida}) difere da pedida (${quantidadePedida})`
          : `Lote conferido com ${quantidadeRecebida} unidades`,
      });

      await fetchRecebimentos();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao confirmar conferência';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  return {
    recebimentos,
    loading,
    error,
    refetch: fetchRecebimentos,
    createRecebimento,
    getRecebimentoById,
    atualizarStatus,
    confirmarConferencia,
  };
}
