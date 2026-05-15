import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import type { Database } from '@/integrations/supabase/types';

 export type TipoMovimentacao = Database['public']['Enums']['tipo_evento_rastreamento'] | 'transferencia';

export interface Movimentacao {
  id: string;
  tipo: TipoMovimentacao;
  produto_id?: string;
  produto_nome?: string;
  lote_id?: string;
  lote_numero?: string;
  quantidade: number;
  localizacao?: string;
  descricao: string;
  operador_id?: string;
  operador_nome?: string;
  created_at: string;
}

export interface MovimentacaoInput {
  tipo: TipoMovimentacao;
  produto_id?: string;
  lote_id?: string;
  quantidade: number;
  localizacao?: string;
  descricao: string;
}

export function useMovimentacoes() {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchMovimentacoes = useCallback(async (limit = 50) => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('rastreamento_historico')
        .select(`
          *,
          produtos (nome),
          lotes (numero_lote),
          profiles:operador_id (nome)
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (fetchError) throw fetchError;

      const mapped = (data || []).map(mov => ({
        id: mov.id,
        tipo: mov.tipo_evento as TipoMovimentacao,
        produto_id: mov.produto_id || undefined,
        produto_nome: mov.produtos?.nome || undefined,
        lote_id: mov.lote_id || undefined,
        lote_numero: mov.lotes?.numero_lote || undefined,
        quantidade: mov.quantidade || 0,
        localizacao: mov.localizacao || undefined,
        descricao: mov.descricao,
        operador_id: mov.operador_id || undefined,
        operador_nome: mov.profiles?.nome || undefined,
        created_at: mov.created_at,
      }));

      setMovimentacoes(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar movimentações';
      setError(message);
      if (import.meta.env.DEV) console.error('Erro ao buscar movimentações:', err);
    } finally {
      setLoading(false);
    }
  }, []);

   useEffect(() => {
     fetchMovimentacoes();
   }, [fetchMovimentacoes]);

  const registrarMovimentacao = async (
    input: MovimentacaoInput & { from_posicao_id?: string; to_posicao_id?: string }
  ): Promise<boolean> => {
    try {
      if (!user?.id) {
        toast({
          title: 'Erro',
          description: 'Usuário não autenticado',
          variant: 'destructive',
        });
        return false;
      }

      // Use RPC for atomic stock movement to ensure lot quantities and positions are updated
      // If we don't have a lote_id, we can't use move_stock (logical requirement)
      if (!input.lote_id) {
        throw new Error('ID do lote é obrigatório para esta operação');
      }

      const { error: rpcError } = await supabase.rpc('move_stock', {
        p_lote_id: input.lote_id,
        p_from_posicao_id: input.from_posicao_id || null,
        p_to_posicao_id: input.to_posicao_id || null,
        p_quantidade: input.quantidade,
        p_operador_id: user.id,
        p_tipo_evento: input.tipo === 'transferencia' ? 'armazenamento' : input.tipo,
        p_descricao: input.descricao
      } as any); // Cast to any because the generated types might not be updated yet

      if (rpcError) throw rpcError;

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
    fromPosicaoId: string,
    toPosicaoId: string,
    quantidade: number,
    descricao?: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo: 'transferencia',
      lote_id: loteId,
      from_posicao_id: fromPosicaoId,
      to_posicao_id: toPosicaoId,
      quantidade,
      descricao: descricao || 'Transferência interna de estoque',
    });
  };

  const registrarEntrada = async (
    produtoId: string,
    quantidade: number,
    localizacao: string,
    loteId?: string,
    descricao?: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo: 'recebimento_nf',
      produto_id: produtoId,
      lote_id: loteId,
      quantidade,
      localizacao,
      descricao: descricao || 'Entrada de material',
    });
  };

  const registrarSaida = async (
    produtoId: string,
    quantidade: number,
    localizacao: string,
    tipo: 'saida_transporte' | 'separacao' = 'saida_transporte',
    loteId?: string,
    descricao?: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo,
      produto_id: produtoId,
      lote_id: loteId,
      quantidade,
      localizacao,
      descricao: descricao || 'Saída de material',
    });
  };

  const ajustarEstoque = async (
    produtoId: string,
    quantidade: number,
    localizacao: string,
    descricao: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo: 'ajuste_estoque',
      produto_id: produtoId,
      quantidade,
      localizacao,
      descricao,
    });
  };

  const getMovimentacoesPorProduto = async (produtoId: string): Promise<Movimentacao[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('rastreamento_historico')
        .select(`
          *,
          produtos (nome),
          lotes (numero_lote),
          profiles:operador_id (nome)
        `)
        .eq('produto_id', produtoId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return (data || []).map(mov => ({
        id: mov.id,
        tipo: mov.tipo_evento as TipoMovimentacao,
        produto_id: mov.produto_id || undefined,
        produto_nome: mov.produtos?.nome || undefined,
        lote_id: mov.lote_id || undefined,
        lote_numero: mov.lotes?.numero_lote || undefined,
        quantidade: mov.quantidade || 0,
        localizacao: mov.localizacao || undefined,
        descricao: mov.descricao,
        operador_id: mov.operador_id || undefined,
        operador_nome: mov.profiles?.nome || undefined,
        created_at: mov.created_at,
      }));
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao buscar movimentações por produto:', err);
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
          lotes (numero_lote),
          profiles:operador_id (nome)
        `)
        .eq('lote_id', loteId)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      return (data || []).map(mov => ({
        id: mov.id,
        tipo: mov.tipo_evento as TipoMovimentacao,
        produto_id: mov.produto_id || undefined,
        produto_nome: mov.produtos?.nome || undefined,
        lote_id: mov.lote_id || undefined,
        lote_numero: mov.lotes?.numero_lote || undefined,
        quantidade: mov.quantidade || 0,
        localizacao: mov.localizacao || undefined,
        descricao: mov.descricao,
        operador_id: mov.operador_id || undefined,
        operador_nome: mov.profiles?.nome || undefined,
        created_at: mov.created_at,
      }));
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao buscar movimentações por lote:', err);
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
