import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PickingTask {
  id: string;
  tipo: string;
  status: string;
  prioridade: string;
  data_inicio?: string;
  data_conclusao?: string;
  produto_id: string;
  produto_nome?: string;
  posicao_origem_id: string;
  posicao_origem_nome?: string;
  quantidade: number;
  quantidade_executada: number;
  zona: string;
  instrucoes?: string;
}

export function usePicking() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["picking-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select(`
          *,
          produto:produtos(nome),
          posicao_origem:posicoes_estoque!posicao_origem_id(nome)
        `)
        .eq("tipo", "separacao")
        .order("prioridade", { ascending: false });

      if (error) throw error;
      return (data || []).map(t => ({
        ...t,
        produto_nome: t.produto?.nome,
        posicao_origem_nome: t.posicao_origem?.nome
      })) as PickingTask[];
    }
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status, qty }: { taskId: string, status: string, qty?: number }) => {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === "em_andamento" && !tasks.find(t => t.id === taskId)?.data_inicio) {
        updates.data_inicio = new Date().toISOString();
        updates.operador_id = user?.id;
      }
      if (status === "concluido") {
        updates.data_conclusao = new Date().toISOString();
        updates.quantidade_executada = qty;
      }

      const { error } = await supabase
        .from("tarefas")
        .update(updates)
        .eq("id", taskId);

      if (error) throw error;

      // Se concluiu, registrar evento de picking para gamificação/KPIs
      if (status === "concluido" && qty) {
        const task = tasks.find(t => t.id === taskId);
        if (task) {
          await supabase.from("eventos_picking").insert({
            tarefa_id: taskId,
            operador_id: user?.id,
            produto_id: task.produto_id,
            posicao_id: task.posicao_origem_id,
            quantidade_solicitada: task.quantidade,
            quantidade_separada: qty,
            correto: qty === task.quantidade,
            data_inicio: task.data_inicio || new Date().toISOString(),
            data_fim: new Date().toISOString()
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["picking-tasks"] });
      toast.success("Tarefa atualizada com sucesso!");
    }
  });

  return {
    tasks,
    isLoading,
    startTask: (taskId: string) => updateTaskStatus.mutate({ taskId, status: "em_andamento" }),
    finishTask: (taskId: string, qty: number) => updateTaskStatus.mutate({ taskId, status: "concluido", qty }),
    cancelTask: (taskId: string) => updateTaskStatus.mutate({ taskId, status: "cancelado" })
  };
}