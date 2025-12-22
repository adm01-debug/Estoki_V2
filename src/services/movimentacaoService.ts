import { supabase } from '@/integrations/supabase/client';

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
  // Registrar movimentação usando rastreamento_historico
  async registrar(mov: Omit<Movimentacao, 'id' | 'created_at'>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('rastreamento_historico')
        .insert({
          tipo_evento: mov.tipo,
          lote_id: mov.lote_id,
          posicao_origem: mov.posicao_origem,
          posicao_destino: mov.posicao_destino,
          quantidade: mov.quantidade,
          usuario_id: mov.usuario_id,
          observacoes: mov.motivo,
          dados_adicionais: {
            produto_id: mov.produto_id,
          },
        });

      if (error) {
        console.error('Erro ao registrar movimentação:', error);
        return false;
      }

      return true;
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error);
      return false;
    }
  },

  // Buscar histórico de movimentações
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
        query = query.eq('tipo_evento', filtros.tipo);
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
        console.error('Erro ao buscar histórico:', error);
        return [];
      }

      return (data || []).map(item => ({
        id: item.id,
        tipo: item.tipo_evento as Movimentacao['tipo'],
        lote_id: item.lote_id,
        posicao_origem: item.posicao_origem,
        posicao_destino: item.posicao_destino,
        quantidade: item.quantidade,
        motivo: item.observacoes,
        usuario_id: item.usuario_id,
        produto_id: item.dados_adicionais?.produto_id,
        created_at: item.created_at,
      }));
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return [];
    }
  },

  // Buscar última movimentação de um lote
  async getUltimaMovimentacao(loteId: string): Promise<Movimentacao | null> {
    const { data, error } = await supabase
      .from('rastreamento_historico')
      .select('*')
      .eq('lote_id', loteId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error || !data) return null;

    return {
      id: data.id,
      tipo: data.tipo_evento as Movimentacao['tipo'],
      lote_id: data.lote_id,
      posicao_origem: data.posicao_origem,
      posicao_destino: data.posicao_destino,
      quantidade: data.quantidade,
      motivo: data.observacoes,
      usuario_id: data.usuario_id,
      created_at: data.created_at,
    };
  },
};
