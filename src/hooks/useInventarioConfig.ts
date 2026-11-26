import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export interface InventarioConfig {
  id: string | null;
  threshold_divergencia: number;
  meta_acuracidade: number;
  frequencia_zona_a: number;
  frequencia_zona_b: number;
  frequencia_zona_c: number;
  alerta_posicao_ociosa_dias: number;
  alerta_vencimento_dias: number;
  updated_at: string | null;
  updated_by: string | null;
}

export const INVENTARIO_CONFIG_PADRAO: InventarioConfig = {
  id: null,
  threshold_divergencia: 5,
  meta_acuracidade: 99,
  frequencia_zona_a: 7,
  frequencia_zona_b: 14,
  frequencia_zona_c: 30,
  alerta_posicao_ociosa_dias: 30,
  alerta_vencimento_dias: 30,
  updated_at: null,
  updated_by: null,
};

const CAMPOS =
  "id, threshold_divergencia, meta_acuracidade, frequencia_zona_a, frequencia_zona_b, frequencia_zona_c, alerta_posicao_ociosa_dias, alerta_vencimento_dias, updated_at, updated_by";

export type InventarioConfigEditavel = Pick<
  InventarioConfig,
  | "meta_acuracidade"
  | "threshold_divergencia"
  | "frequencia_zona_a"
  | "frequencia_zona_b"
  | "frequencia_zona_c"
>;

export function mensagemDeErro(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (error && typeof error === "object" && "message" in error) {
    return String((error as { message: unknown }).message);
  }
  return String(error);
}

export function divergenciaExcedeTolerancia(
  quantidadeContada: number,
  quantidadeSistema: number,
  thresholdPercentual: number
): boolean {
  if (quantidadeContada === quantidadeSistema) return false;
  const base = Math.abs(quantidadeSistema);
  if (base === 0) return true;
  return Math.abs(quantidadeContada - quantidadeSistema) > (base * thresholdPercentual) / 100;
}

export function useInventarioConfig() {
  const { user, hasRole } = useAuth();
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["inventario-config"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("inventario_config")
        .select(CAMPOS)
        .order("updated_at", { ascending: false })
        .limit(1)
        .maybeSingle();
      if (error) throw error;
      return (data as InventarioConfig | null) ?? null;
    },
    staleTime: 60_000,
  });

  const config: InventarioConfig = query.data ?? INVENTARIO_CONFIG_PADRAO;
  const existe = Boolean(query.data?.id);

  const mutation = useMutation({
    mutationFn: async (dados: InventarioConfigEditavel) => {
      const payload = {
        ...dados,
        alerta_posicao_ociosa_dias: config.alerta_posicao_ociosa_dias,
        alerta_vencimento_dias: config.alerta_vencimento_dias,
        updated_at: new Date().toISOString(),
        updated_by: user?.id ?? null,
      };
      if (existe) {
        const { error } = await supabase
          .from("inventario_config")
          .update(payload)
          .eq("id", config.id as string);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("inventario_config").insert([payload]);
        if (error) throw error;
      }
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["inventario-config"] }),
  });

  return {
    config,
    existe,
    carregando: query.isLoading,
    erro: query.error ? mensagemDeErro(query.error) : null,
    refetch: query.refetch,
    podeEditar: hasRole("admin"),
    salvando: mutation.isPending,
    salvar: mutation.mutateAsync,
  };
}
