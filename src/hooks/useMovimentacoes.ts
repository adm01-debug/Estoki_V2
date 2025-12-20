import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type TipoMovimentacao = 
  | 'recebimento' 
  | 'armazenamento' 
  | 'transferencia' 
  | 'saida_gravacao' 
  | 'retorno_gravacao' 
  | 'expedicao' 
  | 'ajuste';

export interface Movimentacao {
  id: string;
  tipo: TipoMovimentacao;
  produto_id?: string;
  produto_nome?: string;
  lote_id?: string;
  lote_codigo?: string;
  quantidade: number;
  origem?: string;
  destino?: string;
  observacao?: string;
  responsavel_id: string;
  responsavel_nome?: string;
  created_at: string;
}

export interface MovimentacaoInput {
  tipo: TipoMovimentacao;
  produto_id?: string;
  lote_id?: string;
  quantidade: number;
  origem?: string;
  destino?: string;
  observacao?: string;
}

export function useMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const fetchMovimentacoes = useCallback(async (limit = 50) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('rastreamento_historico')
        .select(`
          *,
          produtos (nome),
          lotes (codigo),
          profiles:responsavel_id (nome)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      const mapped = (data || []).map(mov => ({
        id: mov.id,
        tipo: mov.tipo_movimento as TipoMovimentacao,
        produto_id: mov.produto_id,
        produto_nome: mov.produtos?.nome,
        lote_id: mov.lote_id,
        lote_codigo: mov.lotes?.codigo,
        quantidade: mov.quantidade || 0,
        origem: mov.posicao_origem,
        destino: mov.posicao_destino,
        observacao: mov.observacao,
        responsavel_id: mov.responsavel_id,
        responsavel_nome: mov.profiles?.nome,
        created_at: mov.created_at,
      }));

      setMovimentacoes(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar movimentações';
      setError(message);
      console.error('Erro ao buscar movimentações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovimentacoes();

    const channel = supabase
      .channel('movimentacoes_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'rastreamento_historico' },
        () => fetchMovimentacoes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchMovimentacoes]);

  const registrarMovimentacao = async (input: MovimentacaoInput): Promise<boolean> => {
    try {
      if (!user?.id) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado',
          variant: 'destructive',
        });
        return false;
      }

      const { error: insertError } = await supabase
        .from('rastreamento_historico')
        .insert({
          tipo_movimento: input.tipo,
          produto_id: input.produto_id,
          lote_id: input.lote_id,
          quantidade: input.quantidade,
          posicao_origem: input.origem,
          posicao_destino: input.destino,
          observacao: input.observacao,
          responsavel_id: user.id,
        });

      if (insertError) throw insertError;

      toast({
        title: 'Movimentação registrada',
        description: `${input.tipo}: ${input.quantidade} unidades`,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar movimentação';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const transferir = async (
    loteId: string,
    origem: string,
    destino: string,
    quantidade: number,
    observacao?: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo: 'transferencia',
      lote_id: loteId,
      quantidade,
      origem,
      destino,
      observacao,
    });
  };

  const registrarEntrada = async (
    produtoId: string,
    quantidade: number,
    destino: string,
    loteId?: string,
    observacao?: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo: 'recebimento',
      produto_id: produtoId,
      lote_id: loteId,
      quantidade,
      destino,
      observacao,
    });
  };

  const registrarSaida = async (
    produtoId: string,
    quantidade: number,
    origem: string,
    tipo: 'expedicao' | 'saida_gravacao' = 'expedicao',
    loteId?: string,
    observacao?: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo,
      produto_id: produtoId,
      lote_id: loteId,
      quantidade,
      origem,
      observacao,
    });
  };

  const ajustarEstoque = async (
    produtoId: string,
    quantidade: number,
    posicao: string,
    observacao: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo: 'ajuste',
      produto_id: produtoId,
      quantidade,
      destino: posicao,
      observacao,
    });
  };

  const getMovimentacoesPorProduto = async (produtoId: string): Promise<Movimentacao[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('rastreamento_historico')
        .select(`
          *,
          produtos (nome),
          lotes (codigo),
          profiles:responsavel_id (nome)
        `)
        .eq('produto_id', produtoId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return (data || []).map(mov => ({
        id: mov.id,
        tipo: mov.tipo_movimento as TipoMovimentacao,
        produto_id: mov.produto_id,
        produto_nome: mov.produtos?.nome,
        lote_id: mov.lote_id,
        lote_codigo: mov.lotes?.codigo,
        quantidade: mov.quantidade || 0,
        origem: mov.posicao_origem,
        destino: mov.posicao_destino,
        observacao: mov.observacao,
        responsavel_id: mov.responsavel_id,
        responsavel_nome: mov.profiles?.nome,
        created_at: mov.created_at,
      }));
    } catch (err) {
      console.error('Erro ao buscar movimentações por produto:', err);
      return [];
    }
  };

  const getMovimentacoesPorLote = async (loteId: string): Promise<Movimentacao[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('rastreamento_historico')
        .select(`
          *,
          produtos (nome),
          lotes (codigo),
          profiles:responsavel_id (nome)
        `)
        .eq('lote_id', loteId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return (data || []).map(mov => ({
        id: mov.id,
        tipo: mov.tipo_movimento as TipoMovimentacao,
        produto_id: mov.produto_id,
        produto_nome: mov.produtos?.nome,
        lote_id: mov.lote_id,
        lote_codigo: mov.lotes?.codigo,
        quantidade: mov.quantidade || 0,
        origem: mov.posicao_origem,
        destino: mov.posicao_destino,
        observacao: mov.observacao,
        responsavel_id: mov.responsavel_id,
        responsavel_nome: mov.profiles?.nome,
        created_at: mov.created_at,
      }));
    } catch (err) {
      console.error('Erro ao buscar movimentações por lote:', err);
      return [];
    }
  };

  return {
    movimentacoes,
    loading,
    error,
    refetch: fetchMovimentacoes,
    registrarMovimentacao,
    transferir,
    registrarEntrada,
    registrarSaida,
    ajustarEstoque,
    getMovimentacoesPorProduto,
    getMovimentacoesPorLote,
  };
}
