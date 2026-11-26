import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

/** Resumo gravado pela edge produtos-sync em `produtos_sync_estado.ultimo_resultado`. */
export interface ProdutosSyncResultado {
  modo?: string;
  paginas?: number;
  processados?: number;
  replicados?: number;
  ignorados?: number;
  barcodes_descartados?: number;
  duracao_ms?: number;
}

export interface ProdutosSyncEstado {
  origem: string;
  origem_atualizada_ate: string | null;
  origem_sku: string | null;
  ultima_execucao: string | null;
  ultima_duracao_ms: number | null;
  ultimo_resultado: ProdutosSyncResultado | null;
  updated_at: string | null;
}

const CAMPOS =
  "origem,origem_atualizada_ate,origem_sku,ultima_execucao,ultima_duracao_ms,ultimo_resultado,updated_at";

/** Linha unica (id = true) com o cursor da replicacao do catalogo mestre para `produtos`. */
export function useProdutosSyncEstado() {
  return useQuery({
    queryKey: ["produtos-sync-estado"],
    queryFn: async (): Promise<ProdutosSyncEstado | null> => {
      const { data, error } = await supabase
        .from("produtos_sync_estado")
        .select(CAMPOS)
        .eq("id", true)
        .maybeSingle();
      if (error) throw error;
      return (data as ProdutosSyncEstado | null) ?? null;
    },
    staleTime: 60_000,
  });
}
