import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  consertoService,
  type ResultadoConserto,
} from "@/features/quality/services/consertoService";

const CHAVE = ["recuperacao_materiais"];

export function useRecuperacaoMateriais() {
  const queryClient = useQueryClient();

  const {
    data = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: CHAVE,
    queryFn: consertoService.listar,
    staleTime: 1000 * 30,
  });

  const registrarResultado = useMutation({
    mutationFn: ({ id, resultado }: { id: string; resultado: ResultadoConserto }) =>
      consertoService.registrarResultado(id, resultado),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CHAVE });
    },
  });

  return {
    recuperacoes: data,
    isLoading,
    error: error ? (error as Error).message : null,
    refetch,
    registrarResultado,
  };
}
