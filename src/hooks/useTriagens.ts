import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

// Note: Using eventos_triagem table which exists in the schema

export type StatusTriagem = 'em_andamento' | 'aprovado' | 'reprovado' | 'ressalva';

export interface Triagem {
  id: string;
  lote_id?: string;
  produto_id?: string;
  produto_nome?: string;
  operador_id?: string;
  operador_nome?: string;
  resultado?: string;
  observacoes?: string;
  fotos?: string[];
  data_inicio: string;
  data_fim?: string;
  created_at: string;
}

export function useTriagens() {
  const [triagens, setTriagens] = useState<Triagem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const fetchTriagens = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('eventos_triagem')
        .select(`
          *,
          produtos (nome),
          profiles:operador_id (nome)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mapped: Triagem[] = (data || []).map(item => ({
        id: item.id,
        lote_id: item.lote_id || undefined,
        produto_id: item.produto_id || undefined,
        produto_nome: item.produtos?.nome || undefined,
        operador_id: item.operador_id || undefined,
        operador_nome: item.profiles?.nome || undefined,
        resultado: item.resultado || undefined,
        observacoes: item.observacoes || undefined,
        fotos: item.fotos || [],
        data_inicio: item.data_inicio,
        data_fim: item.data_fim || undefined,
        created_at: item.created_at,
      }));

      setTriagens(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar triagens';
      setError(message);
      console.error('Erro ao buscar triagens:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTriagens();

    const channel = supabase
      .channel('triagens_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'eventos_triagem' },
        () => fetchTriagens()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTriagens]);

  const iniciarTriagem = async (
    produtoId?: string,
    loteId?: string
  ): Promise<Triagem | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('eventos_triagem')
        .insert({
          produto_id: produtoId,
          lote_id: loteId,
          operador_id: user?.id,
          data_inicio: new Date().toISOString(),
        })
        .select(`
          *,
          produtos (nome),
          profiles:operador_id (nome)
        `)
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Triagem iniciada',
        description: 'Você está agora triando este item',
      });

      return {
        id: data.id,
        lote_id: data.lote_id || undefined,
        produto_id: data.produto_id || undefined,
        produto_nome: data.produtos?.nome || undefined,
        operador_id: data.operador_id || undefined,
        operador_nome: data.profiles?.nome || undefined,
        resultado: data.resultado || undefined,
        observacoes: data.observacoes || undefined,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim || undefined,
        created_at: data.created_at,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar triagem';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    }
  };

  const finalizarTriagem = async (
    id: string,
    dados: {
      resultado: string;
      observacoes?: string;
    }
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('eventos_triagem')
        .update({
          resultado: dados.resultado,
          observacoes: dados.observacoes,
          data_fim: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Triagem finalizada',
        description: `Resultado: ${dados.resultado}`,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao finalizar triagem';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const getTriagemById = async (id: string): Promise<Triagem | null> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('eventos_triagem')
        .select(`
          *,
          produtos (nome),
          profiles:operador_id (nome)
        `)
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        id: data.id,
        lote_id: data.lote_id || undefined,
        produto_id: data.produto_id || undefined,
        produto_nome: data.produtos?.nome || undefined,
        operador_id: data.operador_id || undefined,
        operador_nome: data.profiles?.nome || undefined,
        resultado: data.resultado || undefined,
        observacoes: data.observacoes || undefined,
        data_inicio: data.data_inicio,
        data_fim: data.data_fim || undefined,
        created_at: data.created_at,
      };
    } catch (err) {
      console.error('Erro ao buscar triagem:', err);
      return null;
    }
  };

  // Estatísticas para dashboard do triador
  const getEstatisticasOperador = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const hoje = new Date();
      hoje.setHours(0, 0, 0, 0);

      const { data, error } = await supabase
        .from('eventos_triagem')
        .select('*')
        .eq('operador_id', user.id)
        .gte('data_fim', hoje.toISOString())
        .not('data_fim', 'is', null);

      if (error) throw error;

      const triagensHoje = data || [];
      const totalHoje = triagensHoje.length;
      const aprovadas = triagensHoje.filter(t => t.resultado === 'aprovado').length;
      const tempoMedio = triagensHoje.reduce((acc, t) => {
        if (t.data_inicio && t.data_fim) {
          const inicio = new Date(t.data_inicio);
          const fim = new Date(t.data_fim);
          return acc + (fim.getTime() - inicio.getTime()) / 60000;
        }
        return acc;
      }, 0) / (totalHoje || 1);

      return {
        triagensHoje: totalHoje,
        aprovadas,
        reprovadas: totalHoje - aprovadas,
        tempoMedioMinutos: tempoMedio,
      };
    } catch (err) {
      console.error('Erro ao buscar estatísticas:', err);
      return null;
    }
  }, [user?.id]);

  return {
    triagens,
    loading,
    error,
    refetch: fetchTriagens,
    iniciarTriagem,
    finalizarTriagem,
    getTriagemById,
    getEstatisticasOperador,
  };
}
