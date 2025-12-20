import { useState, useEffect, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays, format, startOfWeek, endOfWeek, eachDayOfInterval } from "date-fns";
import { ptBR } from "date-fns/locale";

export interface MetricaOperacional {
  id: string;
  data: string;
  itens_triados: number | null;
  tempo_total_triagem_minutos: number | null;
  tempo_medio_triagem_minutos: number | null;
  itens_aprovados: number | null;
  itens_reprovados: number | null;
  taxa_aprovacao: number | null;
  pedidos_separados: number | null;
  itens_separados: number | null;
  erros_picking: number | null;
  acuracidade_picking: number | null;
  tempo_total_picking_minutos: number | null;
  posicoes_totais: number | null;
  posicoes_ocupadas: number | null;
  taxa_ocupacao: number | null;
  volumes_recebidos: number | null;
  nfs_processadas: number | null;
  tempo_medio_recebimento_minutos: number | null;
  movimentacoes_realizadas: number | null;
}

export interface MetaKPI {
  id: string;
  nome: string;
  descricao: string | null;
  tipo: string;
  metrica: string;
  valor_meta: number;
  valor_alerta: number | null;
  unidade: string | null;
  ativo: boolean;
  created_at: string;
}

export interface KPIConsolidado {
  // Triagem
  totalItensTriados: number;
  tempoMedioTriagem: number;
  taxaAprovacao: number;
  itensAprovados: number;
  itensReprovados: number;
  
  // Picking/Separação
  pedidosSeparados: number;
  itensSeparados: number;
  errosPicking: number;
  acuracidadePicking: number;
  
  // Armazenamento
  taxaOcupacao: number;
  posicoesTotais: number;
  posicoesOcupadas: number;
  
  // Recebimento
  volumesRecebidos: number;
  nfsProcessadas: number;
  tempoMedioRecebimento: number;
  
  // Movimentações
  movimentacoesRealizadas: number;
}

export interface EvolucaoDiaria {
  data: string;
  dataFormatada: string;
  itensTriados: number;
  pedidosSeparados: number;
  taxaAprovacao: number;
  acuracidadePicking: number;
}

export interface UseKPIsOperacionaisReturn {
  metricas: MetricaOperacional[];
  metas: MetaKPI[];
  kpisConsolidados: KPIConsolidado;
  evolucaoDiaria: EvolucaoDiaria[];
  evolucaoSemanal: { semana: string; media: number }[];
  loading: boolean;
  error: string | null;
  refetch: () => void;
  
  // Mutations
  salvarMeta: (meta: Partial<MetaKPI>) => Promise<void>;
  excluirMeta: (id: string) => Promise<void>;
  
  // Helpers
  getMetricaPorData: (data: string) => MetricaOperacional | undefined;
  getKPIStatus: (metrica: string, valor: number) => 'success' | 'warning' | 'danger';
  calcularVariacao: (metrica: string) => { valor: number; tipo: 'up' | 'down' | 'stable' };
}

