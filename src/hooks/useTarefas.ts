import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export type TipoTarefa = "separacao" | "armazenagem" | "transferencia" | "inventario" | "expedicao";
export type StatusTarefa = "pendente" | "atribuida" | "em_andamento" | "concluida" | "bloqueada";
export type PrioridadeTarefa = "baixa" | "media" | "alta" | "urgente";

export interface Tarefa {
  id: string;
  onda_id?: string | null;
  tipo: TipoTarefa;
  status: StatusTarefa;
  prioridade: PrioridadeTarefa;
  produto_id?: string | null;
  posicao_origem_id?: string | null;
  posicao_destino_id?: string | null;
  posicao_origem?: string | null;
  posicao_destino?: string | null;
  quantidade: number;
  quantidade_executada?: number | null;
  operador_id?: string | null;
  zona?: string | null;
  descricao?: string | null;
  observacoes?: string | null;
  tempo_estimado_minutos?: number | null;
  tempo_real_minutos?: number | null;
  data_inicio?: string | null;
  data_conclusao?: string | null;
  created_at: string;
  updated_at?: string;
}

interface NovaTarefa {
  tipo: TipoTarefa;
  descricao?: string;
  prioridade?: PrioridadeTarefa;
  quantidade?: number;
  produto_id?: string;
  posicao_destino_id?: string;
  onda_id?: string;
}

interface UseTarefasReturn {
  tarefas: Tarefa[];
  loading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
  criarTarefa: (tarefa: NovaTarefa) => Promise<Tarefa | null>;
  atualizarTarefa: (id: string, dados: Partial<Tarefa>) => Promise<boolean>;
  iniciarTarefa: (id: string) => Promise<boolean>;
  concluirTarefa: (id: string) => Promise<boolean>;
  atribuirTarefa: (id: string, operadorId: string) => Promise<boolean>;
  bloquearTarefa: (id: string, motivo: string) => Promise<boolean>;
  getTarefasPorStatus: (status: StatusTarefa) => Tarefa[];
  getTarefasPorTipo: (tipo: TipoTarefa) => Tarefa[];
  getEstatisticas: () => {
    total: number;
    pendentes: number;
    emAndamento: number;
    concluidas: number;
    bloqueadas: number;
  };
}

export function useTarefas(): UseTarefasReturn {
  const { user } = useAuth();
  const [tarefas, setTarefas] = useState<Tarefa[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchTarefas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: err } = await supabase
        .from("tarefas")
        .select("*")
        .order("created_at", { ascending: false });

      if (err) throw err;

      setTarefas((data as Tarefa[]) || []);
    } catch (err) {
      console.error("Erro ao buscar tarefas:", err);
      setError(err as Error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTarefas();
  }, [fetchTarefas]);

  const criarTarefa = useCallback(async (novaTarefa: NovaTarefa): Promise<Tarefa | null> => {
    try {
      const { data, error: err } = await supabase
        .from("tarefas")
        .insert({
          tipo: novaTarefa.tipo,
          status: "pendente",
          prioridade: novaTarefa.prioridade || "media",
          quantidade: novaTarefa.quantidade || 1,
          descricao: novaTarefa.descricao,
          produto_id: novaTarefa.produto_id,
          posicao_destino_id: novaTarefa.posicao_destino_id,
          onda_id: novaTarefa.onda_id,
        })
        .select()
        .single();

      if (err) throw err;

      setTarefas(prev => [data as Tarefa, ...prev]);
      return data as Tarefa;
    } catch (err) {
      console.error("Erro ao criar tarefa:", err);
      toast.error("Erro ao criar tarefa");
      return null;
    }
  }, []);

  const atualizarTarefa = useCallback(async (id: string, dados: Partial<Tarefa>): Promise<boolean> => {
    try {
      const { error: err } = await supabase
        .from("tarefas")
        .update(dados)
        .eq("id", id);

      if (err) throw err;

      setTarefas(prev => prev.map(t => t.id === id ? { ...t, ...dados } : t));
      return true;
    } catch (err) {
      console.error("Erro ao atualizar tarefa:", err);
      toast.error("Erro ao atualizar tarefa");
      return false;
    }
  }, []);

  const iniciarTarefa = useCallback(async (id: string): Promise<boolean> => {
    return atualizarTarefa(id, {
      status: "em_andamento",
      data_inicio: new Date().toISOString(),
      operador_id: user?.id,
    });
  }, [atualizarTarefa, user]);

  const concluirTarefa = useCallback(async (id: string): Promise<boolean> => {
    const tarefa = tarefas.find(t => t.id === id);
    const tempoReal = tarefa?.data_inicio 
      ? Math.round((Date.now() - new Date(tarefa.data_inicio).getTime()) / 60000)
      : null;

    return atualizarTarefa(id, {
      status: "concluida",
      data_conclusao: new Date().toISOString(),
      tempo_real_minutos: tempoReal,
      quantidade_executada: tarefa?.quantidade,
    });
  }, [atualizarTarefa, tarefas]);

  const atribuirTarefa = useCallback(async (id: string, operadorId: string): Promise<boolean> => {
    return atualizarTarefa(id, {
      status: "atribuida",
      operador_id: operadorId,
    });
  }, [atualizarTarefa]);

  const bloquearTarefa = useCallback(async (id: string, motivo: string): Promise<boolean> => {
    return atualizarTarefa(id, {
      status: "bloqueada",
      observacoes: motivo,
    });
  }, [atualizarTarefa]);

  const getTarefasPorStatus = useCallback((status: StatusTarefa): Tarefa[] => {
    return tarefas.filter(t => t.status === status);
  }, [tarefas]);

  const getTarefasPorTipo = useCallback((tipo: TipoTarefa): Tarefa[] => {
    return tarefas.filter(t => t.tipo === tipo);
  }, [tarefas]);

  const getEstatisticas = useCallback(() => ({
    total: tarefas.length,
    pendentes: tarefas.filter(t => t.status === "pendente").length,
    emAndamento: tarefas.filter(t => t.status === "em_andamento").length,
    concluidas: tarefas.filter(t => t.status === "concluida").length,
    bloqueadas: tarefas.filter(t => t.status === "bloqueada").length,
  }), [tarefas]);

  return {
    tarefas,
    loading,
    error,
    refetch: fetchTarefas,
    criarTarefa,
    atualizarTarefa,
    iniciarTarefa,
    concluirTarefa,
    atribuirTarefa,
    bloquearTarefa,
    getTarefasPorStatus,
    getTarefasPorTipo,
    getEstatisticas,
  };
}
