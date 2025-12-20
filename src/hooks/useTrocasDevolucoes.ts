import { useState, useCallback, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRegistros = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error: fetchError } = await supabase
        .from('trocas_devolucoes')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;
      
      setRegistros((data || []) as TrocaDevolucao[]);
    } catch (err: any) {
      console.error('Erro ao buscar registros:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRegistros();
  }, [fetchRegistros]);

  const criarRegistro = async (input: TrocaDevolucaoInput): Promise<TrocaDevolucao | null> => {
    const valorTotal = input.valor_unitario 
      ? input.valor_unitario * input.quantidade 
      : undefined;

    try {
      const { data, error: insertError } = await supabase
        .from('trocas_devolucoes')
        .insert({
          tipo: input.tipo,
          pedido: input.pedido,
          cliente: input.cliente,
          fornecedor: input.fornecedor,
          produto: input.produto,
          sku: input.sku,
          quantidade: input.quantidade,
          valor_unitario: input.valor_unitario,
          valor_total: valorTotal,
          motivo: input.motivo,
          descricao_problema: input.descricao_problema,
          fotos: input.fotos,
        })
        .select()
        .single();

      if (insertError) throw insertError;

      const novoRegistro = data as TrocaDevolucao;
      setRegistros(prev => [novoRegistro, ...prev]);

      toast({
        title: `${input.tipo === 'troca' ? 'Troca' : 'Devolução'} registrada`,
        description: `Pedido #${input.pedido} - ${input.produto}`,
      });

      return novoRegistro;
    } catch (err: any) {
      console.error('Erro ao criar registro:', err);
      toast({
        title: 'Erro ao criar registro',
        description: err.message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const atualizarStatus = async (id: string, status: StatusRegistro, resolucao?: string): Promise<boolean> => {
    try {
      const updates: Record<string, any> = { status };

      if (status === 'em_analise') {
        updates.data_analise = new Date().toISOString();
      }

      if (['aprovado', 'recusado', 'finalizado'].includes(status)) {
        updates.data_resolucao = new Date().toISOString();
        if (resolucao) updates.resolucao = resolucao;
      }

      const { error: updateError } = await supabase
        .from('trocas_devolucoes')
        .update(updates)
        .eq('id', id);

      if (updateError) throw updateError;

      setRegistros(prev => prev.map(r => 
        r.id === id ? { ...r, ...updates, updated_at: new Date().toISOString() } : r
      ));

      toast({
        title: 'Status atualizado',
        description: `Registro movido para: ${status}`,
      });

      return true;
    } catch (err: any) {
      console.error('Erro ao atualizar status:', err);
      toast({
        title: 'Erro ao atualizar status',
        description: err.message,
        variant: 'destructive',
      });
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

      setRegistros(prev => prev.map(r => 
        r.id === id ? { ...r, credito_gerado: true, valor_credito: valor, updated_at: new Date().toISOString() } : r
      ));

      toast({
        title: 'Crédito gerado',
        description: `R$ ${valor.toFixed(2)} creditado`,
      });

      return true;
    } catch (err: any) {
      console.error('Erro ao gerar crédito:', err);
      toast({
        title: 'Erro ao gerar crédito',
        description: err.message,
        variant: 'destructive',
      });
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

    const porFornecedor: Record<string, number> = {};
    registros.forEach(r => {
      if (r.fornecedor) {
        porFornecedor[r.fornecedor] = (porFornecedor[r.fornecedor] || 0) + 1;
      }
    });

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