export function useKPIsOperacionais(diasIniciais: number = 30): UseKPIsOperacionaisReturn {
  const queryClient = useQueryClient();
  const [periodo, setPeriodo] = useState(diasIniciais);

  // Query para métricas operacionais
  const { 
    data: metricas = [], 
    isLoading: loadingMetricas,
    error: errorMetricas,
    refetch: refetchMetricas
  } = useQuery({
    queryKey: ['metricas-operacionais', periodo],
    queryFn: async () => {
      const dataInicio = subDays(new Date(), periodo);
      const { data, error } = await supabase
        .from('metricas_operacionais')
        .select('*')
        .gte('data', dataInicio.toISOString().split('T')[0])
        .order('data', { ascending: false });
      
      if (error) throw error;
      return (data || []) as MetricaOperacional[];
    },
    staleTime: 1000 * 60 * 5, // 5 minutos
  });

  // Query para metas
  const {
    data: metas = [],
    isLoading: loadingMetas,
    error: errorMetas,
    refetch: refetchMetas
  } = useQuery({
    queryKey: ['metas-kpi'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('metas_kpi')
        .select('*')
        .eq('ativo', true)
        .order('nome');
      
      if (error) throw error;
      return (data || []) as MetaKPI[];
    },
    staleTime: 1000 * 60 * 10, // 10 minutos
  });

  // Mutation para salvar meta
  const salvarMetaMutation = useMutation({
    mutationFn: async (meta: Partial<MetaKPI>) => {
      if (meta.id) {
        const { error } = await supabase
          .from('metas_kpi')
          .update(meta)
          .eq('id', meta.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('metas_kpi')
          .insert(meta);
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-kpi'] });
    },
  });

  // Mutation para excluir meta
  const excluirMetaMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('metas_kpi')
        .delete()
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-kpi'] });
    },
  });

  // KPIs consolidados
  const kpisConsolidados = useMemo<KPIConsolidado>(() => {
    if (metricas.length === 0) {
      return {
        totalItensTriados: 0,
        tempoMedioTriagem: 0,
        taxaAprovacao: 0,
        itensAprovados: 0,
        itensReprovados: 0,
        pedidosSeparados: 0,
        itensSeparados: 0,
        errosPicking: 0,
        acuracidadePicking: 0,
        taxaOcupacao: 0,
        posicoesTotais: 0,
        posicoesOcupadas: 0,
        volumesRecebidos: 0,
        nfsProcessadas: 0,
        tempoMedioRecebimento: 0,
        movimentacoesRealizadas: 0,
      };
    }

    const soma = metricas.reduce((acc, m) => ({
      itensTriados: acc.itensTriados + (m.itens_triados || 0),
      itensAprovados: acc.itensAprovados + (m.itens_aprovados || 0),
      itensReprovados: acc.itensReprovados + (m.itens_reprovados || 0),
      pedidosSeparados: acc.pedidosSeparados + (m.pedidos_separados || 0),
      itensSeparados: acc.itensSeparados + (m.itens_separados || 0),
      errosPicking: acc.errosPicking + (m.erros_picking || 0),
      volumesRecebidos: acc.volumesRecebidos + (m.volumes_recebidos || 0),
      nfsProcessadas: acc.nfsProcessadas + (m.nfs_processadas || 0),
      movimentacoes: acc.movimentacoes + (m.movimentacoes_realizadas || 0),
      tempoTriagem: acc.tempoTriagem + (m.tempo_medio_triagem_minutos || 0),
      tempoRecebimento: acc.tempoRecebimento + (m.tempo_medio_recebimento_minutos || 0),
      acuracidadePicking: acc.acuracidadePicking + (m.acuracidade_picking || 0),
      countMetricas: acc.countMetricas + 1,
    }), {
      itensTriados: 0,
      itensAprovados: 0,
      itensReprovados: 0,
      pedidosSeparados: 0,
      itensSeparados: 0,
      errosPicking: 0,
      volumesRecebidos: 0,
      nfsProcessadas: 0,
      movimentacoes: 0,
      tempoTriagem: 0,
      tempoRecebimento: 0,
      acuracidadePicking: 0,
      countMetricas: 0,
    });

    // Pegar última métrica para dados de ocupação
    const ultimaMetrica = metricas[0];

    return {
      totalItensTriados: soma.itensTriados,
      tempoMedioTriagem: soma.countMetricas > 0 ? soma.tempoTriagem / soma.countMetricas : 0,
      taxaAprovacao: soma.itensTriados > 0 
        ? (soma.itensAprovados / soma.itensTriados) * 100 
        : 0,
      itensAprovados: soma.itensAprovados,
      itensReprovados: soma.itensReprovados,
      pedidosSeparados: soma.pedidosSeparados,
      itensSeparados: soma.itensSeparados,
      errosPicking: soma.errosPicking,
      acuracidadePicking: soma.countMetricas > 0 ? soma.acuracidadePicking / soma.countMetricas : 0,
      taxaOcupacao: ultimaMetrica?.taxa_ocupacao || 0,
      posicoesTotais: ultimaMetrica?.posicoes_totais || 0,
      posicoesOcupadas: ultimaMetrica?.posicoes_ocupadas || 0,
      volumesRecebidos: soma.volumesRecebidos,
      nfsProcessadas: soma.nfsProcessadas,
      tempoMedioRecebimento: soma.countMetricas > 0 ? soma.tempoRecebimento / soma.countMetricas : 0,
      movimentacoesRealizadas: soma.movimentacoes,
    };
  }, [metricas]);

  // Evolução diária
  const evolucaoDiaria = useMemo<EvolucaoDiaria[]>(() => {
    return metricas
      .slice(0, 30)
      .reverse()
      .map(m => ({
        data: m.data,
        dataFormatada: format(new Date(m.data), "dd/MM", { locale: ptBR }),
        itensTriados: m.itens_triados || 0,
        pedidosSeparados: m.pedidos_separados || 0,
        taxaAprovacao: m.taxa_aprovacao || 0,
        acuracidadePicking: m.acuracidade_picking || 0,
      }));
  }, [metricas]);

  // Evolução semanal
  const evolucaoSemanal = useMemo(() => {
    const semanas = new Map<string, number[]>();
    
    metricas.forEach(m => {
      const data = new Date(m.data);
      const inicioSemana = startOfWeek(data, { locale: ptBR });
      const chave = format(inicioSemana, "dd/MM", { locale: ptBR });
      
      if (!semanas.has(chave)) {
        semanas.set(chave, []);
      }
      semanas.get(chave)!.push(m.itens_triados || 0);
    });

    return Array.from(semanas.entries()).map(([semana, valores]) => ({
      semana,
      media: valores.reduce((a, b) => a + b, 0) / valores.length,
    }));
  }, [metricas]);

  // Helpers
  const getMetricaPorData = useCallback((data: string) => {
    return metricas.find(m => m.data === data);
  }, [metricas]);

  const getKPIStatus = useCallback((metrica: string, valor: number): 'success' | 'warning' | 'danger' => {
    const meta = metas.find(m => m.metrica === metrica);
    if (!meta) return 'success';
    
    if (meta.tipo === 'maior_melhor') {
      if (valor >= meta.valor_meta) return 'success';
      if (meta.valor_alerta && valor >= meta.valor_alerta) return 'warning';
      return 'danger';
    } else {
      if (valor <= meta.valor_meta) return 'success';
      if (meta.valor_alerta && valor <= meta.valor_alerta) return 'warning';
      return 'danger';
    }
  }, [metas]);

  const calcularVariacao = useCallback((metrica: string): { valor: number; tipo: 'up' | 'down' | 'stable' } => {
    if (metricas.length < 2) return { valor: 0, tipo: 'stable' };
    
    const atual = (metricas[0] as any)[metrica] || 0;
    const anterior = (metricas[1] as any)[metrica] || 0;
    
    if (anterior === 0) return { valor: 0, tipo: 'stable' };
    
    const variacao = ((atual - anterior) / anterior) * 100;
    
    return {
      valor: Math.abs(variacao),
      tipo: variacao > 1 ? 'up' : variacao < -1 ? 'down' : 'stable',
    };
  }, [metricas]);

  const refetch = useCallback(() => {
    refetchMetricas();
    refetchMetas();
  }, [refetchMetricas, refetchMetas]);

  return {
    metricas,
    metas,
    kpisConsolidados,
    evolucaoDiaria,
    evolucaoSemanal,
    loading: loadingMetricas || loadingMetas,
    error: errorMetricas?.message || errorMetas?.message || null,
    refetch,
    salvarMeta: salvarMetaMutation.mutateAsync,
    excluirMeta: excluirMetaMutation.mutateAsync,
    getMetricaPorData,
    getKPIStatus,
    calcularVariacao,
  };
}
