import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/hooks/use-toast";

export interface QualityInspection {
  id: string;
  lote_id: string;
  inspecionado_por: string;
  resultado: "aprovado" | "rejeitado" | "condicional";
  pontuacao: number;
  observacoes?: string;
  fotos?: string[];
  created_at: string;
}

export function useQualityControl() {
  const queryClient = useQueryClient();

  const { data: inspections = [], isLoading } = useQuery({
    queryKey: ["quality-inspections"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inspecoes_qualidade")
        .select(`
          *,
          lote:lotes(numero_lote, produto:produtos(nome))
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as any[];
    },
  });

  const submitInspection = useMutation({
    mutationFn: async (inspection: Omit<QualityInspection, "id" | "created_at">) => {
      const { error } = await supabase.from("inspecoes_qualidade").insert([inspection]);

      if (error) throw error;
      
      // Se rejeitado, atualiza o status do lote
      if (inspection.resultado === "rejeitado") {
        await supabase.from("lotes").update({ status: "divergencia" }).eq("id", inspection.lote_id);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["quality-inspections"] });
      toast({ title: "Inspeção registrada", description: "Os dados de qualidade foram salvos com sucesso." });
    },
  });

  return { inspections, isLoading, submitInspection };
}