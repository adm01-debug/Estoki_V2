import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useRealtimeKPIs } from './useRealtimeKPIs';

export interface LiveOperationalData {
  // Picking
  pickingEmAndamento: number;
  pickingConcluidos: number;
  pickingAcuracidade: number;
  // Triagem
  triagensHoje: number;
  triagensAprovadas: number;
  taxaAprovacao: number;
  // Recebimento
  lotesAguardando: number;
  lotesConferidos: number;
  lotesDivergencia: number;
  // Tarefas
  tarefasPendentes: number;
  tarefasEmExecucao: number;
  tarefasConcluidas: number;
  // Posições
  posicaoOcupadas: number;
  posicaoLivres: number;
  taxaOcupacao: number;
  // Alertas
  alertasAtivos: number;
  alertasCriticos: number;
  // Atividade recente
  atividadeRecente: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  tipo: 'triagem' | 'picking' | 'recebimento' | 'tarefa' | 'alerta';
  descricao: string;
  timestamp: string;
  operador?: string;
}

const today = () => new Date().toISOString().split('T')[0];

export function useOperationalLive() {
  const realtimeStatus = useRealtimeKPIs({ showToasts: false });

  const { data, isLoading, error } = useQuery({
    queryKey: ['operational-live', today()],
    queryFn: async (): Promise<LiveOperationalData> => {
      const todayStr = today();

      const [
        pickingRes,
        triagemRes,
        lotesRes,
        tarefasRes,
        posicoesRes,
        alertasRes,
        atividadeTriagemRes,
        atividadePickingRes,
      ] = await Promise.all([
        // Picking events today
        supabase.from('eventos_picking')
          .select('id, correto, data_fim')
          .gte('data_inicio', `${todayStr}T00:00:00`),
        // Triagem events today
        supabase.from('eventos_triagem')
          .select('id, resultado, data_fim, operador_id')
          .gte('data_inicio', `${todayStr}T00:00:00`),
        // Lotes by status
        supabase.from('lotes')
          .select('id, status'),
        // Tarefas by status
        supabase.from('tarefas')
          .select('id, status'),
        // Posições
        supabase.from('posicoes_estoque')
          .select('id, status'),
        // Alertas ativos
        supabase.from('alertas_historico')
          .select('id, severidade, status')
          .eq('status', 'ativo'),
        // Recent triage
        supabase.from('eventos_triagem')
          .select('id, resultado, data_fim, operador_id')
          .order('created_at', { ascending: false })
          .limit(5),
        // Recent picking
        supabase.from('eventos_picking')
          .select('id, correto, data_fim, operador_id')
          .order('created_at', { ascending: false })
          .limit(5),
      ]);

      const pickingData = pickingRes.data || [];
      const triagemData = triagemRes.data || [];
      const lotesData = lotesRes.data || [];
      const tarefasData = tarefasRes.data || [];
      const posicoesData = posicoesRes.data || [];
      const alertasData = alertasRes.data || [];

      const pickingEmAndamento = pickingData.filter(p => !p.data_fim).length;
      const pickingConcluidos = pickingData.filter(p => p.data_fim).length;
      const pickingCorretos = pickingData.filter(p => p.correto === true).length;
      const pickingAcuracidade = pickingConcluidos > 0 ? (pickingCorretos / pickingConcluidos) * 100 : 100;

      const triagensAprovadas = triagemData.filter(t => t.resultado === 'aprovado').length;
      const taxaAprovacao = triagemData.length > 0 ? (triagensAprovadas / triagemData.length) * 100 : 100;

      const lotesAguardando = lotesData.filter(l => l.status === 'aguardando').length;
      const lotesConferidos = lotesData.filter(l => l.status === 'conferido').length;
      const lotesDivergencia = lotesData.filter(l => l.status === 'divergencia').length;

      const tarefasPendentes = tarefasData.filter(t => t.status === 'pendente').length;
      const tarefasEmExecucao = tarefasData.filter(t => t.status === 'em_andamento').length;
      const tarefasConcluidas = tarefasData.filter(t => t.status === 'concluida').length;

      const posicaoOcupadas = posicoesData.filter(p => p.status === 'ocupado').length;
      const posicaoLivres = posicoesData.filter(p => p.status === 'livre').length;
      const totalPosicoes = posicoesData.length;
      const taxaOcupacao = totalPosicoes > 0 ? (posicaoOcupadas / totalPosicoes) * 100 : 0;

      const alertasCriticos = alertasData.filter(a => a.severidade === 'critico').length;

      // Build activity feed
      const atividadeRecente: ActivityItem[] = [
        ...(atividadeTriagemRes.data || []).map(t => ({
          id: t.id,
          tipo: 'triagem' as const,
          descricao: `Triagem ${t.resultado === 'aprovado' ? 'aprovada ✓' : t.resultado === 'reprovado' ? 'reprovada ✗' : 'em andamento'}`,
          timestamp: t.data_fim || new Date().toISOString(),
          operador: t.operador_id?.slice(0, 8),
        })),
        ...(atividadePickingRes.data || []).map(p => ({
          id: p.id,
          tipo: 'picking' as const,
          descricao: `Picking ${p.correto ? 'correto ✓' : 'com erro ✗'}`,
          timestamp: p.data_fim || new Date().toISOString(),
          operador: p.operador_id?.slice(0, 8),
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 10);

      return {
        pickingEmAndamento,
        pickingConcluidos,
        pickingAcuracidade,
        triagensHoje: triagemData.length,
        triagensAprovadas,
        taxaAprovacao,
        lotesAguardando,
        lotesConferidos,
        lotesDivergencia,
        tarefasPendentes,
        tarefasEmExecucao,
        tarefasConcluidas,
        posicaoOcupadas,
        posicaoLivres,
        taxaOcupacao,
        alertasAtivos: alertasData.length,
        alertasCriticos,
        atividadeRecente,
      };
    },
    refetchInterval: 30000, // Backup polling every 30s
  });

  return {
    data: data ?? null,
    isLoading,
    error,
    realtimeStatus,
  };
}
