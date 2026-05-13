  import { supabase } from '@/lib/supabase';
 import { logger } from '@/utils/logger';
 import { Database } from '@/integrations/supabase/types';
 
 type RastreamentoHistorico = Database['public']['Tables']['rastreamento_historico']['Row'];
  type RastreamentoInsert = Database['public']['Tables']['rastreamento_historico']['Insert'];
  type TipoEvento = Database['public']['Tables']['rastreamento_historico']['Row']['tipo_evento'];
 
export interface Movimentacao {
  id?: string;
  tipo: 'entrada' | 'saida' | 'transferencia' | 'ajuste';
  produto_id?: string;
  lote_id?: string;
  posicao_origem?: string;
  posicao_destino?: string;
  quantidade: number;
  motivo?: string;
  usuario_id: string;
  created_at?: string;
}

export const movimentacaoService = {
   async registrar(mov: Omit<Movimentacao, 'id' | 'created_at'>): Promise<boolean> {
     try {
       const { error } = await supabase
         .from('rastreamento_historico')
         .insert({
           tipo_evento: mov.tipo,
           lote_id: mov.lote_id,
           descricao: mov.motivo || `Movimentação: ${mov.tipo}`,
           quantidade: mov.quantidade,
           operador_id: mov.usuario_id,
           localizacao: mov.posicao_destino || mov.posicao_origem,
            detalhes: {
              produto_id: mov.produto_id,
              posicao_origem: mov.posicao_origem,
              posicao_destino: mov.posicao_destino,
            } as any,
          } as RastreamentoInsert);

       if (error) {
         logger.error('Erro ao registrar movimentação', error);
         return false;
       }
 
       return true;
     } catch (error) {
       logger.error('Erro inesperado ao registrar movimentação', error);
       return false;
     }
   },

  async getHistorico(filtros?: {
    lote_id?: string;
    produto_id?: string;
    tipo?: string;
    data_inicio?: string;
    data_fim?: string;
    limit?: number;
  }): Promise<Movimentacao[]> {
    try {
      let query = supabase
        .from('rastreamento_historico')
        .select('*')
        .order('created_at', { ascending: false });

      if (filtros?.lote_id) {
        query = query.eq('lote_id', filtros.lote_id);
      }
      if (filtros?.tipo) {
        query = query.eq('tipo_evento', filtros.tipo as TipoEvento);
      }
      if (filtros?.data_inicio) {
        query = query.gte('created_at', filtros.data_inicio);
      }
      if (filtros?.data_fim) {
        query = query.lte('created_at', filtros.data_fim);
      }
      if (filtros?.limit) {
        query = query.limit(filtros.limit);
      }

      const { data, error } = await query;

       if (error) {
         logger.error('Erro ao buscar histórico', error);
         return [];
       }
 
       return (data || []).map((item: RastreamentoHistorico) => {
         const detalhes = item.detalhes as Record<string, unknown> | null;
         return {
           id: item.id,
           tipo: item.tipo_evento as Movimentacao['tipo'],
           lote_id: item.lote_id ?? undefined,
           posicao_origem: detalhes?.posicao_origem as string | undefined,
           posicao_destino: detalhes?.posicao_destino as string | undefined,
           quantidade: item.quantidade ?? 0,
           motivo: item.descricao ?? undefined,
           usuario_id: item.operador_id ?? '',
           produto_id: detalhes?.produto_id as string | undefined,
           created_at: item.created_at,
         };
       });
     } catch (error) {
       logger.error('Erro inesperado ao buscar histórico', error);
       return [];
     }
  },

  async getUltimaMovimentacao(loteId: string): Promise<Movimentacao | null> {
    const { data, error } = await supabase
      .from('rastreamento_historico')
      .select('*')
      .eq('lote_id', loteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

     const detalhes = data.detalhes as Record<string, unknown> | null;
     return {
       id: data.id,
       tipo: data.tipo_evento as Movimentacao['tipo'],
       lote_id: data.lote_id ?? undefined,
       posicao_origem: detalhes?.posicao_origem as string | undefined,
       posicao_destino: detalhes?.posicao_destino as string | undefined,
       quantidade: data.quantidade ?? 0,
       motivo: data.descricao ?? undefined,
       usuario_id: data.operador_id ?? '',
       created_at: data.created_at,
     };
  },
};
