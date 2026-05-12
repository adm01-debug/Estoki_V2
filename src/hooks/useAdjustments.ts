import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";

export interface Adjustment {
  id: string;
  produto_id: string;
  lote_id?: string | null;
  posicao_id?: string | null;
  quantidade_anterior: number;
  quantidade_nova: number;
  diferenca: number;
  motivo: string;
  observacoes?: string | null;
  status: "pendente" | "aprovado" | "rejeitado";
  operador_id: string;
  aprovado_por?: string | null;
  data_aprovacao?: string | null;
  created_at: string;
  produto?: { nome: string; sku: string };
  lote?: { numero_lote: string };
}

export function useAdjustments() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: adjustments = [], isLoading } = useQuery({
    queryKey: ["adjustments"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ajustes_estoque")
        .select(`
          *,
          produto:produtos(nome, sku),
          lote:lotes(numero_lote)
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Adjustment & { produto: any; lote: any })[];
    },
  });

  const createAdjustment = useMutation({
    mutationFn: async (newAdj: Omit<Adjustment, "id" | "created_at" | "status" | "operador_id" | "diferenca">) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("ajustes_estoque")
        .insert([{ ...newAdj, operador_id: user.id }])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["adjustments"] });
      toast({ title: "Ajuste solicitado", description: "O ajuste foi enviado para aprovação do supervisor." });
    },
    onError: (error) => {
      toast({ title: "Erro ao solicitar ajuste", description: error.message, variant: "destructive" });
    },
  });

  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: "aprovado" | "rejeitado" }) => {
      if (!user) throw new Error("Usuário não autenticado");
      const { data, error } = await supabase
        .from("ajustes_estoque")
        .update({ 
          status, 
          aprovado_por: user.id, 
          data_aprovacao: new Date().toISOString() 
        })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["adjustments"] });
      queryClient.invalidateQueries({ queryKey: ["inventory"] });
      toast({ 
        title: variables.status === "aprovado" ? "Ajuste aprovado" : "Ajuste rejeitado", 
        description: `O ajuste foi ${variables.status} com sucesso.` 
      });
    },
  });

  return { adjustments, isLoading, createAdjustment, updateStatus };
}