import { supabase } from '@/integrations/supabase/client';
import type { Romaneio, RomaneioInput, RomaneioItemInput, StatusRomaneio, StatusEntrega } from '../types';

export const shippingService = {
  async getRomaneios(): Promise<Romaneio[]> {
    const { data, error } = await supabase
      .from('romaneios')
      .select(`
        *,
        romaneio_itens (*)
      `)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return (data || []).map(r => ({
      id: r.id,
      codigo: r.codigo,
      data_criacao: r.data_criacao,
      data_prevista_entrega: r.data_prevista_entrega || undefined,
      data_saida: r.data_saida || undefined,
      data_retorno: r.data_retorno || undefined,
      motorista: r.motorista || undefined,
      placa_veiculo: r.placa_veiculo || undefined,
      tipo_veiculo: r.tipo_veiculo || undefined,
      rota: r.rota || undefined,
      status: r.status as StatusRomaneio,
      total_entregas: r.total_entregas || 0,
      entregas_realizadas: r.entregas_realizadas || 0,
      total_volumes: r.total_volumes || 0,
      total_peso_kg: r.total_peso_kg || 0,
      itens: (r.romaneio_itens || []).map((item: any) => ({
        id: item.id,
        romaneio_id: item.romaneio_id,
        cliente: item.cliente,
        endereco_entrega: item.endereco_entrega,
        telefone_cliente: item.telefone_cliente,
        quantidade: item.quantidade,
        peso_kg: item.peso_kg,
        ordem_entrega: item.ordem_entrega,
        nf_saida: item.nf_saida,
        observacoes: item.observacoes,
        status: item.status as StatusEntrega
      })),
    }));
  },

  async criarRomaneio(input: RomaneioInput): Promise<Romaneio> {
    const codigo = `ROM-${Date.now().toString(36).toUpperCase()}`;
    const { data, error } = await supabase
      .from('romaneios')
      .insert({
        codigo,
        motorista: input.motorista,
        placa_veiculo: input.placa_veiculo,
        tipo_veiculo: input.tipo_veiculo,
        data_prevista_entrega: input.data_prevista_entrega,
        rota: input.rota,
        observacoes: input.observacoes,
        status: 'rascunho',
      })
      .select()
      .single();

    if (error) throw error;
    return data as any;
  },

  async atualizarStatus(id: string, status: StatusRomaneio): Promise<void> {
    const updates: Record<string, any> = { status };
    if (status === 'em_transito') {
      updates.data_saida = new Date().toISOString();
    } else if (status === 'entregue' || status === 'parcial') {
      updates.data_retorno = new Date().toISOString();
    }

    const { error } = await supabase
      .from('romaneios')
      .update(updates)
      .eq('id', id);

    if (error) throw error;
  }
};
