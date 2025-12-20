import { useState, useEffect, useMemo, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";

export interface DivergenciaRecord {
  id: string;
  numero_lote: string;
  fornecedor: string;
  produto_nome: string;
  quantidade_pedida: number;
  quantidade_recebida: number;
  diferenca: number;
  percentual: number;
  data_conferencia: string;
  tipo: 'falta' | 'sobra';
}

export interface FornecedorMetrica {
  fornecedor: string;
  total_recebimentos: number;
  total_divergencias: number;
  taxa_divergencia: number;
  valor_total_diferenca: number;
  media_diferenca_percentual: number;
}

export interface DivergenciasKPIs {
  totalDivergencias: number;
  totalFaltas: number;
  totalSobras: number;
  taxaDivergencia: number;
  valorTotalDiferenca: number;
  fornecedorCritico: string;
  tendencia: 'up' | 'down' | 'stable';
}

export interface UseDivergenciasReturn {
  divergencias: DivergenciaRecord[];
  metricasFornecedor: FornecedorMetrica[];
  kpis: DivergenciasKPIs;
  loading: boolean;
  error: string | null;
  refetch: (dias?: number) => Promise<void>;
  getDivergenciasPorFornecedor: (fornecedor: string) => DivergenciaRecord[];
  getDivergenciasPorTipo: (tipo: 'falta' | 'sobra') => DivergenciaRecord[];
  getEvolucaoDiaria: () => { data: string; faltas: number; sobras: number }[];
  getTopFornecedoresCriticos: (limit?: number) => FornecedorMetrica[];
}

export function useDivergencias(diasIniciais: number = 30): UseDivergenciasReturn {
  const [divergencias, setDivergencias] = useState<DivergenciaRecord[]>([]);
  const [metricasFornecedor, setMetricasFornecedor] = useState<FornecedorMetrica[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async (dias: number = diasIniciais) => {
    setLoading(true);
    setError(null);
    
    try {
      const dataInicio = subDays(new Date(), dias);

      // Buscar lotes com divergência ou conferidos
      const { data: lotes, error: lotesError } = await supabase
        .from('lotes')
        .select(`
          id,
          numero_lote,
          fornecedor,
          quantidade_inicial,
          quantidade_atual,
          quantidade_pedida,
          status,
          data_conferencia,
          created_at,
          produtos (nome)
        `)
        .gte('created_at', dataInicio.toISOString())
        .in('status', ['conferido', 'divergencia'])
        .order('created_at', { ascending: false });

      if (lotesError) throw lotesError;

      // Processar divergências
      const divergenciasProcessadas: DivergenciaRecord[] = (lotes || [])
        .filter((lote: any) => {
          const pedida = lote.quantidade_pedida || lote.quantidade_inicial || 0;
          const recebida = lote.quantidade_atual || 0;
          return pedida !== recebida;
        })
        .map((lote: any) => {
          const pedida = lote.quantidade_pedida || lote.quantidade_inicial || 0;
          const recebida = lote.quantidade_atual || 0;
          const diferenca = recebida - pedida;
          const percentual = pedida > 0 ? Math.abs((diferenca / pedida) * 100) : 0;

          return {
            id: lote.id,
            numero_lote: lote.numero_lote || '-',
            fornecedor: lote.fornecedor || 'Não informado',
            produto_nome: lote.produtos?.nome || 'Produto não identificado',
            quantidade_pedida: pedida,
            quantidade_recebida: recebida,
            diferenca: Math.abs(diferenca),
            percentual,
            data_conferencia: lote.data_conferencia || lote.created_at,
            tipo: diferenca < 0 ? 'falta' as const : 'sobra' as const,
          };
        });

      setDivergencias(divergenciasProcessadas);

      // Calcular métricas por fornecedor
      const fornecedoresMap = new Map<string, FornecedorMetrica>();
      
      (lotes || []).forEach((lote: any) => {
        const fornecedor = lote.fornecedor || 'Não informado';
        const pedida = lote.quantidade_pedida || lote.quantidade_inicial || 0;
        const recebida = lote.quantidade_atual || 0;
        const hasDivergencia = pedida !== recebida;
        const diferenca = Math.abs(recebida - pedida);
        const percentual = pedida > 0 ? (diferenca / pedida) * 100 : 0;

        if (!fornecedoresMap.has(fornecedor)) {
          fornecedoresMap.set(fornecedor, {
            fornecedor,
            total_recebimentos: 0,
            total_divergencias: 0,
            taxa_divergencia: 0,
            valor_total_diferenca: 0,
            media_diferenca_percentual: 0,
          });
        }

        const metrica = fornecedoresMap.get(fornecedor)!;
        metrica.total_recebimentos++;
        if (hasDivergencia) {
          metrica.total_divergencias++;
          metrica.valor_total_diferenca += diferenca;
          metrica.media_diferenca_percentual = 
            (metrica.media_diferenca_percentual * (metrica.total_divergencias - 1) + percentual) / 
            metrica.total_divergencias;
        }
        metrica.taxa_divergencia = (metrica.total_divergencias / metrica.total_recebimentos) * 100;
      });

      setMetricasFornecedor(Array.from(fornecedoresMap.values()));

    } catch (err) {
      console.error('Erro ao buscar divergências:', err);
      setError(err instanceof Error ? err.message : 'Erro ao carregar dados');
    } finally {
      setLoading(false);
    }
  }, [diasIniciais]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // KPIs calculados
  const kpis = useMemo<DivergenciasKPIs>(() => {
    const faltas = divergencias.filter(d => d.tipo === 'falta');
    const sobras = divergencias.filter(d => d.tipo === 'sobra');
    const totalDiferenca = divergencias.reduce((acc, d) => acc + d.diferenca, 0);
    
    const fornecedorCritico = metricasFornecedor.length > 0
      ? metricasFornecedor.reduce((a, b) => a.taxa_divergencia > b.taxa_divergencia ? a : b).fornecedor
      : '-';

    // Calcular tendência (comparar primeira metade com segunda metade do período)
    const meio = Math.floor(divergencias.length / 2);
    const primeiraMeta = divergencias.slice(meio);
    const segundaMetade = divergencias.slice(0, meio);
    const tendencia = segundaMetade.length > primeiraMeta.length 
      ? 'up' 
      : segundaMetade.length < primeiraMeta.length 
        ? 'down' 
        : 'stable';

    return {
      totalDivergencias: divergencias.length,
      totalFaltas: faltas.length,
      totalSobras: sobras.length,
      taxaDivergencia: divergencias.length > 0 
        ? (divergencias.length / (divergencias.length + metricasFornecedor.reduce((acc, m) => acc + m.total_recebimentos - m.total_divergencias, 0))) * 100 
        : 0,
      valorTotalDiferenca: totalDiferenca,
      fornecedorCritico,
      tendencia,
    };
  }, [divergencias, metricasFornecedor]);

  // Funções de filtro
  const getDivergenciasPorFornecedor = useCallback((fornecedor: string) => {
    return divergencias.filter(d => d.fornecedor === fornecedor);
  }, [divergencias]);

  const getDivergenciasPorTipo = useCallback((tipo: 'falta' | 'sobra') => {
    return divergencias.filter(d => d.tipo === tipo);
  }, [divergencias]);

  const getEvolucaoDiaria = useCallback(() => {
    const evolucaoMap = new Map<string, { faltas: number; sobras: number }>();
    
    divergencias.forEach(d => {
      const data = d.data_conferencia.split('T')[0];
      if (!evolucaoMap.has(data)) {
        evolucaoMap.set(data, { faltas: 0, sobras: 0 });
      }
      const entry = evolucaoMap.get(data)!;
      if (d.tipo === 'falta') entry.faltas++;
      else entry.sobras++;
    });

    return Array.from(evolucaoMap.entries())
      .map(([data, valores]) => ({ data, ...valores }))
      .sort((a, b) => a.data.localeCompare(b.data));
  }, [divergencias]);

  const getTopFornecedoresCriticos = useCallback((limit: number = 5) => {
    return [...metricasFornecedor]
      .sort((a, b) => b.taxa_divergencia - a.taxa_divergencia)
      .slice(0, limit);
  }, [metricasFornecedor]);

  return {
    divergencias,
    metricasFornecedor,
    kpis,
    loading,
    error,
    refetch: fetchData,
    getDivergenciasPorFornecedor,
    getDivergenciasPorTipo,
    getEvolucaoDiaria,
    getTopFornecedoresCriticos,
  };
}
