import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

interface GamificacaoUsuario {
  id: string;
  user_id: string;
  xp_total: number;
  nivel: number;
  xp_proximo_nivel: number;
}

interface XpHistorico {
  id: string;
  quantidade: number;
  tipo: string;
  descricao: string;
  created_at: string;
}

export function useGamificacao() {
  const { user } = useAuth();
  const [dados, setDados] = useState<GamificacaoUsuario | null>(null);
  const [historico, setHistorico] = useState<XpHistorico[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchDados = useCallback(async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      // Get or create gamification record
      let { data, error } = await supabase
        .from('gamificacao_usuarios')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) throw error;

      if (!data) {
        // Create new record
        const { data: newData, error: insertError } = await supabase
          .from('gamificacao_usuarios')
          .insert({ user_id: user.id })
          .select()
          .single();

        if (insertError) throw insertError;
        data = newData;
      }

      setDados(data);

      // Fetch XP history
      const { data: historicoData } = await supabase
        .from('xp_historico')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(50);

      setHistorico(historicoData || []);
    } catch (error) {
      console.error('Erro ao carregar gamificação:', error);
    } finally {
      setLoading(false);
    }
  }, [user?.id]);

  useEffect(() => {
    fetchDados();
  }, [fetchDados]);

  const adicionarXp = useCallback(async (
    quantidade: number,
    tipo: string,
    descricao: string,
    referenciaId?: string
  ) => {
    if (!user?.id) return null;

    try {
      // Call the database function
      const { data, error } = await supabase.rpc('adicionar_xp', {
        p_user_id: user.id,
        p_quantidade: quantidade,
        p_tipo: tipo,
        p_descricao: descricao,
        p_referencia_id: referenciaId || null
      });

      if (error) throw error;

      // Refresh data
      await fetchDados();

      // Show toast
      toast.success(`+${quantidade} XP!`, {
        description: descricao
      });

      return data;
    } catch (error) {
      console.error('Erro ao adicionar XP:', error);
      return null;
    }
  }, [user?.id, fetchDados]);

  return {
    dados,
    historico,
    loading,
    adicionarXp,
    refetch: fetchDados,
    xpTotal: dados?.xp_total || 0,
    nivel: dados?.nivel || 1,
    xpProximoNivel: dados?.xp_proximo_nivel || 100,
    progressoNivel: dados ? (dados.xp_total / dados.xp_proximo_nivel) * 100 : 0
  };
}

export default useGamificacao;
