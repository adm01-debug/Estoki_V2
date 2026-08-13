import { useState, useEffect, useCallback, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { movimentacaoService } from "@/services/movimentacaoService";
import type { Movimentacao, MovimentacaoInput, TipoMovimentacao } from "@/types/movimentacao";

export function useMovimentacoes(options?: { enableRealtime?: boolean }) {
  const [movimentacoes, setMovimentacoes] = useState<Movimentacao[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();
  const subscriptionRef = useRef<any>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMovimentacoes = useCallback(async (page = 1, pageSize = 50) => {
    try {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      abortControllerRef.current = new AbortController();

      setLoading(true);
      setError(null);

      const result = await movimentacaoService.getAll({ page, pageSize });
      setMovimentacoes(result.data);
    } catch (err) {
      if ((err as any).name === "AbortError") return;
      const message = err instanceof Error ? err.message : "Erro ao buscar movimentações";
      setError(message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMovimentacoes();
  }, [fetchMovimentacoes]);

  useEffect(() => {
    if (!options?.enableRealtime) return;

    if (subscriptionRef.current) {
      subscriptionRef.current.unsubscribe();
    }

    subscriptionRef.current = supabase
      .channel("movements-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "rastreamento_historico" },
        () => {
          fetchMovimentacoes();
        }
      )
      .subscribe();

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, [options?.enableRealtime, fetchMovimentacoes]);

  const registrarMovimentacao = async (input: MovimentacaoInput): Promise<boolean> => {
    try {
      if (!user?.id) {
        toast({ title: "Erro", description: "Usuário não autenticado", variant: "destructive" });
        return false;
      }

      await movimentacaoService.registrar({ ...input, operador_id: user.id });

      toast({
        title: "Movimentação registrada",
        description: `${input.tipo}: ${input.quantidade} unidades`,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erro ao registrar movimentação";
      toast({ title: "Erro", description: message, variant: "destructive" });
      return false;
    }
  };

  const transferir = async (
    loteId: string,
    fromPosicaoId: string,
    toPosicaoId: string,
    quantidade: number,
    descricao?: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo: "transferencia",
      lote_id: loteId,
      from_posicao_id: fromPosicaoId,
      to_posicao_id: toPosicaoId,
      quantidade,
      descricao: descricao || "Transferência interna de estoque",
    });
  };

  const registrarEntrada = async (
    produtoId: string,
    quantidade: number,
    localizacao: string,
    loteId?: string,
    descricao?: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo: "recebimento_nf",
      produto_id: produtoId,
      lote_id: loteId,
      quantidade,
      localizacao,
      descricao: descricao || "Entrada de material",
    });
  };

  const registrarSaida = async (
    produtoId: string,
    quantidade: number,
    localizacao: string,
    tipo: "saida_transporte" | "separacao" = "saida_transporte",
    loteId?: string,
    descricao?: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo,
      produto_id: produtoId,
      lote_id: loteId,
      quantidade,
      localizacao,
      descricao: descricao || "Saída de material",
    });
  };

  const ajustarEstoque = async (
    produtoId: string,
    quantidade: number,
    localizacao: string,
    descricao: string
  ): Promise<boolean> => {
    return registrarMovimentacao({
      tipo: "ajuste_estoque",
      produto_id: produtoId,
      quantidade,
      localizacao,
      descricao,
    });
  };

  return {
    movimentacoes,
    loading,
    error,
    refetch: fetchMovimentacoes,
    registrarMovimentacao,
    transferir,
    registrarEntrada,
    registrarSaida,
    ajustarEstoque,
    getMovimentacoesPorProduto: movimentacaoService.getByProduto,
    getMovimentacoesPorLote: movimentacaoService.getByLote,
  };
}
