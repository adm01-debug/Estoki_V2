import { supabase } from '@/integrations/supabase/client';
import type { RecebimentoItem, LoteInsert, LoteUpdate } from '../types';
import { handleReceivingError } from '../utils/receivingUtils';

export const receivingService = {
  async getRecebimentos(): Promise<RecebimentoItem[]> {
    const { data, error } = await supabase
      .from('lotes')
      .select('*, produto:produtos(nome, sku)')
      .order('created_at', { ascending: false });
    
    if (error) throw handleReceivingError(error, "Busca de Recebimentos");
    return data as unknown as RecebimentoItem[];
  },

  async createRecebimento(payload: Partial<LoteInsert>): Promise<RecebimentoItem> {
    const finalPayload = {
      numero_lote: payload.numero_lote,
      produto_id: payload.produto_id,
      quantidade_inicial: payload.quantidade_inicial || 0,
      quantidade_atual: payload.quantidade_atual || 0,
      quantidade_pedida: payload.quantidade_pedida,
      fornecedor: payload.fornecedor,
      nf_entrada: payload.nf_entrada,
      previsao_chegada: payload.previsao_chegada,
      pedido_compra: payload.pedido_compra,
      data_validade: payload.data_validade,
      data_fabricacao: payload.data_fabricacao,
      status: payload.status || 'aguardando',
    };

    const { data, error } = await supabase
      .from('lotes')
      .insert(finalPayload as any)
      .select()
      .single();
    
    if (error) throw handleReceivingError(error, "Criação de Recebimento");
    return data as unknown as RecebimentoItem;
  },

  async updateRecebimento(id: string, payload: LoteUpdate): Promise<RecebimentoItem> {
    const { data, error } = await supabase
      .from('lotes')
      .update(payload)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw handleReceivingError(error, "Atualização de Recebimento");
    return data as unknown as RecebimentoItem;
  }
};
