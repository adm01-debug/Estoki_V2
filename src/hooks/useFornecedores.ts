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

      // Buscar recebimentos agrupados por fornecedor
      const { data: recebimentos, error: recError } = await supabase
        .from('recebimentos')
        .select('fornecedor, status, qtd_pedida, qtd_recebida, divergencia, created_at');

      if (recError) throw recError;

      // Buscar triagens para qualidade
      const { data: triagens, error: triagError } = await supabase
        .from('triagens')
        .select('pedido, percentual_aprovacao, status');

      if (triagError) throw triagError;

      // Buscar trocas/devoluções
      const { data: trocas, error: trocasError } = await supabase
        .from('trocas_devolucoes')
        .select('fornecedor, tipo, status');

      if (trocasError) console.error('Erro ao buscar trocas:', trocasError);

      // Agrupar por fornecedor
      const fornecedoresMap: Record<string, Fornecedor> = {};

      // Processar recebimentos
      (recebimentos || []).forEach(rec => {
        if (!rec.fornecedor) return;

        if (!fornecedoresMap[rec.fornecedor]) {
          fornecedoresMap[rec.fornecedor] = {
            id: rec.fornecedor,
            nome: rec.fornecedor,
            categoria: 'Brindes', // Default
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
            created_at: rec.created_at,
            updated_at: rec.created_at,
          };
        }

        const f = fornecedoresMap[rec.fornecedor];
        f.entregas_totais++;
        f.itens_recebidos += rec.qtd_recebida || rec.qtd_pedida || 0;

        // Considerar "no prazo" se status != divergencia
        if (rec.status !== 'divergencia') {
          f.entregas_no_prazo++;
        }
      });

      // Processar trocas/devoluções
      (trocas || []).forEach(td => {
        if (!td.fornecedor || !fornecedoresMap[td.fornecedor]) return;
        fornecedoresMap[td.fornecedor].trocas_devolucoes++;
      });

      // Calcular métricas finais
      Object.values(fornecedoresMap).forEach(f => {
        // Pontualidade
        f.percentual_pontualidade = f.entregas_totais > 0
          ? Math.round((f.entregas_no_prazo / f.entregas_totais) * 100)
          : 0;

        // Qualidade (baseado em triagens - simplificado)
        // TODO: Correlacionar triagens com fornecedor através do pedido
        f.percentual_qualidade = 95; // Default alto

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
