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
        .from("audit_logs")
        .select("*")
        .eq("entity_type", "quality_control")
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Simulando inspeções a partir dos logs de auditoria por enquanto
      return data.map(log => {
        const values = (log.new_values as any) || {};
        return {
          id: log.id,
          lote_id: log.entity_id || "",
          inspecionado_por: log.user_id,
          resultado: values.resultado || "aprovado",
          pontuacao: values.pontuacao || 100,
          created_at: log.created_at
        };
      }) as QualityInspection[];
    },
  });

  const submitInspection = useMutation({
    mutationFn: async (inspection: Omit<QualityInspection, "id" | "created_at">) => {
      const { error } = await supabase.from("audit_logs").insert([{
        action: "create",
        entity_type: "quality_control",
        entity_id: inspection.lote_id,
        new_values: inspection,
        user_id: inspection.inspecionado_por
      }]);

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