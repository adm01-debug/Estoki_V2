import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type StatusTriagem = 
  | 'aguardando' 
  | 'em_triagem' 
  | 'aprovado' 
  | 'ressalva' 
  | 'reprovado' 
  | 'conserto' 
  | 'descarte';

export type Prioridade = 'urgente' | 'alta' | 'normal' | 'baixa';

export interface ChecklistTriagem {
  corConforme: boolean;
  tamanhoOk: boolean;
  produtoLimpo: boolean;
  semAvarias: boolean;
  embalagemIntegra: boolean;
  componentesCompletos: boolean;
  funcionalidadeOk: boolean;
}

export interface Defeito {
  tipo: string;
  descricao?: string;
  fotos?: string[];
}

export interface Triagem {
  id: string;
  recebimento_id?: string;
  pedido: string;
  produto: string;
  qtd_total: number;
  total_volumes: number;
  qtd_aprovada: number;
  qtd_reprovada: number;
  percentual_aprovacao: number;
  checklist: ChecklistTriagem;
  defeitos: Defeito[];
  requer_teste: boolean;
  tipo_teste?: string;
  resultado_teste?: string;
  prioridade: Prioridade;
  cliente_vip: boolean;
  cliente_nome?: string;
  prazo_entrega?: string;
  status: StatusTriagem;
  operador_id?: string;
  operador_nome?: string;
  data_inicio?: string;
  data_fim?: string;
  created_at: string;
  updated_at: string;
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
        .from('triagens')
        .select('*')
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      // Parse JSONB fields
      const parsed = (data || []).map(item => ({
        ...item,
        checklist: typeof item.checklist === 'string' 
          ? JSON.parse(item.checklist) 
          : item.checklist,
        defeitos: typeof item.defeitos === 'string'
          ? JSON.parse(item.defeitos)
          : item.defeitos || [],
      }));

      setTriagens(parsed);
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
        { event: '*', schema: 'public', table: 'triagens' },
        () => fetchTriagens()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchTriagens]);

  const iniciarTriagem = async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('triagens')
        .update({
          status: 'em_triagem',
          operador_id: user?.id,
          operador_nome: profile?.nome || user?.email,
          data_inicio: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Triagem iniciada',
        description: 'Você está agora triando este item',
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar triagem';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const atualizarChecklist = async (
    id: string, 
    checklist: ChecklistTriagem
  ): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('triagens')
        .update({ checklist })
        .eq('id', id);

      if (updateError) throw updateError;
      return true;
    } catch (err) {
      console.error('Erro ao atualizar checklist:', err);
      return false;
    }
  };

  const registrarDefeito = async (
    id: string,
    defeito: Defeito
  ): Promise<boolean> => {
    try {
      const triagem = triagens.find(t => t.id === id);
      if (!triagem) return false;

      const novosDefeitos = [...triagem.defeitos, defeito];

      const { error: updateError } = await supabase
        .from('triagens')
        .update({ defeitos: novosDefeitos })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Defeito registrado',
        description: `Tipo: ${defeito.tipo}`,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar defeito';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const finalizarTriagem = async (
    id: string,
    dados: {
      qtd_aprovada: number;
      qtd_reprovada: number;
      resultado_teste?: string;
      status: StatusTriagem;
    }
  ): Promise<boolean> => {
    try {
      const percentual = dados.qtd_aprovada + dados.qtd_reprovada > 0
        ? (dados.qtd_aprovada / (dados.qtd_aprovada + dados.qtd_reprovada)) * 100
        : 0;

      const { error: updateError } = await supabase
        .from('triagens')
        .update({
          ...dados,
          percentual_aprovacao: percentual,
          data_fim: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Triagem finalizada',
        description: `${dados.qtd_aprovada} aprovados, ${dados.qtd_reprovada} reprovados (${percentual.toFixed(1)}%)`,
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
        .from('triagens')
        .select('*')
        .eq('id', id)
        .single();

      if (fetchError) throw fetchError;

      return {
        ...data,
        checklist: typeof data.checklist === 'string'
          ? JSON.parse(data.checklist)
          : data.checklist,
        defeitos: typeof data.defeitos === 'string'
          ? JSON.parse(data.defeitos)
          : data.defeitos || [],
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
        .from('triagens')
        .select('*')
        .eq('operador_id', user.id)
        .gte('data_fim', hoje.toISOString());

      if (error) throw error;

      const triagensHoje = data || [];
      const totalHoje = triagensHoje.length;
      const aprovadas = triagensHoje.filter(t => t.status === 'aprovado').length;
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
    atualizarChecklist,
    registrarDefeito,
    finalizarTriagem,
    getTriagemById,
    getEstatisticasOperador,
  };
}
