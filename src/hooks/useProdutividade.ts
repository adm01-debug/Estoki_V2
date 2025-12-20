import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface Operador {
  id: string;
  nome: string;
  email: string;
  role: string;
}

export interface MetricaOperador {
  operadorId: string;
  operadorNome: string;
  triagensRealizadas: number;
  tempoMedioTriagem: number; // em minutos
  aprovacaoMedia: number; // percentual
  tarefasConcluidas: number;
  xpTotal: number;
  nivel: number;
}

export interface MetricaDiaria {
  data: string;
  triagens: number;
  tarefas: number;
  tempoMedio: number;
}

export function useProdutividade() {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [metricas, setMetricas] = useState<MetricaOperador[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchOperadores = useCallback(async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select(`
          id,
          nome,
          email
        `);

      if (profilesError) throw profilesError;

      // Fetch roles separately
      const { data: roles } = await supabase
        .from('user_roles')
        .select('user_id, role');

      const rolesMap = new Map((roles || []).map(r => [r.user_id, r.role]));

      const ops = (profiles || []).map(p => ({
        id: p.id,
        nome: p.nome || p.email || 'Sem nome',
        email: p.email || '',
        role: rolesMap.get(p.id) || 'operador',
      }));

      setOperadores(ops);
      return ops;
    } catch (err) {
      console.error('Erro ao buscar operadores:', err);
      return [];
    }
  }, []);

  const fetchMetricas = useCallback(async (periodo: 'hoje' | 'semana' | 'mes' = 'mes') => {
    try {
      setLoading(true);
      setError(null);

      const ops = await fetchOperadores();

      // Calcular data de início do período
      const agora = new Date();
      const dataInicio = new Date();
      
      switch (periodo) {
        case 'hoje':
          dataInicio.setHours(0, 0, 0, 0);
          break;
        case 'semana':
          dataInicio.setDate(agora.getDate() - 7);
          break;
        case 'mes':
          dataInicio.setDate(agora.getDate() - 30);
          break;
      }

      const metricasCalculadas: MetricaOperador[] = [];

      for (const op of ops) {
        // Buscar eventos de triagem do operador (tabela eventos_triagem)
        const { data: triagens } = await supabase
          .from('eventos_triagem')
          .select('id, data_inicio, data_fim, resultado')
          .eq('operador_id', op.id)
          .gte('data_fim', dataInicio.toISOString())
          .not('data_fim', 'is', null);

        // Buscar tarefas concluídas
        const { data: tarefas } = await supabase
          .from('tarefas')
          .select('id')
          .eq('operador_id', op.id)
          .eq('status', 'concluida')
          .gte('updated_at', dataInicio.toISOString());

        // Buscar dados de gamificação
        const { data: gamificacao } = await supabase
          .from('gamificacao_usuarios')
          .select('xp_total, nivel')
          .eq('user_id', op.id)
          .single();

        // Calcular métricas
        const triagensRealizadas = triagens?.length || 0;
        
        let tempoTotal = 0;
        let aprovados = 0;
        
        (triagens || []).forEach(t => {
          if (t.data_inicio && t.data_fim) {
            const inicio = new Date(t.data_inicio);
            const fim = new Date(t.data_fim);
            tempoTotal += (fim.getTime() - inicio.getTime()) / 60000; // em minutos
          }
          if (t.resultado === 'aprovado') {
            aprovados++;
          }
        });

        const aprovacaoMedia = triagensRealizadas > 0 
          ? (aprovados / triagensRealizadas) * 100 
          : 0;

        metricasCalculadas.push({
          operadorId: op.id,
          operadorNome: op.nome,
          triagensRealizadas,
          tempoMedioTriagem: triagensRealizadas > 0 ? Math.round(tempoTotal / triagensRealizadas) : 0,
          aprovacaoMedia: Math.round(aprovacaoMedia * 10) / 10,
          tarefasConcluidas: tarefas?.length || 0,
          xpTotal: gamificacao?.xp_total || 0,
          nivel: gamificacao?.nivel || 1,
        });
      }

      // Ordenar por triagens realizadas (decrescente)
      metricasCalculadas.sort((a, b) => b.triagensRealizadas - a.triagensRealizadas);

      setMetricas(metricasCalculadas);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao calcular métricas';
      setError(message);
      console.error('Erro ao calcular métricas:', err);
    } finally {
      setLoading(false);
    }
  }, [fetchOperadores]);

  useEffect(() => {
    fetchMetricas('mes');
  }, [fetchMetricas]);

  const getMetricasDiarias = async (
    operadorId: string,
    dias: number = 30
  ): Promise<MetricaDiaria[]> => {
    try {
      const dataInicio = new Date();
      dataInicio.setDate(dataInicio.getDate() - dias);

      // Buscar triagens (eventos_triagem)
      const { data: triagens } = await supabase
        .from('eventos_triagem')
        .select('data_fim, data_inicio')
        .eq('operador_id', operadorId)
        .gte('data_fim', dataInicio.toISOString())
        .not('data_fim', 'is', null);

      // Buscar tarefas
      const { data: tarefas } = await supabase
        .from('tarefas')
        .select('updated_at')
        .eq('operador_id', operadorId)
        .eq('status', 'concluida')
        .gte('updated_at', dataInicio.toISOString());

      // Agrupar por dia
      const metricasPorDia: Record<string, MetricaDiaria> = {};

      // Inicializar todos os dias
      for (let i = 0; i < dias; i++) {
        const data = new Date();
        data.setDate(data.getDate() - i);
        const dataStr = data.toISOString().split('T')[0];
        metricasPorDia[dataStr] = {
          data: dataStr,
          triagens: 0,
          tarefas: 0,
          tempoMedio: 0,
        };
      }

      // Contar triagens e calcular tempo
      const temposPorDia: Record<string, number[]> = {};
      
      (triagens || []).forEach(t => {
        if (!t.data_fim) return;
        const dataStr = t.data_fim.split('T')[0];
        if (metricasPorDia[dataStr]) {
          metricasPorDia[dataStr].triagens++;
          
          if (t.data_inicio) {
            const inicio = new Date(t.data_inicio);
            const fim = new Date(t.data_fim);
            const tempo = (fim.getTime() - inicio.getTime()) / 60000;
            
            if (!temposPorDia[dataStr]) temposPorDia[dataStr] = [];
            temposPorDia[dataStr].push(tempo);
          }
        }
      });

      // Calcular tempo médio
      Object.keys(temposPorDia).forEach(dataStr => {
        const tempos = temposPorDia[dataStr];
        if (tempos.length > 0) {
          metricasPorDia[dataStr].tempoMedio = Math.round(
            tempos.reduce((a, b) => a + b, 0) / tempos.length
          );
        }
      });

      // Contar tarefas
      (tarefas || []).forEach(t => {
        const dataStr = t.updated_at.split('T')[0];
        if (metricasPorDia[dataStr]) {
          metricasPorDia[dataStr].tarefas++;
        }
      });

      // Converter para array ordenado por data
      return Object.values(metricasPorDia).sort((a, b) => 
        a.data.localeCompare(b.data)
      );
    } catch (err) {
      console.error('Erro ao buscar métricas diárias:', err);
      return [];
    }
  };

  const getRanking = useCallback(() => {
    return [...metricas].sort((a, b) => {
      // Ordenar por XP total, depois por triagens
      if (b.xpTotal !== a.xpTotal) return b.xpTotal - a.xpTotal;
      return b.triagensRealizadas - a.triagensRealizadas;
    });
  }, [metricas]);

  const getMetricasGerais = useCallback(() => {
    const totalTriagens = metricas.reduce((acc, m) => acc + m.triagensRealizadas, 0);
    const totalTarefas = metricas.reduce((acc, m) => acc + m.tarefasConcluidas, 0);
    const tempoMedioGeral = metricas.length > 0
      ? metricas.reduce((acc, m) => acc + m.tempoMedioTriagem, 0) / metricas.length
      : 0;
    const aprovacaoMediaGeral = metricas.length > 0
      ? metricas.reduce((acc, m) => acc + m.aprovacaoMedia, 0) / metricas.length
      : 0;

    return {
      totalOperadores: operadores.length,
      totalTriagens,
      totalTarefas,
      tempoMedioGeral: Math.round(tempoMedioGeral),
      aprovacaoMediaGeral: Math.round(aprovacaoMediaGeral * 10) / 10,
    };
  }, [metricas, operadores]);

  return {
    operadores,
    metricas,
    loading,
    error,
    refetch: fetchMetricas,
    getMetricasDiarias,
    getRanking,
    getMetricasGerais,
  };
}
