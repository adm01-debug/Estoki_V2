import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { Ciclo, TipoCiclo, StatusCiclo, Contagem, StatusContagem } from './types';
import { mapCiclo, mapContagem, updateCicloProgress } from './utils';

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

      setCiclos((data || []).map(mapCiclo));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Erro ao buscar ciclos';
      setError(message);
      if (import.meta.env.DEV) console.error('Erro ao buscar ciclos:', err);
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

      return mapCiclo(data);
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

      await updateCicloProgress(cicloId);

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

  const getContagensCiclo = async (cicloId: string): Promise<Contagem[]> => {
    try {
      const { data, error: fetchError } = await supabase
        .from('inventario_contagens')
        .select('*')
        .eq('ciclo_id', cicloId)
        .order('created_at');

      if (fetchError) throw fetchError;
      
      return (data || []).map(mapContagem);
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao buscar contagens:', err);
      return [];
    }
  };

   const deleteCiclo = async (id: string): Promise<boolean> => {
     try {
       const { error: deleteError } = await supabase
         .from('inventario_ciclos')
         .delete()
         .eq('id', id);
       if (deleteError) throw deleteError;
       toast({ title: 'Ciclo excluído' });
       return true;
     } catch (err) {
       const message = err instanceof Error ? err.message : 'Erro ao excluir ciclo';
       toast({ title: 'Erro', description: message, variant: 'destructive' });
       return false;
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
     deleteCiclo,
     registrarContagem,
     getContagensCiclo,
   };
}
