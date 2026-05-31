import { supabase } from '@/integrations/supabase/client';
import type { RecebimentoItem, LoteInsert, LoteUpdate } from '@/features/receiving/types';
import { handleReceivingError } from '@/features/receiving/utils/receivingUtils';
import { performanceService } from '@/utils/performance';

export const receivingService = {
  async getRecebimentos(): Promise<RecebimentoItem[]> {
    const startTime = performance.now();
    try {
      const { data, error } = await supabase
        .from('lotes')
        .select('*, produto:produtos(nome, sku)')
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      performanceService.track('getRecebimentos', performance.now() - startTime);
      return data as unknown as RecebimentoItem[];
    } catch (error: any) {
      performanceService.track('getRecebimentos', performance.now() - startTime, true);
      throw handleReceivingError(error, "Busca de Recebimentos");
    }
  },

  async createRecebimento(payload: Partial<LoteInsert>): Promise<RecebimentoItem> {
    const startTime = performance.now();
    try {
      const finalPayload: LoteInsert = {
        numero_lote: payload.numero_lote || '',
        produto_id: payload.produto_id || '',
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
        .insert(finalPayload)
        .select()
        .single();
      
      if (error) throw error;
      performanceService.track('createRecebimento', performance.now() - startTime);
      return data as unknown as RecebimentoItem;
    } catch (error: any) {
      performanceService.track('createRecebimento', performance.now() - startTime, true);
      throw handleReceivingError(error, "Criação de Recebimento");
    }
  },

  async updateRecebimento(id: string, payload: LoteUpdate): Promise<RecebimentoItem> {
    const startTime = performance.now();
    try {
      const { data, error } = await supabase
        .from('lotes')
        .update(payload)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      performanceService.track('updateRecebimento', performance.now() - startTime);
      return data as unknown as RecebimentoItem;
    } catch (error: any) {
      performanceService.track('updateRecebimento', performance.now() - startTime, true);
      throw handleReceivingError(error, "Atualização de Recebimento");
    }
  }
};
