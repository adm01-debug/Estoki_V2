import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useEffect, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { useAuditLog } from "./useAuditLog";
import { productService } from "@/services/productService";
import type { ProdutoUpdate } from "@/types/product";

export interface UseProdutosOptions {
  enableRealtime?: boolean;
  page?: number;
  pageSize?: number;
  search?: string;
  curva?: string;
}

export const useProdutos = (options?: UseProdutosOptions) => {
  const page = options?.page ?? 1;
  const pageSize = options?.pageSize ?? 100;
  const search = options?.search ?? "";
  const curva = options?.curva ?? "todos";
  const queryClient = useQueryClient();
  const { log } = useAuditLog();
  const subscriptionRef = useRef<any>(null);

  useEffect(() => {
    if (!options?.enableRealtime) return;

    if (subscriptionRef.current) {
      supabase.removeChannel(subscriptionRef.current);
      subscriptionRef.current = null;
    }

    subscriptionRef.current = supabase
      .channel(`products-changes-${Math.random().toString(36).slice(2)}`)
      .on("postgres_changes", { event: "*", schema: "public", table: "produtos" }, () => {
        queryClient.invalidateQueries({ queryKey: ["produtos"] });
      })
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        supabase.removeChannel(subscriptionRef.current);
        subscriptionRef.current = null;
      }
    };
  }, [options?.enableRealtime, queryClient]);

  const {
    data: result,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useQuery({
    queryKey: ["produtos", "lista", { page, pageSize, search, curva }],
    queryFn: () => productService.getAll({ page, pageSize, search, curva }),
  });

  const { data: contagem } = useQuery({
    queryKey: ["produtos", "stats"],
    queryFn: () => productService.contarPorCurva(),
  });

  const produtos = useMemo(() => result?.data || [], [result?.data]);
  const total = result?.total || 0;
  const pageCount = Math.max(1, Math.ceil(total / pageSize));

  const createProduto = useMutation({
    mutationFn: productService.create,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast.success("Produto cadastrado com sucesso!");
      log.custom("create", "produtos", {
        detalhes: `Produto ${data.nome} (${data.sku}) cadastrado`,
        id: data.id,
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao salvar produto");
    },
  });

  const updateProduto = useMutation({
    mutationFn: async ({ id, ...dados }: { id: string } & ProdutoUpdate) => {
      return productService.update(id, dados);
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast.success("Produto atualizado!");
      log.custom("update", "produtos", {
        detalhes: `Produto ${data.nome} atualizado`,
        id: data.id,
      });
    },
    onError: (err: Error) => {
      toast.error(err.message || "Erro ao atualizar produto");
    },
  });

  const bulkCreateProdutos = useMutation({
    mutationFn: productService.bulkCreate,
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["produtos"] });
      toast.success(`${data.length} produtos importados com sucesso!`);
      log.custom("bulk_create", "produtos", {
        detalhes: `${data.length} produtos importados via CSV`,
      });
    },
    onError: (err: any) => {
      toast.error(err.message || "Erro ao importar produtos");
    },
  });

  const stats = useMemo(
    () => ({
      total: contagem?.total ?? 0,
      curvaA: contagem?.A ?? 0,
      curvaB: contagem?.B ?? 0,
      curvaC: contagem?.C ?? 0,
    }),
    [contagem]
  );

  return {
    produtos,
    total,
    page,
    pageCount,
    loading: isLoading,
    isFetching,
    error,
    refetch,
    createProduto,
    updateProduto,
    bulkCreateProdutos,
    stats,
  };
};
