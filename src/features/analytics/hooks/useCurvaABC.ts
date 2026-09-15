import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";
import { Decimal } from "decimal.js";
import { supabase } from "@/integrations/supabase/client";

export type ClassificacaoABC = "A" | "B" | "C";

export interface ProdutoABC {
  id: string;
  sku: string;
  nome: string;
  categoria?: string;

  // Métricas
  quantidade_estoque: number;
  valor_unitario: number;
  valor_total: number;
  giro_mensal: number;
  dias_cobertura: number;

  // Classificação
  classificacao_valor: ClassificacaoABC;
  classificacao_giro: ClassificacaoABC;
  classificacao_final: ClassificacaoABC;

  // Percentuais acumulados
  percentual_valor: number;
  percentual_acumulado: number;

  // Recomendações
  posicao_recomendada: string;
  acao_sugerida?: string;
}

export interface EstatisticasABC {
  totalProdutos: number;
  produtosA: number;
  produtosB: number;
  produtosC: number;
  valorA: number;
  valorB: number;
  valorC: number;
  percentualValorA: number;
  percentualValorB: number;
  percentualValorC: number;
}

async function calcularCurvaABC(): Promise<ProdutoABC[]> {
  const { data: produtosData, error: prodError } = await supabase.from("produtos").select(`
      id,
      nome,
      sku,
      curva_abc,
      giro_mensal,
      peso_unitario
    `);
  if (prodError) throw prodError;

  const { data: lotesData } = await supabase
    .from("lotes")
    .select("produto_id, quantidade_atual");

  const trintaDiasAtras = new Date();
  trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
  const { data: movimentacoes } = await supabase
    .from("rastreamento_historico")
    .select("produto_id, quantidade, tipo_evento")
    .gte("created_at", trintaDiasAtras.toISOString());

  const girosPorProduto: Record<string, number> = {};
  (movimentacoes || []).forEach((mov) => {
    if (
      mov.produto_id &&
      (mov.tipo_evento === "saida_transporte" || mov.tipo_evento === "separacao")
    ) {
      girosPorProduto[mov.produto_id] =
        (girosPorProduto[mov.produto_id] || 0) + (mov.quantidade || 0);
    }
  });

  const quantidadePorProduto: Record<string, number> = {};
  (lotesData || []).forEach((lote) => {
    if (lote.produto_id) {
      quantidadePorProduto[lote.produto_id] =
        (quantidadePorProduto[lote.produto_id] || 0) + (lote.quantidade_atual || 0);
    }
  });

  const produtosProcessados: ProdutoABC[] = (produtosData || []).map((p) => {
    const quantidadeEstoque = quantidadePorProduto[p.id] || 0;
    // Sem coluna de valor no schema: usa peso_unitario como proxy de valor unitário
    const valorUnitario = Number(p.peso_unitario) || 0;
    const valorTotal = quantidadeEstoque * valorUnitario;
    const giroMensal = girosPorProduto[p.id] || p.giro_mensal || 0;
    const diasCobertura =
      giroMensal > 0 ? Math.round((quantidadeEstoque / giroMensal) * 30) : 999;

    return {
      id: p.id,
      sku: p.sku || "N/A",
      nome: p.nome || "Produto",
      categoria: p.curva_abc || "C",
      quantidade_estoque: quantidadeEstoque,
      valor_unitario: valorUnitario,
      valor_total: valorTotal,
      giro_mensal: giroMensal,
      dias_cobertura: diasCobertura,
      classificacao_valor: "C" as ClassificacaoABC,
      classificacao_giro: "C" as ClassificacaoABC,
      classificacao_final: "C" as ClassificacaoABC,
      percentual_valor: 0,
      percentual_acumulado: 0,
      posicao_recomendada: "Box",
      acao_sugerida: undefined,
    };
  });

  produtosProcessados.sort((a, b) => b.valor_total - a.valor_total);

  const valorTotalGeral = produtosProcessados.reduce(
    (acc, p) => acc.plus(new Decimal(p.valor_total)),
    new Decimal(0)
  );

  let acumuladoDecimal = new Decimal(0);
  produtosProcessados.forEach((p) => {
    p.percentual_valor = valorTotalGeral.gt(0)
      ? new Decimal(p.valor_total).div(valorTotalGeral).mul(100).toNumber()
      : 0;
    acumuladoDecimal = acumuladoDecimal.plus(new Decimal(p.percentual_valor));
    p.percentual_acumulado = acumuladoDecimal.toNumber();

    if (p.percentual_acumulado <= 80) {
      p.classificacao_valor = "A";
    } else if (p.percentual_acumulado <= 95) {
      p.classificacao_valor = "B";
    } else {
      p.classificacao_valor = "C";
    }

    if (p.giro_mensal > 100) {
      p.classificacao_giro = "A";
    } else if (p.giro_mensal > 30) {
      p.classificacao_giro = "B";
    } else {
      p.classificacao_giro = "C";
    }

    if (p.classificacao_valor === "A" || p.classificacao_giro === "A") {
      p.classificacao_final = "A";
    } else if (p.classificacao_valor === "B" || p.classificacao_giro === "B") {
      p.classificacao_final = "B";
    } else {
      p.classificacao_final = "C";
    }

    if (p.classificacao_final === "A") {
      p.posicao_recomendada = "Porta-palete próximo à expedição";
    } else if (p.classificacao_final === "B") {
      p.posicao_recomendada = "Porta-palete intermediário";
    } else {
      p.posicao_recomendada = "Bloco / Box";
    }

    if (p.classificacao_final === "A" && p.dias_cobertura < 7) {
      p.acao_sugerida = "Reposição urgente";
    } else if (p.classificacao_final === "A" && p.dias_cobertura < 15) {
      p.acao_sugerida = "Reposição programada";
    } else if (p.classificacao_final === "C" && p.quantidade_estoque > 0) {
      p.acao_sugerida = "Revisar necessidade de reposição";
    }
  });

  return produtosProcessados;
}

