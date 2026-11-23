import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useRealtimeKPIs } from "./useRealtimeKPIs";
import { startOfDay } from "@/utils/date";

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
  tipo: "triagem" | "picking" | "recebimento" | "tarefa" | "alerta";
  descricao: string;
  timestamp: string;
  operador?: string;
}

const hojeLocal = () => {
  const agora = new Date();
  const mes = String(agora.getMonth() + 1).padStart(2, "0");
  const dia = String(agora.getDate()).padStart(2, "0");
  return `${agora.getFullYear()}-${mes}-${dia}`;
};

// Tudo abaixo conta no servidor (head + count): baixar a tabela inteira e contar no
// cliente truncava silenciosamente em 1000 linhas.
export function useOperationalLive() {
  const realtimeStatus = useRealtimeKPIs({ showToasts: false });

  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ["operational-live", hojeLocal()],
    queryFn: async (): Promise<LiveOperationalData> => {
      const inicioDoDia = startOfDay(new Date()).toISOString();

      const responses = await Promise.all([
        // Picking de hoje
        supabase
          .from("eventos_picking")
          .select("id", { count: "exact", head: true })
          .gte("data_inicio", inicioDoDia)
          .is("data_fim", null),
        supabase
          .from("eventos_picking")
          .select("id", { count: "exact", head: true })
          .gte("data_inicio", inicioDoDia)
          .not("data_fim", "is", null),
        supabase
          .from("eventos_picking")
          .select("id", { count: "exact", head: true })
          .gte("data_inicio", inicioDoDia)
          .not("data_fim", "is", null)
          .eq("correto", true),
        // Triagem de hoje
        supabase
          .from("eventos_triagem")
          .select("id", { count: "exact", head: true })
          .gte("data_inicio", inicioDoDia),
        supabase
          .from("eventos_triagem")
          .select("id", { count: "exact", head: true })
          .gte("data_inicio", inicioDoDia)
          .eq("resultado", "aprovado"),
        // Lotes por status
        supabase
          .from("lotes")
          .select("id", { count: "exact", head: true })
          .eq("status", "aguardando"),
        supabase
          .from("lotes")
          .select("id", { count: "exact", head: true })
          .eq("status", "conferido"),
        supabase
          .from("lotes")
          .select("id", { count: "exact", head: true })
          .eq("status", "divergencia"),
        // Tarefas por status
        supabase
          .from("tarefas")
          .select("id", { count: "exact", head: true })
          .eq("status", "pendente"),
        supabase
          .from("tarefas")
          .select("id", { count: "exact", head: true })
          .eq("status", "em_andamento"),
        supabase
          .from("tarefas")
          .select("id", { count: "exact", head: true })
          .eq("status", "concluida"),
        // Posicoes
        supabase.from("posicoes_estoque").select("id", { count: "exact", head: true }),
        supabase
          .from("posicoes_estoque")
          .select("id", { count: "exact", head: true })
          .eq("status", "ocupado"),
        supabase
          .from("posicoes_estoque")
          .select("id", { count: "exact", head: true })
          .eq("status", "livre"),
        // Alertas ativos
        supabase
          .from("alertas_historico")
          .select("id", { count: "exact", head: true })
          .eq("status", "ativo"),
        supabase
          .from("alertas_historico")
          .select("id", { count: "exact", head: true })
          .eq("status", "ativo")
          .eq("severidade", "critico"),
        // Atividade recente
        supabase
          .from("eventos_triagem")
          .select("id, resultado, data_fim, operador_id")
          .order("created_at", { ascending: false })
          .limit(5),
        supabase
          .from("eventos_picking")
          .select("id, correto, data_fim, operador_id")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

      const falha = responses.find((r) => r.error);
      if (falha && falha.error) throw new Error(falha.error.message);

      const [
        pickingEmAndamentoRes,
        pickingConcluidosRes,
        pickingCorretosRes,
        triagensHojeRes,
        triagensAprovadasRes,
        lotesAguardandoRes,
        lotesConferidosRes,
        lotesDivergenciaRes,
        tarefasPendentesRes,
        tarefasEmExecucaoRes,
        tarefasConcluidasRes,
        totalPosicoesRes,
        posicoesOcupadasRes,
        posicoesLivresRes,
        alertasAtivosRes,
        alertasCriticosRes,
        atividadeTriagemRes,
        atividadePickingRes,
      ] = responses;

      const pickingEmAndamento = pickingEmAndamentoRes.count ?? 0;
      const pickingConcluidos = pickingConcluidosRes.count ?? 0;
      const pickingCorretos = pickingCorretosRes.count ?? 0;
      const pickingAcuracidade =
        pickingConcluidos > 0 ? (pickingCorretos / pickingConcluidos) * 100 : 100;

      const triagensHoje = triagensHojeRes.count ?? 0;
      const triagensAprovadas = triagensAprovadasRes.count ?? 0;
      const taxaAprovacao = triagensHoje > 0 ? (triagensAprovadas / triagensHoje) * 100 : 100;

      const lotesAguardando = lotesAguardandoRes.count ?? 0;
      const lotesConferidos = lotesConferidosRes.count ?? 0;
      const lotesDivergencia = lotesDivergenciaRes.count ?? 0;

      const tarefasPendentes = tarefasPendentesRes.count ?? 0;
      const tarefasEmExecucao = tarefasEmExecucaoRes.count ?? 0;
      const tarefasConcluidas = tarefasConcluidasRes.count ?? 0;

      const posicaoOcupadas = posicoesOcupadasRes.count ?? 0;
      const posicaoLivres = posicoesLivresRes.count ?? 0;
      const totalPosicoes = totalPosicoesRes.count ?? 0;
      const taxaOcupacao = totalPosicoes > 0 ? (posicaoOcupadas / totalPosicoes) * 100 : 0;

      const alertasAtivos = alertasAtivosRes.count ?? 0;
      const alertasCriticos = alertasCriticosRes.count ?? 0;

      // Build activity feed
      const atividadeRecente: ActivityItem[] = [
        ...(atividadeTriagemRes.data || []).map((t) => ({
          id: t.id,
          tipo: "triagem" as const,
          descricao: `Triagem ${t.resultado === "aprovado" ? "aprovada ✓" : t.resultado === "reprovado" ? "reprovada ✗" : "em andamento"}`,
          timestamp: t.data_fim || new Date().toISOString(),
          operador: t.operador_id?.slice(0, 8),
        })),
        ...(atividadePickingRes.data || []).map((p) => ({
          id: p.id,
          tipo: "picking" as const,
          descricao: `Picking ${p.correto ? "correto ✓" : "com erro ✗"}`,
          timestamp: p.data_fim || new Date().toISOString(),
          operador: p.operador_id?.slice(0, 8),
        })),
      ]
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

      return {
        pickingEmAndamento,
        pickingConcluidos,
        pickingAcuracidade,
        triagensHoje,
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
        alertasAtivos,
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
    refetch,
    realtimeStatus,
  };
}
