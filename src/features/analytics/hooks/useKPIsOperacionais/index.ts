import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { subDays } from "date-fns";
import { 
  MetricaOperacional, 
  MetaKPI, 
  KPIConsolidado, 
  EvolucaoDiaria, 
  UseKPIsOperacionaisReturn 
} from "./types";
import { 
  calcularKPIsConsolidados, 
  formatarEvolucaoDiaria, 
  formatarEvolucaoSemanal 
} from "./utils";

export function useKPIsOperacionais(diasIniciais: number = 30): UseKPIsOperacionaisReturn {
  const queryClient = useQueryClient();
  const [periodo] = useState(diasIniciais);

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
    staleTime: 1000 * 60 * 5,
  });

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
    staleTime: 1000 * 60 * 10,
  });

  const salvarMetaMutation = useMutation({
    mutationFn: async (meta: Partial<MetaKPI>) => {
      if (meta.id) {
        const { error } = await supabase
          .from('metas_kpi')
          .update({
            nome: meta.nome,
            descricao: meta.descricao,
            tipo: meta.tipo,
            metrica: meta.metrica,
            valor_meta: meta.valor_meta,
            unidade: meta.unidade,
            ativo: meta.ativo,
          })
          .eq('id', meta.id);
        if (error) throw error;
      } else {
        if (!meta.nome || !meta.tipo || !meta.metrica || meta.valor_meta === undefined) {
          throw new Error('Campos obrigatórios faltando');
        }
        const { error } = await supabase
          .from('metas_kpi')
          .insert({
            nome: meta.nome,
            descricao: meta.descricao,
            tipo: meta.tipo,
            metrica: meta.metrica,
            valor_meta: meta.valor_meta,
            unidade: meta.unidade,
            ativo: meta.ativo ?? true,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metas-kpi'] });
    },
  });

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

  const kpisConsolidados = useMemo<KPIConsolidado>(() => 
    calcularKPIsConsolidados(metricas), [metricas]
  );

  const evolucaoDiaria = useMemo<EvolucaoDiaria[]>(() => 
    formatarEvolucaoDiaria(metricas), [metricas]
  );

  const evolucaoSemanal = useMemo(() => 
    formatarEvolucaoSemanal(metricas), [metricas]
  );

  const getMetricaPorData = useCallback((data: string) => {
    return metricas.find(m => m.data === data);
  }, [metricas]);

  const getKPIStatus = useCallback((metrica: string, valor: number): 'success' | 'warning' | 'danger' => {
    const meta = metas.find(m => m.metrica === metrica);
    if (!meta) return 'success';
    
    const threshold = meta.valor_meta * 0.9;
    
    if (meta.tipo === 'maior_melhor') {
      if (valor >= meta.valor_meta) return 'success';
      if (valor >= threshold) return 'warning';
      return 'danger';
    } else {
      if (valor <= meta.valor_meta) return 'success';
      if (valor <= meta.valor_meta * 1.1) return 'warning';
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
