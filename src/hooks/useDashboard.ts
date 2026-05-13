 import { useQuery, useQueryClient } from '@tanstack/react-query';
 import { supabase } from '@/integrations/supabase/client';
 import { useEffect } from 'react';
 import { logger } from '@/utils/logger';
 
export interface DashboardKPIs {
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

export interface OcupacaoPP {
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

export interface Movimentacao7Dias {
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

 async function getCount(query: Promise<{ count: number | null; error: any }>): Promise<number> {
   try {
     const { count, error } = await query;
     if (error) {
       logger.error('Error in getCount', error);
       return 0;
     }
     return count ?? 0;
   } catch (error) {
     logger.error('Unexpected error in getCount', error);
     return 0;
   }
 }

export const useDashboard = () => {
  const queryClient = useQueryClient();

  const { data, isLoading, error: queryError, refetch } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const hoje = new Date().toISOString().split('T')[0];

      // Parallel fetches
      const [
        totalPosicoes,
        posicoesOcupadas,
        totalTriagens,
        triagensPendentes,
        entradasHoje,
        saidasHoje,
        posicoesData,
        itensParadosData,
      ] = await Promise.all([
        getCount(supabase.from('posicoes_estoque').select('id', { count: 'exact', head: true })),
        getCount(supabase.from('posicoes_estoque').select('id', { count: 'exact', head: true }).eq('status', 'ocupado')),
        getCount(supabase.from('eventos_triagem').select('id', { count: 'exact', head: true })),
        getCount(supabase.from('eventos_triagem').select('id', { count: 'exact', head: true }).is('resultado', null)),
        getCount(supabase.from('lotes').select('id', { count: 'exact', head: true }).eq('status', 'recebido')),
        getCount(supabase.from('lotes').select('id', { count: 'exact', head: true }).eq('status', 'conferido')),
       supabase.from('posicoes_estoque').select('porta_palete, status, secao, nivel').limit(5000),
        supabase.from('estoque_posicao')
          .select('id, quantidade, posicao_id, produto_id, data_entrada, posicoes_estoque(codigo), produtos(sku, nome, peso_unitario)')
          .order('data_entrada', { ascending: true })
          .limit(100),
      ]);

      const taxaOcupacao = totalPosicoes > 0 ? Math.round((posicoesOcupadas / totalPosicoes) * 100) : 0;

      // Ocupação por porta-palete
      const ppMap = new Map<string, { total: number; ocupado: number }>();
      if (posicoesData.data) {
        for (const pos of posicoesData.data) {
          const pp = pos.porta_palete || 'Sem PP';
          if (!ppMap.has(pp)) ppMap.set(pp, { total: 0, ocupado: 0 });
          const entry = ppMap.get(pp)!;
          entry.total++;
          if (pos.status === 'ocupado') entry.ocupado++;
        }
      }
      const ocupacaoPP: OcupacaoPP[] = Array.from(ppMap.entries()).map(([nome, { total, ocupado }]) => ({
        nome,
        total,
        ocupado,
        percentual: total > 0 ? Math.round((ocupado / total) * 100) : 0,
      }));

      // Distribuição por status
      const statusCount: Record<string, number> = {};
      if (posicoesData.data) {
        for (const pos of posicoesData.data) {
          statusCount[pos.status] = (statusCount[pos.status] || 0) + 1;
        }
      }
      const statusColors: Record<string, string> = {
        livre: '#22c55e',
        ocupado: '#3b82f6',
        bloqueado: '#ef4444',
        reservado: '#f59e0b',
        manutencao: '#8b5cf6',
      };
      const distribuicaoStatus: DistribuicaoStatus[] = Object.entries(statusCount).map(([name, value]) => ({
        name: name.charAt(0).toUpperCase() + name.slice(1),
        value,
        color: statusColors[name] || '#6b7280',
      }));

       // Buscar métricas reais para o gráfico de 7 dias
       const seteDiasAtras = new Date();
       seteDiasAtras.setDate(seteDiasAtras.getDate() - 7);
       const { data: metricasData } = await supabase
         .from('metricas_dashboard')
         .select('data, tipo, valor')
         .gte('data', seteDiasAtras.toISOString().split('T')[0])
         .order('data', { ascending: true });

       const movimentacoes7dias: Movimentacao7Dias[] = [];
       for (let i = 6; i >= 0; i--) {
         const d = new Date();
         d.setDate(d.getDate() - i);
         const dataStr = d.toISOString().split('T')[0];
         const diaLabel = d.toLocaleDateString('pt-BR', { weekday: 'short' });
         
         const entradas = metricasData?.filter(m => m.data === dataStr && m.tipo === 'entrada').reduce((acc, m) => acc + m.valor, 0) || 0;
         const saidas = metricasData?.filter(m => m.data === dataStr && m.tipo === 'saida').reduce((acc, m) => acc + m.valor, 0) || 0;
         
         movimentacoes7dias.push({
           dia: diaLabel,
           entradas,
           saidas,
         });
       }

      // Itens parados > 30 dias
      const itensParados: ItemParado[] = [];
      const trintaDiasAtras = new Date();
      trintaDiasAtras.setDate(trintaDiasAtras.getDate() - 30);
      if (itensParadosData.data) {
        for (const item of itensParadosData.data) {
          const dataEntrada = new Date(item.data_entrada);
          if (dataEntrada < trintaDiasAtras) {
            const diasParado = Math.floor((Date.now() - dataEntrada.getTime()) / (1000 * 60 * 60 * 24));
             const prod = item.produtos as Record<string, unknown> | null;
             const pos = item.posicoes_estoque as Record<string, unknown> | null;
            itensParados.push({
              id: item.id,
               sku: (prod?.sku as string) || 'N/A',
               descricao: (prod?.nome as string) || 'Sem descrição',
               posicao: (pos?.codigo as string) || 'N/A',
              diasParado,
              quantidade: item.quantidade,
               valor: (item.quantidade || 0) * ((prod?.peso_unitario as number) || 0),
            });
          }
        }
      }

      const kpis: DashboardKPIs = {
        totalPosicoes,
        posicoesOcupadas,
        taxaOcupacao,
        itensParados30dias: itensParados.length,
        valorParado: itensParados.reduce((acc, i) => acc + i.valor, 0),
        giroMedio: 0,
        entradasHoje,
        saidasHoje,
        triagensHoje: totalTriagens,
        triagensPendentes,
      };

      return { kpis, ocupacaoPP, distribuicaoStatus, movimentacoes7dias, itensParados };
    },
    staleTime: 2 * 60 * 1000,
  });

  useEffect(() => {
    const channel = supabase
      .channel('dashboard-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'posicoes_estoque' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'eventos_triagem' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lotes' }, () => {
        queryClient.invalidateQueries({ queryKey: ['dashboard-stats'] });
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient]);

  return {
    kpis: data?.kpis ?? null,
    ocupacaoPP: data?.ocupacaoPP ?? [],
    distribuicaoStatus: data?.distribuicaoStatus ?? [],
    movimentacoes7dias: data?.movimentacoes7dias ?? [],
    itensParados: data?.itensParados ?? [],
    loading: isLoading,
    error: queryError?.message ?? null,
    refetch,
  };
};
