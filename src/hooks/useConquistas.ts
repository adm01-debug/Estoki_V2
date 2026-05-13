import { useState, useEffect, useCallback, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
  Award,
  Trophy,
  Zap,
  Target,
  Clock,
  Star,
  Flame,
  Crown,
  Medal,
  Shield,
  Gem,
  CheckCircle,
  Calendar,
  Eye,
  Users,
  LucideIcon
} from 'lucide-react';

export type BadgeRarity = 'comum' | 'raro' | 'epico' | 'lendario';
export type BadgeCategory = 'produtividade' | 'qualidade' | 'consistencia' | 'especial' | 'sazonal';

interface ConquistaDefinicaoDB {
  id: string;
  codigo: string;
  nome: string;
  descricao: string;
  icone: string;
  raridade: string;
  categoria: string;
  pontos: number;
  meta: number | null;
  criterio: string;
}

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
  Award,
  Trophy,
  Zap,
  Target,
  Clock,
  Star,
  Flame,
  Crown,
  Medal,
  Shield,
  Gem,
  CheckCircle,
  Calendar,
  Eye,
  Users,
  CalendarCheck: Calendar,
  Timer: Clock,
};

export const raridadeConfig: Record<BadgeRarity, { label: string; cor: string; bg: string; border: string }> = {
  comum: { label: 'Comum', cor: 'text-muted-foreground', bg: 'bg-muted', border: 'border-muted-foreground/30' },
  raro: { label: 'Raro', cor: 'text-blue-500', bg: 'bg-blue-500/10', border: 'border-blue-500/30' },
  epico: { label: 'Épico', cor: 'text-purple-500', bg: 'bg-purple-500/10', border: 'border-purple-500/30' },
  lendario: { label: 'Lendário', cor: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' },
};

export const categoriaConfig: Record<BadgeCategory, { label: string; icone: LucideIcon }> = {
  produtividade: { label: 'Produtividade', icone: Zap },
  qualidade: { label: 'Qualidade', icone: Target },
  consistencia: { label: 'Consistência', icone: Flame },
  especial: { label: 'Especial', icone: Star },
  sazonal: { label: 'Sazonais', icone: Calendar },
};

export function useConquistas() {
  const { user } = useAuth();
  const [definicoes, setDefinicoes] = useState<ConquistaDefinicao[]>([]);
  const [conquistasUsuario, setConquistasUsuario] = useState<ConquistaUsuario[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchConquistas = useCallback(async () => {
    try {
      // Fetch all achievement definitions
      const { data: defsData, error: defsError } = await supabase
        .from('conquistas_definicoes')
        .select('*')
        .eq('ativo', true)
        .order('categoria', { ascending: true });

      if (defsError) throw defsError;
      
      // Cast to proper types
      const typedDefs: ConquistaDefinicao[] = (defsData || []).map(d => ({
        ...d,
        raridade: d.raridade as BadgeRarity,
        categoria: d.categoria as BadgeCategory,
      }));
      setDefinicoes(typedDefs);

      if (user?.id) {
        // Fetch user's achievements
        const { data: userAchievements, error: userError } = await supabase
          .from('conquistas_usuarios')
          .select('*')
          .eq('user_id', user.id);

        if (userError) throw userError;
        setConquistasUsuario(userAchievements || []);
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
        desbloqueado: userAchievement?.desbloqueado || false,
        dataDesbloqueio: userAchievement?.data_desbloqueio 
          ? new Date(userAchievement.data_desbloqueio) 
          : null,
        IconComponent: iconeMap[def.icone] || Trophy,
      };
    });
  }, [definicoes, conquistasUsuario]);

  const atualizarProgresso = useCallback(async () => {
    toast.info('O progresso das conquistas é atualizado automaticamente pelo sistema.');
    await fetchConquistas();
  }, [fetchConquistas]);

  const desbloquearConquista = useCallback(async () => {
    toast.info('As conquistas são liberadas automaticamente conforme suas ações no sistema.');
    await fetchConquistas();
  }, [fetchConquistas]);

  // Calculated values
  const desbloqueados = conquistas.filter(c => c.desbloqueado);
  const pontosTotal = desbloqueados.reduce((acc, c) => acc + c.pontos, 0);
  
  const conquistasPorCategoria = useMemo(() => {
    const grouped: Record<BadgeCategory, ConquistaCompleta[]> = {
      produtividade: [],
      qualidade: [],
      consistencia: [],
      especial: [],
      sazonal: [],
    };
    
    conquistas.forEach(c => {
      if (grouped[c.categoria]) {
        grouped[c.categoria].push(c);
      }
    });
    
    return grouped;
  }, [conquistas]);

  return {
    conquistas,
    conquistasPorCategoria,
    loading,
    refetch: fetchConquistas,
    atualizarProgresso,
    desbloquearConquista,
    desbloqueados,
    pontosTotal,
    totalConquistas: conquistas.length,
    percentualDesbloqueado: conquistas.length > 0 
      ? (desbloqueados.length / conquistas.length) * 100 
      : 0,
  };
}

export default useConquistas;
