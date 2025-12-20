import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type StatusPosicao = 'livre' | 'ocupado' | 'reservado' | 'bloqueado';
export type TipoPosicao = 'porta_palete' | 'box';

export interface PosicaoEstoque {
  id: string;
  codigo: string;
  tipo: TipoPosicao;
  porta_palete?: string;
  secao?: string;
  nivel?: string;
  box?: string;
  zona?: string;
  status: StatusPosicao;
  produto_id?: string;
  produto_nome?: string;
  lote_id?: string;
  quantidade?: number;
  capacidade_kg?: number;
  created_at: string;
  updated_at: string;
}

export interface EstoqueItem {
  id: string;
  posicao_id: string;
  produto_id: string;
  lote_id?: string;
  quantidade: number;
  produto?: {
    nome: string;
    sku: string;
  };
}

export interface EstatisticasEstoque {
  totalPosicoes: number;
  posicoesOcupadas: number;
  posicoesLivres: number;
  posicoesReservadas: number;
  posicoesBloqueadas: number;
  taxaOcupacao: number;
  ocupacaoPorPortaPalete: Record<string, { ocupado: number; total: number; percentual: number }>;
}

export function useEstoque() {
  const [posicoes, setPosicoes] = useState<PosicaoEstoque[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchPosicoes = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('posicoes_estoque')
        .select(`
          *,
          estoque_posicao (
            quantidade,
            produto_id,
            lote_id,
            produtos (nome, sku)
          )
        `)
        .order('codigo', { ascending: true });

      if (fetchError) throw fetchError;

      // Mapear dados
      const mapped: PosicaoEstoque[] = (data || []).map(pos => ({
        id: pos.id,
        codigo: pos.codigo,
        tipo: pos.tipo,
        porta_palete: pos.porta_palete || undefined,
        secao: pos.secao || undefined,
        nivel: pos.nivel || undefined,
        box: pos.box || undefined,
        zona: pos.zona || undefined,
        status: pos.status,
        capacidade_kg: pos.capacidade_kg || undefined,
        created_at: pos.created_at,
        updated_at: pos.updated_at,
        produto_nome: pos.estoque_posicao?.[0]?.produtos?.nome,
        quantidade: pos.estoque_posicao?.[0]?.quantidade,
        produto_id: pos.estoque_posicao?.[0]?.produto_id,
        lote_id: pos.estoque_posicao?.[0]?.lote_id,
      }));

      setPosicoes(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar posições';
      setError(message);
      console.error('Erro ao buscar posições:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchPosicoes();

    const channel = supabase
      .channel('posicoes_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'posicoes_estoque' },
        () => fetchPosicoes()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'estoque_posicao' },
        () => fetchPosicoes()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchPosicoes]);

  const getEstatisticas = useCallback((): EstatisticasEstoque => {
    const totalPosicoes = posicoes.length;
    const posicoesOcupadas = posicoes.filter(p => p.status === 'ocupado').length;
    const posicoesLivres = posicoes.filter(p => p.status === 'livre').length;
    const posicoesReservadas = posicoes.filter(p => p.status === 'reservado').length;
    const posicoesBloqueadas = posicoes.filter(p => p.status === 'bloqueado').length;
    const taxaOcupacao = totalPosicoes > 0 ? (posicoesOcupadas / totalPosicoes) * 100 : 0;

    // Ocupação por porta-palete
    const portaPaletes = posicoes.filter(p => p.tipo === 'porta_palete');
    const ocupacaoPorPortaPalete: Record<string, { ocupado: number; total: number; percentual: number }> = {};
    
    const grupos = new Set(portaPaletes.map(p => p.porta_palete).filter(Boolean));
    grupos.forEach(pp => {
      if (!pp) return;
      const doPP = portaPaletes.filter(p => p.porta_palete === pp);
      const ocupadas = doPP.filter(p => p.status === 'ocupado').length;
      ocupacaoPorPortaPalete[pp] = {
        ocupado: ocupadas,
        total: doPP.length,
        percentual: doPP.length > 0 ? (ocupadas / doPP.length) * 100 : 0,
      };
    });

    return {
      totalPosicoes,
      posicoesOcupadas,
      posicoesLivres,
      posicoesReservadas,
      posicoesBloqueadas,
      taxaOcupacao,
      ocupacaoPorPortaPalete,
    };
  }, [posicoes]);

  const atualizarStatus = async (id: string, status: StatusPosicao): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('posicoes_estoque')
        .update({ status })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Status atualizado',
        description: `Posição marcada como ${status}`,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const alocarProduto = async (
    posicaoId: string,
    produtoId: string,
    quantidade: number,
    loteId?: string
  ): Promise<boolean> => {
    try {
      // Verificar se posição está livre
      const posicao = posicoes.find(p => p.id === posicaoId);
      if (!posicao || posicao.status !== 'livre') {
        toast({
          title: 'Erro',
          description: 'Posição não está disponível',
          variant: 'destructive',
        });
        return false;
      }

      // Inserir na estoque_posicao
      const { error: insertError } = await supabase
        .from('estoque_posicao')
        .insert({
          posicao_id: posicaoId,
          produto_id: produtoId,
          lote_id: loteId,
          quantidade,
        });

      if (insertError) throw insertError;

      // Atualizar status da posição
      const { error: updateError } = await supabase
        .from('posicoes_estoque')
        .update({ status: 'ocupado' })
        .eq('id', posicaoId);

      if (updateError) throw updateError;

      toast({
        title: 'Produto alocado',
        description: `${quantidade} unidades alocadas na posição`,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao alocar produto';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const liberarPosicao = async (posicaoId: string): Promise<boolean> => {
    try {
      // Remover da estoque_posicao
      const { error: deleteError } = await supabase
        .from('estoque_posicao')
        .delete()
        .eq('posicao_id', posicaoId);

      if (deleteError) throw deleteError;

      // Atualizar status da posição
      const { error: updateError } = await supabase
        .from('posicoes_estoque')
        .update({ status: 'livre' })
        .eq('id', posicaoId);

      if (updateError) throw updateError;

      toast({
        title: 'Posição liberada',
        description: 'A posição está agora disponível',
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao liberar posição';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const getPosicaoById = async (id: string): Promise<PosicaoEstoque | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('posicoes_estoque')
        .select(`
          *,
          estoque_posicao (
            quantidade,
            produto_id,
            lote_id,
            produtos (nome, sku)
          )
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      
      return {
        id: data.id,
        codigo: data.codigo,
        tipo: data.tipo,
        porta_palete: data.porta_palete || undefined,
        secao: data.secao || undefined,
        nivel: data.nivel || undefined,
        box: data.box || undefined,
        zona: data.zona || undefined,
        status: data.status,
        capacidade_kg: data.capacidade_kg || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
        produto_nome: data.estoque_posicao?.[0]?.produtos?.nome,
        quantidade: data.estoque_posicao?.[0]?.quantidade,
        produto_id: data.estoque_posicao?.[0]?.produto_id,
        lote_id: data.estoque_posicao?.[0]?.lote_id,
      };
    } catch (err) {
      console.error('Erro ao buscar posição:', err);
      return null;
    }
  };

  const getPosicaoByCodigo = async (codigo: string): Promise<PosicaoEstoque | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('posicoes_estoque')
        .select(`
          *,
          estoque_posicao (
            quantidade,
            produto_id,
            lote_id,
            produtos (nome, sku)
          )
        `)
        .eq('codigo', codigo)
        .single();

      if (fetchError) throw fetchError;
      
      return {
        id: data.id,
        codigo: data.codigo,
        tipo: data.tipo,
        porta_palete: data.porta_palete || undefined,
        secao: data.secao || undefined,
        nivel: data.nivel || undefined,
        box: data.box || undefined,
        zona: data.zona || undefined,
        status: data.status,
        capacidade_kg: data.capacidade_kg || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
        produto_nome: data.estoque_posicao?.[0]?.produtos?.nome,
        quantidade: data.estoque_posicao?.[0]?.quantidade,
        produto_id: data.estoque_posicao?.[0]?.produto_id,
        lote_id: data.estoque_posicao?.[0]?.lote_id,
      };
    } catch (err) {
      console.error('Erro ao buscar posição por código:', err);
      return null;
    }
  };

  return {
    posicoes,
    loading,
    error,
    refetch: fetchPosicoes,
    getEstatisticas,
    atualizarStatus,
    alocarProduto,
    liberarPosicao,
    getPosicaoById,
    getPosicaoByCodigo,
  };
}