import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

export interface PutawayTask {
  id: string;
  status: string;
  prioridade: string;
  produto_id: string;
  produto_nome?: string;
  posicao_origem_id?: string;
  posicao_origem_codigo?: string;
  posicao_destino_id: string;
  posicao_destino_codigo?: string;
  quantidade: number;
  quantidade_executada: number;
  zona: string;
  data_inicio?: string;
}

export function usePutaway() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["putaway-tasks"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tarefas")
        .select(`
          *,
          produto:produtos(nome),
          posicao_origem:posicoes_estoque!posicao_origem_id(codigo),
          posicao_destino:posicoes_estoque!posicao_destino_id(codigo)
        `)
        .eq("tipo", "armazenagem")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data || []).map(t => ({
        ...t,
        produto_nome: t.produto?.nome,
        posicao_origem_codigo: t.posicao_origem?.codigo,
        posicao_destino_codigo: t.posicao_destino?.codigo
      })) as PutawayTask[];
    }
  });

  const updateTaskStatus = useMutation({
    mutationFn: async ({ taskId, status, qty }: { taskId: string, status: string, qty?: number }) => {
      const updates: any = { status, updated_at: new Date().toISOString() };
      if (status === "em_andamento") {
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

      // Se concluiu, atualizar estoque
      if (status === "concluido" && qty) {
         // A lógica de movimentação real de estoque costuma ser feita via RPC ou trigger
         // mas vamos registrar uma movimentação no log pelo menos
         const task = tasks.find(t => t.id === taskId);
         if (task) {
            await supabase.from("rastreamento_historico").insert([{
              produto_id: task.produto_id as any,
              posicao_id: task.posicao_destino_id as any,
              tipo_evento: "entrada_estoque" as any,
              quantidade: qty as any,
              descricao: `Armazenamento via tarefa ${task.id}` as any,
              operador_id: user?.id as any
            }]);
         }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["putaway-tasks"] });
    }
  });

  return {
    tasks,
    isLoading,
    startTask: (taskId: string) => updateTaskStatus.mutate({ taskId, status: "em_andamento" }),
    finishTask: (taskId: string, qty: number) => updateTaskStatus.mutate({ taskId, status: "concluido", qty })
  };
}