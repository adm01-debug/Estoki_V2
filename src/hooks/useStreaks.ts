import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface StreakUsuario {
  id: string;
  user_id: string;
  streak_atual: number;
  streak_recorde: number;
  ultimo_checkin: string | null;
  xp_bonus_coletado: number;
}

interface StreakHistorico {
  data: string;
  xp_ganho: number;
}

interface StreakBonus {
  dias: number;
  multiplicador: number;
  xpBonus: number;
  titulo: string;
}

export const STREAK_BONUSES: StreakBonus[] = [
  { dias: 3, multiplicador: 1.1, xpBonus: 50, titulo: 'Iniciante Dedicado' },
  { dias: 5, multiplicador: 1.15, xpBonus: 100, titulo: 'Trabalhador Consistente' },
  { dias: 7, multiplicador: 1.2, xpBonus: 200, titulo: 'Semana Perfeita' },
  { dias: 14, multiplicador: 1.3, xpBonus: 500, titulo: 'Quinzena de Ouro' },
  { dias: 30, multiplicador: 1.5, xpBonus: 1500, titulo: 'Mestre da Consistência' },
];

export function useStreaks() {
  const { user } = useAuth();
  const [streak, setStreak] = useState<StreakUsuario | null>(null);
  const [historico, setHistorico] = useState<StreakHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchStreak = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('streaks_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      setStreak(data ?? null);

      const { data: historicoData } = await supabase
        .from('streaks_historico')
        .select('data, xp_ganho')
        .eq('user_id', user.id)
        .order('data', { ascending: false })
        .limit(30);

      setHistorico(historicoData || []);
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erro ao carregar streak:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchStreak();
  }, [fetchStreak]);

  const registrarCheckin = useCallback(async () => {
    if (!user?.id) return null;

    try {
      const { data, error } = await supabase.rpc('registrar_checkin_diario', {
        p_user_id: user.id
      });

      if (error) throw error;

      await fetchStreak();

      return data;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erro ao registrar check-in:', error);
      return null;
    }
  }, [user?.id, fetchStreak]);

  const getBonusAtual = useCallback(() => {
    if (!streak) return null;
    return [...STREAK_BONUSES]
      .reverse()
      .find(b => b.dias <= streak.streak_atual);
  }, [streak]);

  const getProximoBonus = useCallback(() => {
    if (!streak) return STREAK_BONUSES[0];
    return STREAK_BONUSES.find(b => b.dias > streak.streak_atual);
  }, [streak]);

  const getProgressoParaProximo = useCallback(() => {
    if (!streak) return 0;
    const bonusAtual = getBonusAtual();
    const proximoBonus = getProximoBonus();
    
    if (!proximoBonus) return 100;
    
    const inicio = bonusAtual?.dias || 0;
    const fim = proximoBonus.dias;
    const atual = streak.streak_atual;
    
    return ((atual - inicio) / (fim - inicio)) * 100;
  }, [streak, getBonusAtual, getProximoBonus]);

  // Check if user checked in today
  const checkedInToday = streak?.ultimo_checkin === new Date().toISOString().split('T')[0];

  return {
    streak,
    historico,
    loading,
    registrarCheckin,
    refetch: fetchStreak,
    streakAtual: streak?.streak_atual || 0,
    streakRecorde: streak?.streak_recorde || 0,
    bonusAtual: getBonusAtual(),
    proximoBonus: getProximoBonus(),
    progressoParaProximo: getProgressoParaProximo(),
    checkedInToday,
    STREAK_BONUSES
  };
}

export default useStreaks;
