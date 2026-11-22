import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export interface FilialResumo {
  armazem_id: string;
  codigo: string;
  nome: string;
  cidade: string | null;
  estado: string | null;
  ativo: boolean;
  capacidade_total: number | null;
  total_posicoes: number;
  posicoes_ocupadas: number;
  taxa_ocupacao: number;
  total_lotes: number;
  quantidade_estoque: number;
  orders_pendentes: number;
  orders_total: number;
  tarefas_abertas: number;
  tarefas_total: number;
}

export function useMultiWarehouseDashboard() {
  const query = useQuery({
    queryKey: ["multi-warehouse-dashboard"],
    queryFn: async (): Promise<FilialResumo[]> => {
      // RPC existe em produção; types.ts gerado está desatualizado (ver E-007)
      const { data, error } = await supabase.rpc("get_multi_warehouse_dashboard" as never);
      if (error) {
        logger.error("Erro ao carregar dashboard multi-filial", error);
        throw error;
      }
      const payload = data as { filiais?: FilialResumo[]; generated_at?: string } | null;
      return payload?.filiais ?? [];
    },
    staleTime: 30_000,
    retry: 1,
  });

  return {
    filiais: query.data ?? [],
    loading: query.isLoading,
    error: query.error as Error | null,
    refetch: query.refetch,
    isRefetching: query.isFetching && !query.isLoading,
  };
}
