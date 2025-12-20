import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export type StatusRecebimento = 
  | 'aguardando' 
  | 'chegou' 
  | 'conferencia' 
  | 'divergencia' 
  | 'ok' 
  | 'finalizado';

export type TipoEmbalagem = 'original' | 'plastica' | 'generica';

export interface Recebimento {
  id: string;
  pedido: string;
  fornecedor: string;
  produto: string;
  sku?: string;
  nf?: string;
  qtd_pedida: number;
  qtd_recebida?: number;
  qtd_volumes?: number;
  qtd_por_volume?: number;
  tipo_embalagem?: TipoEmbalagem;
  descricao_volumes?: string;
  status: StatusRecebimento;
  previsao_chegada?: string;
  data_chegada?: string;
  divergencia?: number;
  percentual_divergencia?: number;
  fotos?: string[];
  conferido_por?: string;
  created_at: string;
  updated_at: string;
}

export interface RecebimentoInput {
  pedido: string;
  fornecedor: string;
  produto: string;
  sku?: string;
  nf?: string;
  qtd_pedida: number;
  qtd_volumes?: number;
  qtd_por_volume?: number;
  tipo_embalagem?: TipoEmbalagem;
  descricao_volumes?: string;
  previsao_chegada?: string;
}

export interface ConferenciaInput {
  qtd_recebida: number;
  fotos?: string[];
  observacoes?: string;
}

export function useRecebimentos() {
  const [recebimentos, setRecebimentos] = useState<Recebimento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchRecebimentos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('recebimentos')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      setRecebimentos(data || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar recebimentos';
      setError(message);
      console.error('Erro ao buscar recebimentos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecebimentos();

    // Realtime subscription
    const channel = supabase
      .channel('recebimentos_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'recebimentos' },
        () => {
          fetchRecebimentos();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchRecebimentos]);

  const createRecebimento = async (input: RecebimentoInput): Promise<Recebimento | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('recebimentos')
        .insert([{ ...input, status: 'aguardando' }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Recebimento criado',
        description: `Pedido ${input.pedido} registrado com sucesso`,
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar recebimento';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return null;
    }
  };

  const registrarChegada = async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('recebimentos')
        .update({ 
          status: 'chegou',
          data_chegada: new Date().toISOString()
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Chegada registrada',
        description: 'Material marcado como recebido',
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar chegada';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const iniciarConferencia = async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('recebimentos')
        .update({ status: 'conferencia' })
        .eq('id', id);

      if (updateError) throw updateError;

      return true;
    } catch (err) {
      console.error('Erro ao iniciar conferência:', err);
      return false;
    }
  };

  const finalizarConferencia = async (
    id: string, 
    conferencia: ConferenciaInput,
    qtdPedida: number
  ): Promise<boolean> => {
    try {
      const { data: user } = await supabase.auth.getUser();
      
      const divergencia = conferencia.qtd_recebida - qtdPedida;
      const percentualDivergencia = ((conferencia.qtd_recebida / qtdPedida) * 100) - 100;
      
      let novoStatus: StatusRecebimento = 'ok';
      if (divergencia !== 0) {
        novoStatus = 'divergencia';
      }

      const { error: updateError } = await supabase
        .from('recebimentos')
        .update({ 
          status: novoStatus,
          qtd_recebida: conferencia.qtd_recebida,
          divergencia,
          percentual_divergencia: percentualDivergencia,
          fotos: conferencia.fotos,
          conferido_por: user?.user?.id
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Conferência finalizada',
        description: divergencia === 0 
          ? 'Recebimento OK - sem divergências' 
          : `Divergência de ${divergencia} unidades (${percentualDivergencia.toFixed(1)}%)`,
        variant: divergencia === 0 ? 'default' : 'destructive',
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao finalizar conferência';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const finalizarRecebimento = async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('recebimentos')
        .update({ status: 'finalizado' })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Recebimento finalizado',
        description: 'Item disponível para triagem',
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao finalizar';
      toast({
        title: 'Erro',
        description: message,
        variant: 'destructive',
      });
      return false;
    }
  };

  const getRecebimentoById = async (id: string): Promise<Recebimento | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('recebimentos')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      console.error('Erro ao buscar recebimento:', err);
      return null;
    }
  };

  const getRecebimentoByPedido = async (pedido: string): Promise<Recebimento | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('recebimentos')
        .select('*')
        .eq('pedido', pedido)
        .single();

      if (fetchError) throw fetchError;
      return data;
    } catch (err) {
      console.error('Erro ao buscar recebimento por pedido:', err);
      return null;
    }
  };

  return {
    recebimentos,
    loading,
    error,
    refetch: fetchRecebimentos,
    createRecebimento,
    registrarChegada,
    iniciarConferencia,
    finalizarConferencia,
    finalizarRecebimento,
    getRecebimentoById,
    getRecebimentoByPedido,
  };
}
