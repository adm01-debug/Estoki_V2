import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface OcupacaoPortaPalete {
  nome: string;
  ocupado: number;
  total: number;
  percentual: number;
}

export interface DistribuicaoStatus {
  name: string;
  value: number;
  color: string;
}

export interface MovimentacaoDia {
  dia: string;
  entradas: number;
  saidas: number;
}

export interface ItemParado {
  id: string;
  sku: string;
  descricao: string;
  posicao: string;
  diasParado: number;
  quantidade: number;
  valor: number;
}

export interface KPIsDashboard {
  totalPosicoes: number;
  posicoesOcupadas: number;
  taxaOcupacao: number;
  itensParados30dias: number;
  valorParado: number;
  giroMedio: number;
  entradasHoje: number;
  saidasHoje: number;
  triagensHoje: number;
  triagensPendentes: number;
}

export function useDashboard() {
  const [kpis, setKpis] = useState<KPIsDashboard | null>(null);
  const [ocupacaoPP, setOcupacaoPP] = useState<OcupacaoPortaPalete[]>([]);
  const [distribuicaoStatus, setDistribuicaoStatus] = useState<DistribuicaoStatus[]>([]);
  const [movimentacoes7dias, setMovimentacoes7dias] = useState<MovimentacaoDia[]>([]);
  const [itensParados, setItensParados] = useState<ItemParado[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDashboardData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      // 1. Buscar posições de estoque
      const { data: posicoes, error: posError } = await supabase
        .from('posicoes_estoque')
        .select('*');

      if (posError) throw posError;

      const totalPosicoes = posicoes?.length || 0;
      const posicoesOcupadas = posicoes?.filter(p => p.status === 'ocupado').length || 0;
      const posicoesLivres = posicoes?.filter(p => p.status === 'livre').length || 0;
      const posicoesReservadas = posicoes?.filter(p => p.status === 'reservado').length || 0;
      const posicoesBloqueadas = posicoes?.filter(p => p.status === 'bloqueado').length || 0;

      // Distribuição por status
      setDistribuicaoStatus([
        { name: "Disponível", value: posicoesLivres, color: "hsl(142, 76%, 36%)" },
        { name: "Ocupado", value: posicoesOcupadas, color: "hsl(221, 83%, 53%)" },
        { name: "Reservado", value: posicoesReservadas, color: "hsl(45, 93%, 47%)" },
        { name: "Bloqueado", value: posicoesBloqueadas, color: "hsl(0, 84%, 60%)" },
      ]);

      // Ocupação por porta-palete
      const portaPaletes = posicoes?.filter(p => p.tipo === 'porta_palete') || [];
      const grupos = [...new Set(portaPaletes.map(p => p.porta_palete).filter(Boolean))];
      
      const ocupacaoPorPP = grupos.map(pp => {
        const doPP = portaPaletes.filter(p => p.porta_palete === pp);
        const ocupadas = doPP.filter(p => p.status === 'ocupado').length;
        return {
          nome: pp as string,
          ocupado: ocupadas,
          total: doPP.length,
          percentual: doPP.length > 0 ? Math.round((ocupadas / doPP.length) * 100) : 0,
        };
      });
      setOcupacaoPP(ocupacaoPorPP);

      // 2. Buscar eventos de triagem de hoje
      const { data: triagensHoje, error: triagError } = await supabase
        .from('eventos_triagem')
        .select('id, resultado')
        .gte('data_fim', hoje.toISOString());

      if (triagError) console.error('Erro triagens:', triagError);

      const triagensConcluidas = triagensHoje?.filter(t => 
        t.resultado && ['aprovado', 'ressalva', 'reprovado'].includes(t.resultado)
      ).length || 0;

      // Triagens pendentes (sem data_fim)
      const { data: triagensPend, error: pendError } = await supabase
        .from('eventos_triagem')
        .select('id')
        .is('data_fim', null);

      if (pendError) console.error('Erro triagens pendentes:', pendError);

      // 3. Buscar lotes recebidos hoje
      const { data: lotesHoje, error: lotesError } = await supabase
        .from('lotes')
        .select('id, quantidade_inicial')
        .gte('data_recebimento', hoje.toISOString().split('T')[0]);

      if (lotesError) console.error('Erro lotes:', lotesError);

      const entradasHoje = lotesHoje?.reduce((acc, l) => acc + (l.quantidade_inicial || 0), 0) || 0;

      // 4. Buscar movimentações dos últimos 7 dias
      const seteDiasAtras = new Date();
      seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);

      const { data: movimentacoes, error: movError } = await supabase
        .from('rastreamento_historico')
        .select('*')
        .gte('created_at', seteDiasAtras.toISOString());

      if (movError) console.error('Erro movimentações:', movError);

      // Agrupar por dia da semana
      const diasSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
      const movPorDia: MovimentacaoDia[] = diasSemana.map(dia => ({
        dia,
        entradas: 0,
        saidas: 0,
      }));

      movimentacoes?.forEach(mov => {
        const data = new Date(mov.created_at);
        const diaSemana = data.getDay();
        // Usar tipo_evento existentes no schema
        if (mov.tipo_evento === 'recebimento_nf' || mov.tipo_evento === 'armazenamento') {
          movPorDia[diaSemana].entradas += mov.quantidade || 1;
        } else if (mov.tipo_evento === 'saida_transporte' || mov.tipo_evento === 'carregamento' || mov.tipo_evento === 'separacao') {
          movPorDia[diaSemana].saidas += mov.quantidade || 1;
        }
      });

      // Reorganizar para começar de segunda
      const movReorganizado = [
        ...movPorDia.slice(1), // Seg a Sáb
        movPorDia[0], // Dom
      ];
      setMovimentacoes7dias(movReorganizado);

      // 5. Buscar itens parados (lotes sem movimentação há mais de 30 dias)
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);

      // Simplificado: buscar lotes antigos
      const { data: lotesAntigos, error: lotesAntigosError } = await supabase
        .from('lotes')
        .select(`
          id,
          numero_lote,
          quantidade_atual,
          created_at,
          produto_id
        `)
        .lt('updated_at', trintaDiasAtras.toISOString())
        .gt('quantidade_atual', 0)
        .limit(10);

      if (lotesAntigosError) console.error('Erro lotes antigos:', lotesAntigosError);

      // Buscar nomes dos produtos
      const produtoIds = [...new Set((lotesAntigos || []).map(l => l.produto_id).filter(Boolean))];
      const { data: produtosData } = produtoIds.length > 0 
        ? await supabase.from('produtos').select('id, nome, sku').in('id', produtoIds)
        : { data: [] };

      const produtosMap = new Map((produtosData || []).map(p => [p.id, p]));

      const itensParadosData: ItemParado[] = (lotesAntigos || []).map(lote => {
        const diasParado = Math.floor(
          (Date.now() - new Date(lote.created_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        const produto = produtosMap.get(lote.produto_id);
        return {
          id: lote.id,
          sku: produto?.sku || lote.numero_lote || 'N/A',
          descricao: produto?.nome || 'Produto',
          posicao: 'Verificar',
          diasParado,
          quantidade: lote.quantidade_atual || 0,
          valor: 0, // Sem preco_unitario no schema
        };
      });
      setItensParados(itensParadosData);

      // Montar KPIs
      setKpis({
        totalPosicoes,
        posicoesOcupadas,
        taxaOcupacao: totalPosicoes > 0 ? Math.round((posicoesOcupadas / totalPosicoes) * 100 * 10) / 10 : 0,
        itensParados30dias: itensParadosData.length,
        valorParado: itensParadosData.reduce((acc, item) => acc + item.valor, 0),
        giroMedio: 12.5, // TODO: Calcular baseado em movimentações
        entradasHoje,
        saidasHoje: 0, // TODO: Buscar saídas
        triagensHoje: triagensConcluidas,
        triagensPendentes: triagensPend?.length || 0,
      });

    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao carregar dashboard';
      setError(message);
      console.error('Erro no dashboard:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDashboardData();

    // Atualizar a cada 30 segundos
    const interval = setInterval(fetchDashboardData, 30000);

    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  return {
    kpis,
    ocupacaoPP,
    distribuicaoStatus,
    movimentacoes7dias,
    itensParados,
    loading,
    error,
    refetch: fetchDashboardData,
  };
}