import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export type StatusRomaneio = 'rascunho' | 'confirmado' | 'em_transito' | 'entregue' | 'parcial' | 'cancelado';
export type StatusEntrega = 'pendente' | 'em_rota' | 'entregue' | 'recusado' | 'parcial' | 'reagendado';

export interface RomaneioItem {
  id: string;
  romaneio_id: string;
  cliente: string;
  endereco_entrega: string;
  telefone_cliente?: string;
  quantidade: number;
  peso_kg?: number;
  ordem_entrega?: number;
  nf_saida?: string;
  observacoes?: string;
  status?: StatusEntrega;
}

export interface Romaneio {
  id: string;
  codigo: string;
  data_criacao: string;
  data_prevista_entrega?: string;
  data_saida?: string;
  data_retorno?: string;
  motorista?: string;
  placa_veiculo?: string;
  tipo_veiculo?: string;
  rota?: string;
  status: StatusRomaneio;
  total_entregas: number;
  entregas_realizadas: number;
  total_volumes: number;
  total_peso_kg: number;
  itens: RomaneioItem[];
}

export interface RomaneioInput {
  motorista?: string;
  placa_veiculo?: string;
  tipo_veiculo?: string;
  data_prevista_entrega?: string;
  rota?: string;
  observacoes?: string;
}

export interface RomaneioItemInput {
  cliente: string;
  endereco_entrega: string;
  telefone_cliente?: string;
  quantidade: number;
  peso_kg?: number;
  nf_saida?: string;
  observacoes?: string;
}

export function useRomaneios() {
  const [romaneios, setRomaneios] = useState<Romaneio[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRomaneios = useCallback(async () => {
    try {
      setLoading(true);
      const { data, error: fetchError } = await supabase
        .from('romaneios')
        .select(`
          *,
          romaneio_itens (*)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mapped: Romaneio[] = (data || []).map(r => ({
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
        })),
      }));

      setRomaneios(mapped);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao buscar romaneios');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRomaneios();

    const channel = supabase
      .channel('romaneios_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'romaneios' }, fetchRomaneios)
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRomaneios]);

  const criarRomaneio = async (input: RomaneioInput): Promise<Romaneio | null> => {
    try {
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

      toast.success(`Romaneio ${codigo} criado!`);
      await fetchRomaneios();
      return data as any;
    } catch (err) {
      toast.error('Erro ao criar romaneio');
      return null;
    }
  };

  const adicionarItem = async (romaneioId: string, item: RomaneioItemInput): Promise<boolean> => {
    try {
      const { error } = await supabase
        .from('romaneio_itens')
        .insert({
          romaneio_id: romaneioId,
          ...item,
        });

      if (error) throw error;

      // Atualizar totais
      const romaneio = romaneios.find(r => r.id === romaneioId);
      if (romaneio) {
        await supabase
          .from('romaneios')
          .update({
            total_entregas: romaneio.total_entregas + 1,
            total_volumes: romaneio.total_volumes + item.quantidade,
            total_peso_kg: romaneio.total_peso_kg + (item.peso_kg || 0),
          })
          .eq('id', romaneioId);
      }

      toast.success('Item adicionado ao romaneio');
      await fetchRomaneios();
      return true;
    } catch (err) {
      toast.error('Erro ao adicionar item');
      return false;
    }
  };

  const atualizarStatus = async (id: string, status: StatusRomaneio): Promise<boolean> => {
    try {
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

      toast.success(`Status atualizado para: ${status}`);
      await fetchRomaneios();
      return true;
    } catch (err) {
      toast.error('Erro ao atualizar status');
      return false;
    }
  };

  const registrarEntrega = async (
    romaneioId: string,
    itemId: string,
    status: StatusEntrega,
    dados?: {
      recebedor_nome?: string;
      recebedor_documento?: string;
      assinatura_url?: string;
      foto_entrega_url?: string;
      observacoes?: string;
    }
  ): Promise<boolean> => {
    try {
      // Registrar comprovante
      const { error: comprovanteError } = await supabase
        .from('comprovantes_entrega')
        .insert({
          romaneio_id: romaneioId,
          romaneio_item_id: itemId,
          status,
          data_entrega: status === 'entregue' ? new Date().toISOString() : null,
          recebedor_nome: dados?.recebedor_nome,
          recebedor_documento: dados?.recebedor_documento,
          assinatura_url: dados?.assinatura_url,
          foto_entrega_url: dados?.foto_entrega_url,
          observacoes: dados?.observacoes,
        });

      if (comprovanteError) throw comprovanteError;

      // Atualizar contagem de entregas realizadas
      if (status === 'entregue') {
        const romaneio = romaneios.find(r => r.id === romaneioId);
        if (romaneio) {
          const novasEntregas = romaneio.entregas_realizadas + 1;
          const novoStatus = novasEntregas >= romaneio.total_entregas ? 'entregue' : 'parcial';

          await supabase
            .from('romaneios')
            .update({
              entregas_realizadas: novasEntregas,
              status: novoStatus,
            })
            .eq('id', romaneioId);
        }
      }

      toast.success('Entrega registrada!');
      await fetchRomaneios();
      return true;
    } catch (err) {
      toast.error('Erro ao registrar entrega');
      return false;
    }
  };

  return {
    romaneios,
    loading,
    error,
    refetch: fetchRomaneios,
    criarRomaneio,
    adicionarItem,
    atualizarStatus,
    registrarEntrega,
  };
}
