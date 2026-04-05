import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import { Target, Zap, CheckCircle, Flame, Star, LucideIcon } from 'lucide-react';

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
  const [desafios, setDesafios] = useState<DesafioDB[]>([]);
  const [desafiosUsuario, setDesafiosUsuario] = useState<DesafioUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  const hoje = new Date().toISOString().split('T')[0];

  const fetchDesafios = useCallback(async () => {
    try {
      const { data: desafiosData, error: desafiosError } = await supabase
        .from('desafios_diarios')
        .select('*')
        .eq('data_ativo', hoje)
        .eq('ativo', true);

      if (desafiosError) throw desafiosError;

      const typedDesafios: DesafioDB[] = (desafiosData || []).map(d => ({
        ...d,
        dificuldade: d.dificuldade as Dificuldade,
      }));
      setDesafios(typedDesafios);

      if (user?.id && desafiosData?.length) {
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
      if (import.meta.env.DEV) console.error('Erro ao carregar desafios:', error);
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

  const atualizarProgresso = useCallback(async () => {
    toast.info('O progresso dos desafios é atualizado automaticamente pelo sistema.');
    await fetchDesafios();
  }, [fetchDesafios]);

  const coletarRecompensa = useCallback(async (desafioId: string) => {
    if (!user?.id) return false;

    try {
      const desafio = desafiosCompletos.find(d => d.id === desafioId);
      if (!desafio || !desafio.concluido || desafio.xpColetado) return false;

      const { data, error } = await supabase.rpc('collect_challenge_reward', {
        p_desafio_id: desafioId,
      });

      if (error) throw error;

      toast.success(`+${desafio.xp_recompensa} XP!`, {
        description: `Recompensa do desafio "${desafio.titulo}" coletada!`,
      });

      if (data && typeof data === 'object' && 'success' in data && (data as Record<string, unknown>).success) {
        await fetchDesafios();
      }

      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erro ao coletar recompensa:', error);
      return false;
    }
  }, [user?.id, desafiosCompletos, fetchDesafios]);

  const desafiosConcluidos = desafiosCompletos.filter(d => d.concluido);
  const xpDisponivel = desafiosCompletos
    .filter(d => d.concluido && !d.xpColetado)
    .reduce((acc, d) => acc + d.xp_recompensa, 0);
  const xpTotal = desafiosCompletos.reduce((acc, d) => acc + d.xp_recompensa, 0);

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
      }

      throw new Error(data?.error || 'Erro ao gerar desafios');
    } catch (err) {
      if (import.meta.env.DEV) console.error('Erro ao gerar desafios:', err);
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


