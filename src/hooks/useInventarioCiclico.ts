import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';

export type StatusCiclo = 'agendado' | 'em_andamento' | 'concluido' | 'cancelado';
export type TipoCiclo = 'completo' | 'amostragem' | 'curva_a' | 'curva_b' | 'curva_c' | 'posicao' | 'zona';
export type StatusContagem = 'pendente' | 'em_andamento' | 'concluido' | 'divergencia';

export interface Ciclo {
  id: string;
  nome: string;
  descricao?: string;
  tipo: TipoCiclo;
  status: StatusCiclo;
  data_agendada: string;
  data_inicio?: string;
  data_fim?: string;
  total_posicoes: number;
  posicoes_contadas: number;
  divergencias_encontradas: number;
  acuracidade?: number;
  zona_alvo?: string;
  porta_palete_alvo?: string;
  responsavel_id?: string;
  responsavel_nome?: string;
  observacoes?: string;
  created_at: string;
  updated_at: string;
}

export interface Contagem {
  id: string;
  ciclo_id: string;
  posicao_id: string;
  produto_id?: string;
  produto_nome?: string;
  lote_id?: string;
  quantidade_sistema: number;
  quantidade_contada?: number;
  quantidade_recontada?: number;
  status: StatusContagem;
  recontagem_necessaria: boolean;
  contado_por?: string;
  recontado_por?: string;
  ajustado_por?: string;
  data_contagem?: string;
  data_recontagem?: string;
  data_ajuste?: string;
  justificativa_ajuste?: string;
  observacoes?: string;
}

