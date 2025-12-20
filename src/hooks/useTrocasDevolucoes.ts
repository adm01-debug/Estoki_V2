import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type TipoRegistro = 'troca' | 'devolucao';
export type StatusRegistro = 'aberto' | 'em_analise' | 'aprovado' | 'recusado' | 'em_transito' | 'recebido' | 'finalizado';
export type MotivoTD = 'defeito' | 'cor_errada' | 'tamanho_errado' | 'quantidade_errada' | 'produto_errado' | 'avaria_transporte' | 'desistencia' | 'outro';

export interface TrocaDevolucao {
  id: string;
  tipo: TipoRegistro;
  pedido: string;
  cliente: string;
  fornecedor?: string;
  produto: string;
  sku?: string;
  quantidade: number;
  valor_unitario?: number;
  valor_total?: number;
  motivo: MotivoTD;
  descricao_problema?: string;
  fotos?: string[];
  status: StatusRegistro;
  data_abertura: string;
  data_analise?: string;
  data_resolucao?: string;
  aberto_por?: string;
  analisado_por?: string;
  resolucao?: string;
  credito_gerado?: boolean;
  valor_credito?: number;
  created_at: string;
  updated_at: string;
}

export interface TrocaDevolucaoInput {
  tipo: TipoRegistro;
  pedido: string;
  cliente: string;
  fornecedor?: string;
  produto: string;
  sku?: string;
  quantidade: number;
  valor_unitario?: number;
  motivo: MotivoTD;
  descricao_problema?: string;
  fotos?: string[];
}

export function useTrocasDevolucoes() {
  const [registros, setRegistros] = useState<TrocaDevolucao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

  const fetchRegistros = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('trocas_devolucoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRegistros(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar registros';
      setError(message);
      console.error('Erro ao buscar trocas/devoluções:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistros();

    const channel = supabase
      .channel('trocas_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'trocas_devolucoes' },
        () => fetchRegistros()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRegistros]);

  const criarRegistro = async (input: TrocaDevolucaoInput): Promise<TrocaDevolucao | null> => {
    try {
      const valorTotal = input.valor_unitario 
        ? input.valor_unitario * input.quantidade 
        : undefined;

      const { data, error: insertError } = await supabase
        .from('trocas_devolucoes')
        .insert([{
          ...input,
          valor_total: valorTotal,
          status: 'aberto',
          aberto_por: user?.id,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: `${input.tipo === 'troca' ? 'Troca' : 'Devolução'} registrada`,
        description: `Pedido #${input.pedido} - ${input.produto}`,
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar registro';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    }
  };

  const atualizarStatus = async (id: string, status: StatusRegistro, resolucao?: string): Promise<boolean> => {
    try {
      const updateData: Record<string, unknown> = { status };

      if (status === 'em_analise') {
        updateData.data_analise = new Date().toISOString();
        updateData.analisado_por = user?.id;
      }

      if (['aprovado', 'recusado', 'finalizado'].includes(status)) {
        updateData.data_resolucao = new Date().toISOString();
        if (resolucao) updateData.resolucao = resolucao;
      }

      const { error: updateError } = await supabase
        .from('trocas_devolucoes')
        .update(updateData)
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Status atualizado',
        description: `Registro movido para: ${status}`,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao atualizar status';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const gerarCredito = async (id: string, valor: number): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('trocas_devolucoes')
        .update({
          credito_gerado: true,
          valor_credito: valor,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Crédito gerado',
        description: `R$ ${valor.toFixed(2)} creditado`,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao gerar crédito';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const getEstatisticas = useCallback(() => {
    const total = registros.length;
    const trocas = registros.filter(r => r.tipo === 'troca').length;
    const devolucoes = registros.filter(r => r.tipo === 'devolucao').length;
    const abertos = registros.filter(r => r.status === 'aberto').length;
    const emAnalise = registros.filter(r => r.status === 'em_analise').length;
    const finalizados = registros.filter(r => r.status === 'finalizado').length;
    
    const valorTotal = registros.reduce((acc, r) => acc + (r.valor_total || 0), 0);
    const creditosGerados = registros
      .filter(r => r.credito_gerado)
      .reduce((acc, r) => acc + (r.valor_credito || 0), 0);

    // Por fornecedor
    const porFornecedor: Record<string, number> = {};
    registros.forEach(r => {
      if (r.fornecedor) {
        porFornecedor[r.fornecedor] = (porFornecedor[r.fornecedor] || 0) + 1;
      }
    });

    // Por motivo
    const porMotivo: Record<string, number> = {};
    registros.forEach(r => {
      porMotivo[r.motivo] = (porMotivo[r.motivo] || 0) + 1;
    });

    return {
      total,
      trocas,
      devolucoes,
      abertos,
      emAnalise,
      finalizados,
      valorTotal,
      creditosGerados,
      porFornecedor,
      porMotivo,
    };
  }, [registros]);

  return {
    registros,
    loading,
    error,
    refetch: fetchRegistros,
    criarRegistro,
    atualizarStatus,
    gerarCredito,
    getEstatisticas,
  };
}
