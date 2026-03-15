import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Target, Zap, CheckCircle, Flame, Star, LucideIcon } from 'lucide-react';
import { useGamificacao } from './useGamificacao';

type Dificuldade = 'facil' | 'normal' | 'dificil';

interface DesafioDBRaw {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  meta: number;
  xp_recompensa: number;
  dificuldade: string;
  data_ativo: string;
}

interface DesafioDB {
  id: string;
  titulo: string;
  descricao: string;
  tipo: string;
  meta: number;
  xp_recompensa: number;
  dificuldade: Dificuldade;
  data_ativo: string;
}

interface DesafioUsuario {
  id: string;
  desafio_id: string;
  progresso: number;
  concluido: boolean;
  xp_coletado: boolean;
  data_conclusao: string | null;
}

export interface DesafioCompleto extends DesafioDB {
  progresso: number;
  concluido: boolean;
  xpColetado: boolean;
  Icone: LucideIcon;
}

const iconesPorTipo: Record<string, LucideIcon> = {
  triagens: Target,
  velocidade: Zap,
  defeitos: CheckCircle,
  consecutivo: Flame,
  especial: Star,
};

const dificuldadeLabels = {
  facil: 'Fácil',
  normal: 'Médio',
  dificil: 'Difícil',
};

export function useDesafiosDiarios() {
  const { user } = useAuth();
  const { adicionarXp } = useGamificacao();
  const [desafios, setDesafios] = useState<DesafioDB[]>([]);
  const [desafiosUsuario, setDesafiosUsuario] = useState<DesafioUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  const hoje = new Date().toISOString().split('T')[0];

  const fetchDesafios = useCallback(async () => {
    try {
      // Fetch today's challenges
      const { data: desafiosData, error: desafiosError } = await supabase
        .from('desafios_diarios')
        .select('*')
        .eq('data_ativo', hoje)
        .eq('ativo', true);

      if (desafiosError) throw desafiosError;
      
      // Cast to proper types
      const typedDesafios: DesafioDB[] = (desafiosData || []).map(d => ({
        ...d,
        dificuldade: d.dificuldade as Dificuldade,
      }));
      setDesafios(typedDesafios);

      if (user?.id && desafiosData?.length) {
        // Fetch user's progress
        const desafioIds = desafiosData.map(d => d.id);
        const { data: progressData, error: progressError } = await supabase
          .from('desafios_usuarios')
          .select('*')
          .eq('user_id', user.id)
          .in('desafio_id', desafioIds);

        if (progressError) throw progressError;
        setDesafiosUsuario(progressData || []);
      }
    } catch (error) {
      console.error('Erro ao carregar desafios:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id, hoje]);

  useEffect(() => {
    fetchDesafios();
  }, [fetchDesafios]);

  const desafiosCompletos = useMemo((): DesafioCompleto[] => {
    return desafios.map(desafio => {
      const userProgress = desafiosUsuario.find(d => d.desafio_id === desafio.id);
      
      return {
        ...desafio,
        progresso: userProgress?.progresso || 0,
        concluido: userProgress?.concluido || false,
        xpColetado: userProgress?.xp_coletado || false,
        Icone: iconesPorTipo[desafio.tipo] || Target,
      };
    });
  }, [desafios, desafiosUsuario]);

  const atualizarProgresso = useCallback(async (
    desafioId: string,
    novoProgresso: number
  ) => {
    if (!user?.id) return;

    try {
      const desafio = desafios.find(d => d.id === desafioId);
      if (!desafio) return;

      const concluido = novoProgresso >= desafio.meta;

      const { error } = await supabase
        .from('desafios_usuarios')
        .upsert({
          user_id: user.id,
          desafio_id: desafioId,
          progresso: novoProgresso,
          concluido,
          data_conclusao: concluido ? new Date().toISOString() : null,
        }, {
          onConflict: 'user_id,desafio_id'
        });

      if (error) throw error;

      if (concluido) {
        toast.success('Desafio Completo!', {
          description: `${desafio.titulo} - Colete sua recompensa!`
        });
      }

      await fetchDesafios();
    } catch (error) {
      console.error('Erro ao atualizar progresso:', error);
    }
  }, [user?.id, desafios, fetchDesafios]);

  const coletarRecompensa = useCallback(async (desafioId: string) => {
    if (!user?.id) return false;

    try {
      const desafio = desafiosCompletos.find(d => d.id === desafioId);
      if (!desafio || !desafio.concluido || desafio.xpColetado) return false;

      // Mark as collected
      const { error } = await supabase
        .from('desafios_usuarios')
        .update({ xp_coletado: true })
        .eq('user_id', user.id)
        .eq('desafio_id', desafioId);

      if (error) throw error;

      // Add XP
      await adicionarXp.mutateAsync({
        quantidade: desafio.xp_recompensa,
        tipo: 'desafio',
        descricao: `Desafio "${desafio.titulo}" completado`
      });

      toast.success(`+${desafio.xp_recompensa} XP!`, {
        description: `Recompensa do desafio "${desafio.titulo}" coletada!`
      });

      await fetchDesafios();
      return true;
    } catch (error) {
      console.error('Erro ao coletar recompensa:', error);
      return false;
    }
  }, [user?.id, desafiosCompletos, adicionarXp, fetchDesafios]);

  // Calculated values
  const desafiosConcluidos = desafiosCompletos.filter(d => d.concluido);
  const xpDisponivel = desafiosCompletos
    .filter(d => d.concluido && !d.xpColetado)
    .reduce((acc, d) => acc + d.xp_recompensa, 0);
  const xpTotal = desafiosCompletos.reduce((acc, d) => acc + d.xp_recompensa, 0);

  // Time remaining until midnight
  const [tempoRestante, setTempoRestante] = useState('');
  
  useEffect(() => {
    const atualizarTempo = () => {
      const agora = new Date();
      const amanha = new Date(agora);
      amanha.setDate(amanha.getDate() + 1);
      amanha.setHours(0, 0, 0, 0);

      const diff = amanha.getTime() - agora.getTime();
      const horas = Math.floor(diff / (1000 * 60 * 60));
      const minutos = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      setTempoRestante(`${horas}h ${minutos}m`);
    };

    atualizarTempo();
    const interval = setInterval(atualizarTempo, 60000);
    return () => clearInterval(interval);
  }, []);

  // Função para gerar novos desafios via Edge Function
  const gerarDesafios = useCallback(async () => {
    try {
      const { data, error } = await supabase.functions.invoke('gerar-desafios-diarios', {
        body: { data: hoje }
      });

      if (error) throw error;

      if (data?.success) {
        toast.success('Novos desafios gerados!');
        await fetchDesafios();
        return data.desafios;
      } else {
        throw new Error(data?.error || 'Erro ao gerar desafios');
      }
    } catch (err) {
      console.error('Erro ao gerar desafios:', err);
      toast.error('Não foi possível gerar novos desafios');
      return [];
    }
  }, [hoje, fetchDesafios]);

  return {
    desafios: desafiosCompletos,
    loading,
    refetch: fetchDesafios,
    atualizarProgresso,
    coletarRecompensa,
    desafiosConcluidos: desafiosConcluidos.length,
    totalDesafios: desafiosCompletos.length,
    xpDisponivel,
    xpTotal,
    tempoRestante,
    todosCompletos: desafiosConcluidos.length === desafiosCompletos.length && desafiosCompletos.length > 0,
    dificuldadeLabels,
    gerarDesafios,
  };
}

export default useDesafiosDiarios;


