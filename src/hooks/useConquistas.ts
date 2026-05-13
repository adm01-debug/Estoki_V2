import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Award, Trophy, Zap, Target, Clock, Star, Flame, Crown, Medal, Shield, Gem, CheckCircle, Calendar, Eye, Users, LucideIcon
} from 'lucide-react';

export type BadgeRarity = 'comum' | 'raro' | 'epico' | 'lendario';
export type BadgeCategory = 'produtividade' | 'qualidade' | 'consistencia' | 'especial' | 'sazonal';

interface ConquistaDefinicao {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  raridade: BadgeRarity;
  categoria: BadgeCategory;
  pontos: number;
  meta: number | null;
  criterio: string;
}

interface ConquistaUsuario {
  id: string;
  conquista_id: string;
  progresso: number;
  desbloqueada: boolean;
  data_desbloqueio: string | null;
}

export interface ConquistaCompleta extends ConquistaDefinicao {
  progresso: number;
  desbloqueado: boolean;
  dataDesbloqueio: Date | null;
  IconComponent: LucideIcon;
}

const iconeMap: Record<string, LucideIcon> = {
  Award, Trophy, Zap, Target, Clock, Star, Flame, Crown, Medal, Shield, Gem, CheckCircle, Calendar, Eye, Users,
  CalendarCheck: Calendar, Timer: Clock,
};

export function useConquistas() {
  const { user } = useAuth();
  const [definicoes, setDefinicoes] = useState<ConquistaDefinicao[]>([]);
  const [conquistasUsuario, setConquistasUsuario] = useState<ConquistaUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConquistas = useCallback(async () => {
    try {
      const { data: defsData, error: defsError } = await supabase
        .from('conquistas_definicoes')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: true });

      if (defsError) throw defsError;
      
      const typedDefs: ConquistaDefinicao[] = (defsData || []).map(d => ({
        ...d,
        raridade: d.raridade as BadgeRarity,
        categoria: d.categoria as BadgeCategory,
      }));
      setDefinicoes(typedDefs);

      if (user?.id) {
        const { data: userAchievements, error: userError } = await supabase
          .from('conquistas_usuarios')
          .select('*')
          .eq('user_id', user.id);

        if (userError) throw userError;
        setConquistasUsuario((userAchievements as any) || []);
      }
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erro ao carregar conquistas:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchConquistas();
  }, [fetchConquistas]);

  const conquistas = useMemo((): ConquistaCompleta[] => {
    return definicoes.map(def => {
      const userAchievement = conquistasUsuario.find(c => c.conquista_id === def.id);
      
      return {
        ...def,
        progresso: userAchievement?.progresso || 0,
        desbloqueado: userAchievement?.desbloqueada || false,
        dataDesbloqueio: userAchievement?.data_desbloqueio 
          ? new Date(userAchievement.data_desbloqueio) 
          : null,
        IconComponent: iconeMap[def.icone] || Trophy,
      };
    });
  }, [definicoes, conquistasUsuario]);

  const desbloqueados = conquistas.filter(c => c.desbloqueado);
  const pontosTotal = desbloqueados.reduce((acc, c) => acc + c.pontos, 0);
  
  return {
    conquistas,
    loading,
    refetch: fetchConquistas,
    desbloqueados,
    pontosTotal,
    totalConquistas: conquistas.length,
    percentualDesbloqueado: conquistas.length > 0 ? (desbloqueados.length / conquistas.length) * 100 : 0,
  };
}

export default useConquistas;
