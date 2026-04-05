import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export type ClassificacaoABC = 'A' | 'B' | 'C';

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

export function useCurvaABC() {
  const [produtos, setProdutos] = useState<ProdutoABC[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const calcularCurvaABC = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Buscar produtos com estoque
      const { data: produtosData, error: prodError } = await supabase
        .from('produtos')
        .select(`
          id,
          nome,
          sku,
          curva_abc,
          giro_mensal
        `);

      if (prodError) throw prodError;

      // Buscar lotes para quantidade atual
      const { data: lotesData } = await supabase
        .from('lotes')
        .select('produto_id, quantidade_atual');

      // Buscar movimentações para calcular giro (usando tipo_evento)
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

      const { data: movimentacoes } = await supabase
        .from('rastreamento_historico')
        .select('produto_id, quantidade, tipo_evento')
        .gte('created_at', trintaDiasAtras.toISOString());

      // Calcular giro por produto (usando tipo_evento - saida_transporte ou separacao indicam saída)
      const girosPorProduto: Record<string, number> = {};
      (movimentacoes || []).forEach(mov => {
        if (mov.produto_id && (mov.tipo_evento === 'saida_transporte' || mov.tipo_evento === 'separacao')) {
          girosPorProduto[mov.produto_id] = (girosPorProduto[mov.produto_id] || 0) + (mov.quantidade || 0);
        }
      });

      // Calcular quantidade por produto
      const quantidadePorProduto: Record<string, number> = {};
      (lotesData || []).forEach(lote => {
        if (lote.produto_id) {
          quantidadePorProduto[lote.produto_id] = (quantidadePorProduto[lote.produto_id] || 0) + (lote.quantidade_atual || 0);
        }
      });

      // Processar produtos
      const produtosProcessados: ProdutoABC[] = (produtosData || []).map(p => {
        const quantidadeEstoque = quantidadePorProduto[p.id] || 0;
        const valorUnitario = 0; // Sem preco_unitario no schema
        const valorTotal = quantidadeEstoque * valorUnitario;
        const giroMensal = girosPorProduto[p.id] || p.giro_mensal || 0;
        const diasCobertura = giroMensal > 0 
          ? Math.round((quantidadeEstoque / giroMensal) * 30) 
          : 999;

        return {
          id: p.id,
          sku: p.sku || 'N/A',
          nome: p.nome || 'Produto',
          categoria: p.curva_abc || 'C',
          quantidade_estoque: quantidadeEstoque,
          valor_unitario: valorUnitario,
          valor_total: valorTotal,
          giro_mensal: giroMensal,
          dias_cobertura: diasCobertura,
          classificacao_valor: 'C' as ClassificacaoABC,
          classificacao_giro: 'C' as ClassificacaoABC,
          classificacao_final: 'C' as ClassificacaoABC,
          percentual_valor: 0,
          percentual_acumulado: 0,
          posicao_recomendada: 'Box',
          acao_sugerida: undefined,
        };
      });

      // Ordenar por valor total (decrescente)
      produtosProcessados.sort((a, b) => b.valor_total - a.valor_total);

      // Calcular valor total geral
      const valorTotalGeral = produtosProcessados.reduce((acc, p) => acc + p.valor_total, 0);

      // Calcular percentuais e classificação
      let acumulado = 0;
      produtosProcessados.forEach((p) => {
        p.percentual_valor = valorTotalGeral > 0 
          ? (p.valor_total / valorTotalGeral) * 100 
          : 0;
        acumulado += p.percentual_valor;
        p.percentual_acumulado = acumulado;

        // Classificação por valor (80-15-5)
        if (p.percentual_acumulado <= 80) {
          p.classificacao_valor = 'A';
        } else if (p.percentual_acumulado <= 95) {
          p.classificacao_valor = 'B';
        } else {
          p.classificacao_valor = 'C';
        }

        // Classificação por giro
        if (p.giro_mensal > 100) {
          p.classificacao_giro = 'A';
        } else if (p.giro_mensal > 30) {
          p.classificacao_giro = 'B';
        } else {
          p.classificacao_giro = 'C';
        }

        // Classificação final (combinação)
        if (p.classificacao_valor === 'A' || p.classificacao_giro === 'A') {
          p.classificacao_final = 'A';
        } else if (p.classificacao_valor === 'B' || p.classificacao_giro === 'B') {
          p.classificacao_final = 'B';
        } else {
          p.classificacao_final = 'C';
        }

        // Posição recomendada
        switch (p.classificacao_final) {
          case 'A':
            p.posicao_recomendada = 'Porta-Palete Nível 1-2 (acesso fácil)';
            break;
          case 'B':
            p.posicao_recomendada = 'Porta-Palete Nível 3-4';
            break;
          case 'C':
            p.posicao_recomendada = 'Box ou Nível 5+';
            break;
        }

        // Ações sugeridas
        if (p.dias_cobertura > 180) {
          p.acao_sugerida = 'Estoque excessivo - considerar liquidação';
        } else if (p.dias_cobertura < 7 && p.classificacao_final === 'A') {
          p.acao_sugerida = 'Repor urgente - risco de ruptura';
        } else if (p.classificacao_final === 'C' && p.quantidade_estoque > 0) {
          p.acao_sugerida = 'Revisar necessidade de reposição';
        }
      });

      setProdutos(produtosProcessados);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao calcular curva ABC';
      setError(message);
      if (import.meta.env.DEV) console.error('Erro ao calcular curva ABC:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    calcularCurvaABC();
  }, [calcularCurvaABC]);

  const getEstatisticas = useCallback((): EstatisticasABC => {
    const produtosA = produtos.filter(p => p.classificacao_final === 'A');
    const produtosB = produtos.filter(p => p.classificacao_final === 'B');
    const produtosC = produtos.filter(p => p.classificacao_final === 'C');

    const valorA = produtosA.reduce((acc, p) => acc + p.valor_total, 0);
    const valorB = produtosB.reduce((acc, p) => acc + p.valor_total, 0);
    const valorC = produtosC.reduce((acc, p) => acc + p.valor_total, 0);
    const valorTotal = valorA + valorB + valorC;

    return {
      totalProdutos: produtos.length,
      produtosA: produtosA.length,
      produtosB: produtosB.length,
      produtosC: produtosC.length,
      valorA,
      valorB,
      valorC,
      percentualValorA: valorTotal > 0 ? (valorA / valorTotal) * 100 : 0,
      percentualValorB: valorTotal > 0 ? (valorB / valorTotal) * 100 : 0,
      percentualValorC: valorTotal > 0 ? (valorC / valorTotal) * 100 : 0,
    };
  }, [produtos]);

  const getProdutosPorClassificacao = useCallback((classificacao: ClassificacaoABC): ProdutoABC[] => {
    return produtos.filter(p => p.classificacao_final === classificacao);
  }, [produtos]);

  const getProdutosComAcao = useCallback((): ProdutoABC[] => {
    return produtos.filter(p => p.acao_sugerida);
  }, [produtos]);

  const recalcular = useCallback(() => {
    calcularCurvaABC();
  }, [calcularCurvaABC]);

  return {
    produtos,
    loading,
    error,
    refetch: calcularCurvaABC,
    getEstatisticas,
    getProdutosPorClassificacao,
    getProdutosComAcao,
    recalcular,
  };
}