export function useCurvaABC() {
  const queryClient = useQueryClient();

  const { data: produtos = [], isLoading: loading, error: queryError, refetch } = useQuery({
    queryKey: ["curva-abc"],
    queryFn: calcularCurvaABC,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
  });

  const error = queryError ? (queryError instanceof Error ? queryError.message : "Erro") : null;

  const recalcularMutation = useMutation({
    mutationFn: async () => {
      await queryClient.invalidateQueries({ queryKey: ["curva-abc"] });
    },
  });

  const getEstatisticas = useCallback((): EstatisticasABC => {
    const produtosA = produtos.filter((p) => p.classificacao_final === "A");
    const produtosB = produtos.filter((p) => p.classificacao_final === "B");
    const produtosC = produtos.filter((p) => p.classificacao_final === "C");

    const valorADecimal = produtosA.reduce(
      (acc, p) => acc.plus(new Decimal(p.valor_total)),
      new Decimal(0)
    );
    const valorBDecimal = produtosB.reduce(
      (acc, p) => acc.plus(new Decimal(p.valor_total)),
      new Decimal(0)
    );
    const valorCDecimal = produtosC.reduce(
      (acc, p) => acc.plus(new Decimal(p.valor_total)),
      new Decimal(0)
    );
    const valorTotalDecimal = valorADecimal.plus(valorBDecimal).plus(valorCDecimal);

    return {
      totalProdutos: produtos.length,
      produtosA: produtosA.length,
      produtosB: produtosB.length,
      produtosC: produtosC.length,
      valorA: valorADecimal.toNumber(),
      valorB: valorBDecimal.toNumber(),
      valorC: valorCDecimal.toNumber(),
      percentualValorA: valorTotalDecimal.gt(0)
        ? valorADecimal.div(valorTotalDecimal).mul(100).toNumber()
        : 0,
      percentualValorB: valorTotalDecimal.gt(0)
        ? valorBDecimal.div(valorTotalDecimal).mul(100).toNumber()
        : 0,
      percentualValorC: valorTotalDecimal.gt(0)
        ? valorCDecimal.div(valorTotalDecimal).mul(100).toNumber()
        : 0,
    };
  }, [produtos]);

  const getProdutosPorClassificacao = useCallback(
    (classificacao: ClassificacaoABC): ProdutoABC[] => {
      return produtos.filter((p) => p.classificacao_final === classificacao);
    },
    [produtos]
  );

  const getProdutosComAcao = useCallback((): ProdutoABC[] => {
    return produtos.filter((p) => p.acao_sugerida);
  }, [produtos]);

  return {
    produtos,
    loading,
    error,
    refetch: () => {
      refetch();
    },
    getEstatisticas,
    getProdutosPorClassificacao,
    getProdutosComAcao,
    recalcular: () => {
      recalcularMutation.mutate();
    },
  };
}