export function useInventarioCiclico() {
  const [ciclos, setCiclos] = useState<Ciclo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { user } = useAuth();

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

      const mapped: Ciclo[] = (data || []).map(ciclo => ({
        id: ciclo.id,
        nome: ciclo.nome,
        descricao: ciclo.descricao || undefined,
        tipo: ciclo.tipo as TipoCiclo,
        status: ciclo.status as StatusCiclo,
        data_agendada: ciclo.data_agendada,
        data_inicio: ciclo.data_inicio || undefined,
        data_fim: ciclo.data_fim || undefined,
        total_posicoes: ciclo.total_posicoes || 0,
        posicoes_contadas: ciclo.posicoes_contadas || 0,
        divergencias_encontradas: ciclo.divergencias_encontradas || 0,
        acuracidade: ciclo.acuracidade || undefined,
        zona_alvo: ciclo.zona_alvo || undefined,
        porta_palete_alvo: ciclo.porta_palete_alvo || undefined,
        responsavel_id: ciclo.responsavel_id || undefined,
        responsavel_nome: ciclo.profiles?.nome || undefined,
        observacoes: ciclo.observacoes || undefined,
        created_at: ciclo.created_at,
        updated_at: ciclo.updated_at,
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
    data_agendada: string;
    zona_alvo?: string;
    porta_palete_alvo?: string;
  }): Promise<Ciclo | null> => {
    try {
      const { data, error: insertError } = await supabase
        .from('inventario_ciclos')
        .insert([{
          nome: dados.nome,
          descricao: dados.descricao,
          tipo: dados.tipo,
          status: 'agendado' as const,
          data_agendada: dados.data_agendada,
          zona_alvo: dados.zona_alvo,
          porta_palete_alvo: dados.porta_palete_alvo,
          total_posicoes: 0,
          posicoes_contadas: 0,
          divergencias_encontradas: 0,
          responsavel_id: user?.id,
        }])
        .select()
        .single();

      if (insertError) throw insertError;

      toast({
        title: 'Ciclo criado',
        description: `Inventário "${dados.nome}" agendado`,
      });

      const mapped: Ciclo = {
        id: data.id,
        nome: data.nome,
        descricao: data.descricao || undefined,
        tipo: data.tipo as TipoCiclo,
        status: data.status as StatusCiclo,
        data_agendada: data.data_agendada,
        data_inicio: data.data_inicio || undefined,
        data_fim: data.data_fim || undefined,
        total_posicoes: data.total_posicoes || 0,
        posicoes_contadas: data.posicoes_contadas || 0,
        divergencias_encontradas: data.divergencias_encontradas || 0,
        acuracidade: data.acuracidade || undefined,
        zona_alvo: data.zona_alvo || undefined,
        porta_palete_alvo: data.porta_palete_alvo || undefined,
        responsavel_id: data.responsavel_id || undefined,
        observacoes: data.observacoes || undefined,
        created_at: data.created_at,
        updated_at: data.updated_at,
      };

      return mapped;
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
          status: 'em_andamento' as const,
          data_inicio: new Date().toISOString(),
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
      // Pausar não existe no enum, então volta para agendado
      const { error: updateError } = await supabase
        .from('inventario_ciclos')
        .update({ status: 'agendado' as const })
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
          status: 'concluido' as const,
          data_fim: new Date().toISOString(),
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
    posicaoId: string,
    quantidadeContada: number,
    observacao?: string
  ): Promise<boolean> => {
    try {
      // Buscar contagem existente
      const { data: contagem } = await supabase
        .from('inventario_contagens')
        .select('*')
        .eq('ciclo_id', cicloId)
        .eq('posicao_id', posicaoId)
        .single();

      if (contagem) {
        const divergencia = quantidadeContada !== contagem.quantidade_sistema;
        const newStatus: StatusContagem = divergencia ? 'divergencia' : 'concluido';
        
        const { error: updateError } = await supabase
          .from('inventario_contagens')
          .update({
            quantidade_contada: quantidadeContada,
            status: newStatus,
            recontagem_necessaria: divergencia,
            contado_por: user?.id,
            data_contagem: new Date().toISOString(),
            observacoes: observacao,
          })
          .eq('id', contagem.id);

        if (updateError) throw updateError;
      } else {
        // Criar nova contagem
        const { error: insertError } = await supabase
          .from('inventario_contagens')
          .insert([{
            ciclo_id: cicloId,
            posicao_id: posicaoId,
            quantidade_sistema: 0,
            quantidade_contada: quantidadeContada,
            status: 'concluido' as StatusContagem,
            recontagem_necessaria: false,
            contado_por: user?.id,
            data_contagem: new Date().toISOString(),
            observacoes: observacao,
          }]);

        if (insertError) throw insertError;
      }

      // Atualizar progresso do ciclo
      await atualizarProgressoCiclo(cicloId);

      toast({
        title: 'Contagem registrada',
        description: `${quantidadeContada} unidades contadas`,
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
      const divergentes = contagens.filter(c => c.recontagem_necessaria).length;
      const acuracidade = contados > 0 ? ((contados - divergentes) / contados) * 100 : 0;

      await supabase
        .from('inventario_ciclos')
        .update({
          total_posicoes: total,
          posicoes_contadas: contados,
          divergencias_encontradas: divergentes,
          acuracidade: Math.round(acuracidade * 100) / 100,
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
        .order('created_at');

      if (fetchError) throw fetchError;
      
      return (data || []).map(c => ({
        id: c.id,
        ciclo_id: c.ciclo_id,
        posicao_id: c.posicao_id,
        produto_id: c.produto_id || undefined,
        lote_id: c.lote_id || undefined,
        quantidade_sistema: c.quantidade_sistema,
        quantidade_contada: c.quantidade_contada || undefined,
        quantidade_recontada: c.quantidade_recontada || undefined,
        status: c.status as StatusContagem,
        recontagem_necessaria: c.recontagem_necessaria || false,
        contado_por: c.contado_por || undefined,
        recontado_por: c.recontado_por || undefined,
        ajustado_por: c.ajustado_por || undefined,
        data_contagem: c.data_contagem || undefined,
        data_recontagem: c.data_recontagem || undefined,
        data_ajuste: c.data_ajuste || undefined,
        justificativa_ajuste: c.justificativa_ajuste || undefined,
        observacoes: c.observacoes || undefined,
      }));
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
