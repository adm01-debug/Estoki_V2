import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type StatusCiclo = 'agendado' | 'em_andamento' | 'pausado' | 'concluido' | 'cancelado';
export type TipoCiclo = 'completo' | 'amostragem' | 'curva_a' | 'curva_b' | 'curva_c' | 'posicao';

export interface Ciclo {
  id: string;
  nome: string;
  descricao?: string;
  tipo: TipoCiclo;
  status: StatusCiclo;
  data_inicio_prevista: string;
  data_inicio_real?: string;
  data_fim_prevista: string;
  data_fim_real?: string;
  posicoes_total: number;
  posicoes_contadas: number;
  itens_conferidos: number;
  itens_divergentes: number;
  percentual_conclusao: number;
  responsavel_id?: string;
  responsavel_nome?: string;
  created_at: string;
  updated_at: string;
}

export interface Contagem {
  id: string;
  ciclo_id: string;
  posicao_codigo: string;
  produto_id?: string;
  produto_nome?: string;
  quantidade_sistema: number;
  quantidade_contada?: number;
  divergencia?: number;
  status: 'pendente' | 'contado' | 'recontagem' | 'ajustado';
  contado_por?: string;
  data_contagem?: string;
  observacao?: string;
}

export function useInventarioCiclico() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user, profile } = useAuth();

  const fetchCiclos = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const { data, error: fetchError } = await supabase
        .from('inventario_ciclos')
        .select(`
          *,
          profiles:responsavel_id (nome)
        `)
        .order('created_at', { ascending: false });

      if (fetchError) throw fetchError;

      const mapped = (data || []).map(ciclo => ({
        ...ciclo,
        responsavel_nome: ciclo.profiles?.nome,
      }));

      setCiclos(mapped);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar ciclos';
      setError(message);
      console.error('Erro ao buscar ciclos:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCiclos();

    const channel = supabase
      .channel('inventario_changes')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'inventario_ciclos' },
        () => fetchCiclos()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchCiclos]);

  const criarCiclo = async (dados: {
    nome: string;
    descricao?: string;
    tipo: TipoCiclo;
    data_inicio_prevista: string;
    data_fim_prevista: string;
    posicoes?: string[];
  }): Promise<Ciclo | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('inventario_ciclos')
        .insert([{
          nome: dados.nome,
          descricao: dados.descricao,
          tipo: dados.tipo,
          status: 'agendado',
          data_inicio_prevista: dados.data_inicio_prevista,
          data_fim_prevista: dados.data_fim_prevista,
          posicoes_total: dados.posicoes?.length || 0,
          posicoes_contadas: 0,
          itens_conferidos: 0,
          itens_divergentes: 0,
          percentual_conclusao: 0,
          responsavel_id: user?.id,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      // Se posições foram especificadas, criar contagens
      if (dados.posicoes && dados.posicoes.length > 0 && data) {
        const contagens = dados.posicoes.map(posicao => ({
          ciclo_id: data.id,
          posicao_codigo: posicao,
          quantidade_sistema: 0, // TODO: buscar quantidade real
          status: 'pendente',
        }));

        await supabase.from('inventario_contagens').insert(contagens);
      }

      toast({
        title: 'Ciclo criado',
        description: `Inventário "${dados.nome}" agendado`,
      });

      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao criar ciclo';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return null;
    }
  };

  const iniciarCiclo = async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('inventario_ciclos')
        .update({
          status: 'em_andamento',
          data_inicio_real: new Date().toISOString(),
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Ciclo iniciado',
        description: 'Inventário em andamento',
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao iniciar ciclo';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const pausarCiclo = async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('inventario_ciclos')
        .update({ status: 'pausado' })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({ title: 'Ciclo pausado' });
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao pausar ciclo';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const finalizarCiclo = async (id: string): Promise<boolean> => {
    try {
      const { error: updateError } = await supabase
        .from('inventario_ciclos')
        .update({
          status: 'concluido',
          data_fim_real: new Date().toISOString(),
          percentual_conclusao: 100,
        })
        .eq('id', id);

      if (updateError) throw updateError;

      toast({
        title: 'Ciclo finalizado',
        description: 'Inventário concluído com sucesso',
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao finalizar ciclo';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const registrarContagem = async (
    cicloId: string,
    posicaoCodigo: string,
    quantidadeContada: number,
    observacao?: string
  ): Promise<boolean> => {
    try {
      // Buscar contagem existente
      const { data: contagem } = await supabase
        .from('inventario_contagens')
        .select('*')
        .eq('ciclo_id', cicloId)
        .eq('posicao_codigo', posicaoCodigo)
        .single();

      if (contagem) {
        const divergencia = quantidadeContada - contagem.quantidade_sistema;
        
        const { error: updateError } = await supabase
          .from('inventario_contagens')
          .update({
            quantidade_contada: quantidadeContada,
            divergencia,
            status: divergencia === 0 ? 'contado' : 'recontagem',
            contado_por: user?.id,
            data_contagem: new Date().toISOString(),
            observacao,
          })
          .eq('id', contagem.id);

        if (updateError) throw updateError;
      } else {
        // Criar nova contagem
        const { error: insertError } = await supabase
          .from('inventario_contagens')
          .insert({
            ciclo_id: cicloId,
            posicao_codigo: posicaoCodigo,
            quantidade_sistema: 0,
            quantidade_contada: quantidadeContada,
            divergencia: quantidadeContada,
            status: 'contado',
            contado_por: user?.id,
            data_contagem: new Date().toISOString(),
            observacao,
          });

        if (insertError) throw insertError;
      }

      // Atualizar progresso do ciclo
      await atualizarProgressoCiclo(cicloId);

      toast({
        title: 'Contagem registrada',
        description: `Posição ${posicaoCodigo}: ${quantidadeContada} unidades`,
      });

      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao registrar contagem';
      toast({ title: 'Erro', description: message, variant: 'destructive' });
      return false;
    }
  };

  const atualizarProgressoCiclo = async (cicloId: string): Promise<void> => {
    try {
      const { data: contagens } = await supabase
        .from('inventario_contagens')
        .select('*')
        .eq('ciclo_id', cicloId);

      if (!contagens) return;

      const total = contagens.length;
      const contados = contagens.filter(c => c.status !== 'pendente').length;
      const divergentes = contagens.filter(c => c.divergencia && c.divergencia !== 0).length;
      const percentual = total > 0 ? Math.round((contados / total) * 100) : 0;

      await supabase
        .from('inventario_ciclos')
        .update({
          posicoes_contadas: contados,
          itens_conferidos: contados,
          itens_divergentes: divergentes,
          percentual_conclusao: percentual,
        })
        .eq('id', cicloId);
    } catch (err) {
      console.error('Erro ao atualizar progresso:', err);
    }
  };

  const getContagensCiclo = async (cicloId: string): Promise<Contagem[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('inventario_contagens')
        .select('*')
        .eq('ciclo_id', cicloId)
        .order('posicao_codigo');

      if (fetchError) throw fetchError;
      return data || [];
    } catch (err) {
      console.error('Erro ao buscar contagens:', err);
      return [];
    }
  };

  return {
    ciclos,
    loading,
    error,
    refetch: fetchCiclos,
    criarCiclo,
    iniciarCiclo,
    pausarCiclo,
    finalizarCiclo,
    registrarContagem,
    getContagensCiclo,
  };
}
