import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ClassificacaoFornecedor = 'A' | 'B' | 'C' | 'D';

export interface Fornecedor {
  id: string;
  nome: string;
  categoria: string;
  
  // Métricas de qualidade
  entregas_totais: number;
  entregas_no_prazo: number;
  percentual_pontualidade: number;
  
  itens_recebidos: number;
  itens_aprovados: number;
  percentual_qualidade: number;
  
  trocas_devolucoes: number;
  taxa_problemas: number;
  
  // Classificação
  classificacao: ClassificacaoFornecedor;
  pontuacao: number;
  
  // Tendência
  tendencia: 'subindo' | 'estavel' | 'descendo';
  
  created_at: string;
  updated_at: string;
}

export interface MetricasFornecedor {
  fornecedor: string;
  mes: string;
  entregas: number;
  no_prazo: number;
  qualidade: number;
  problemas: number;
}

export function useFornecedores() {
  const [fornecedores, setFornecedores] = useState<Fornecedor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calcularMetricas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar lotes agrupados por fornecedor (usando lotes em vez de recebimentos)
      const { data: lotes, error: lotesError } = await supabase
        .from('lotes')
        .select('id, fornecedor, quantidade_inicial, quantidade_atual, created_at, data_recebimento');

      if (lotesError) throw lotesError;

      // Buscar eventos de triagem para qualidade
      const { data: triagens, error: triagError } = await supabase
        .from('eventos_triagem')
        .select('id, resultado, lote_id');

      if (triagError) console.error('Erro ao buscar triagens:', triagError);

      // Agrupar por fornecedor
      const fornecedoresMap: Record<string, Fornecedor> = {};

      // Processar lotes
      (lotes || []).forEach(lote => {
        if (!lote.fornecedor) return;

        if (!fornecedoresMap[lote.fornecedor]) {
          fornecedoresMap[lote.fornecedor] = {
            id: lote.fornecedor,
            nome: lote.fornecedor,
            categoria: 'Geral',
            entregas_totais: 0,
            entregas_no_prazo: 0,
            percentual_pontualidade: 0,
            itens_recebidos: 0,
            itens_aprovados: 0,
            percentual_qualidade: 0,
            trocas_devolucoes: 0,
            taxa_problemas: 0,
            classificacao: 'B',
            pontuacao: 0,
            tendencia: 'estavel',
            created_at: lote.created_at,
            updated_at: lote.created_at,
          };
        }

        const f = fornecedoresMap[lote.fornecedor];
        f.entregas_totais++;
        f.itens_recebidos += lote.quantidade_inicial || 0;
        f.entregas_no_prazo++; // Considerar todos como no prazo por padrão
      });

      // Calcular qualidade baseado em triagens
      const triagensAprovadas = (triagens || []).filter(t => t.resultado === 'aprovado').length;
      const totalTriagens = (triagens || []).length;
      const taxaAprovacao = totalTriagens > 0 ? (triagensAprovadas / totalTriagens) * 100 : 95;

      // Calcular métricas finais
      Object.values(fornecedoresMap).forEach(f => {
        // Pontualidade
        f.percentual_pontualidade = f.entregas_totais > 0
          ? Math.round((f.entregas_no_prazo / f.entregas_totais) * 100)
          : 0;

        // Qualidade
        f.percentual_qualidade = Math.round(taxaAprovacao);

        // Taxa de problemas
        f.taxa_problemas = f.entregas_totais > 0
          ? Math.round((f.trocas_devolucoes / f.entregas_totais) * 100 * 10) / 10
          : 0;

        // Aproximar itens aprovados
        f.itens_aprovados = Math.round(f.itens_recebidos * (f.percentual_qualidade / 100));

        // Calcular pontuação (0-100)
        f.pontuacao = Math.round(
          (f.percentual_pontualidade * 0.4) +
          (f.percentual_qualidade * 0.4) +
          ((100 - f.taxa_problemas * 10) * 0.2)
        );

        // Classificação
        if (f.pontuacao >= 90) f.classificacao = 'A';
        else if (f.pontuacao >= 75) f.classificacao = 'B';
        else if (f.pontuacao >= 60) f.classificacao = 'C';
        else f.classificacao = 'D';

        // Tendência (simplificado - baseado em entregas recentes)
        f.tendencia = 'estavel';
      });

      // Converter para array e ordenar por pontuação
      const fornecedoresArray = Object.values(fornecedoresMap)
        .sort((a, b) => b.pontuacao - a.pontuacao);

      setFornecedores(fornecedoresArray);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao calcular métricas';
      setError(message);
      console.error('Erro ao calcular métricas de fornecedores:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calcularMetricas();
  }, [calcularMetricas]);

  const getEstatisticasGerais = useCallback(() => {
    const total = fornecedores.length;
    const classificacaoA = fornecedores.filter(f => f.classificacao === 'A').length;
    const classificacaoB = fornecedores.filter(f => f.classificacao === 'B').length;
    const classificacaoC = fornecedores.filter(f => f.classificacao === 'C').length;
    const classificacaoD = fornecedores.filter(f => f.classificacao === 'D').length;

    const pontualidadeMedia = fornecedores.length > 0
      ? fornecedores.reduce((acc, f) => acc + f.percentual_pontualidade, 0) / fornecedores.length
      : 0;

    const qualidadeMedia = fornecedores.length > 0
      ? fornecedores.reduce((acc, f) => acc + f.percentual_qualidade, 0) / fornecedores.length
      : 0;

    const totalTrocas = fornecedores.reduce((acc, f) => acc + f.trocas_devolucoes, 0);

    return {
      total,
      classificacaoA,
      classificacaoB,
      classificacaoC,
      classificacaoD,
      pontualidadeMedia: Math.round(pontualidadeMedia * 10) / 10,
      qualidadeMedia: Math.round(qualidadeMedia * 10) / 10,
      totalTrocas,
    };
  }, [fornecedores]);

  const getFornecedorById = useCallback((id: string): Fornecedor | undefined => {
    return fornecedores.find(f => f.id === id || f.nome === id);
  }, [fornecedores]);

  const getTopFornecedores = useCallback((limit = 5): Fornecedor[] => {
    return [...fornecedores]
      .sort((a, b) => b.pontuacao - a.pontuacao)
      .slice(0, limit);
  }, [fornecedores]);

  const getFornecedoresCriticos = useCallback((): Fornecedor[] => {
    return fornecedores.filter(f => f.classificacao === 'D' || f.taxa_problemas > 10);
  }, [fornecedores]);

  return {
    fornecedores,
    loading,
    error,
    refetch: calcularMetricas,
    getEstatisticasGerais,
    getFornecedorById,
    getTopFornecedores,
    getFornecedoresCriticos,
  };
}