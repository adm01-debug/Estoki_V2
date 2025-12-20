import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface RankingEntry {
  id: string;
  user_id: string;
  nome: string;
  xp_total: number;
  nivel: number;
  conquistas: number;
  posicao: number;
  posicao_anterior?: number;
}

export type PeriodoRanking = 'semanal' | 'mensal' | 'geral';

export function useRanking() {
  const { user } = useAuth();
  const [ranking, setRanking] = useState<RankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [periodo, setPeriodo] = useState<PeriodoRanking>('semanal');

  const fetchRanking = useCallback(async () => {
    setLoading(true);
    try {
      // Fetch all users gamification data with profiles
      const { data: gamificacaoData, error: gamError } = await supabase
        .from('gamificacao_usuarios')
        .select(`
          id,
          user_id,
          xp_total,
          nivel
        `)
        .order('xp_total', { ascending: false });

      if (gamError) throw gamError;

      if (!gamificacaoData?.length) {
        setRanking([]);
        return;
      }

      // Get user IDs
      const userIds = gamificacaoData.map(g => g.user_id);

      // Fetch profiles
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, nome')
        .in('id', userIds);

      // Fetch achievement counts
      const { data: conquistasData } = await supabase
        .from('conquistas_usuarios')
        .select('user_id')
        .eq('desbloqueada', true)
        .in('user_id', userIds);

      // Count achievements per user
      const conquistasPorUsuario: Record<string, number> = {};
      conquistasData?.forEach(c => {
        conquistasPorUsuario[c.user_id] = (conquistasPorUsuario[c.user_id] || 0) + 1;
      });

      // Build ranking
      const rankingData: RankingEntry[] = gamificacaoData.map((g, index) => {
        const profile = profilesData?.find(p => p.id === g.user_id);
        return {
          id: g.id,
          user_id: g.user_id,
          nome: profile?.nome || 'Usuário',
          xp_total: g.xp_total,
          nivel: g.nivel,
          conquistas: conquistasPorUsuario[g.user_id] || 0,
          posicao: index + 1,
        };
      });

      setRanking(rankingData);
    } catch (error) {
      console.error('Erro ao carregar ranking:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRanking();
  }, [fetchRanking]);

  // Get current user's position
  const minhaposicao = useMemo(() => {
    if (!user?.id) return null;
    return ranking.find(r => r.user_id === user.id);
  }, [ranking, user?.id]);

  // Get top 3
  const top3 = useMemo(() => ranking.slice(0, 3), [ranking]);

  // Get remaining ranking (positions 4+)
  const restante = useMemo(() => ranking.slice(3), [ranking]);

  return {
    ranking,
    top3,
    restante,
    loading,
    refetch: fetchRanking,
    periodo,
    setPeriodo,
    minhaposicao,
    totalParticipantes: ranking.length,
  };
}

export default useRanking;
