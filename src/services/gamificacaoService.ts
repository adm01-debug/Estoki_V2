import { supabase } from '@/integrations/supabase/client';

export const gamificacaoService = {
  async addXP(userId: string, amount: number, reason: string): Promise<boolean> {
    try {
      const { data: userData, error: userError } = await supabase
        .from('gamificacao_usuarios')
        .select('xp_total, nivel')
        .eq('user_id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        if (import.meta.env.DEV) console.error('Erro ao buscar usuário:', userError);
        return false;
      }

      const currentXP = userData?.xp_total || 0;
      const newXP = currentXP + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;

      const { error: upsertError } = await supabase
        .from('gamificacao_usuarios')
        .upsert({
          user_id: userId,
          xp_total: newXP,
          nivel: newLevel,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (upsertError) {
        if (import.meta.env.DEV) console.error('Erro ao atualizar XP:', upsertError);
        return false;
      }

      await (supabase.from as any)('xp_historico').insert({
        user_id: userId,
        xp_ganho: amount,
        motivo: reason,
      });

      return true;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erro ao adicionar XP:', error);
      return false;
    }
  },

  async checkConquistas(userId: string): Promise<string[]> {
    try {
      const { data: definicoes } = await supabase
        .from('conquistas_definicoes')
        .select('*');

      const { data: obtidas } = await supabase
        .from('conquistas_usuarios')
        .select('conquista_id')
        .eq('user_id', userId);

      const conquistasObtidas = new Set(obtidas?.map(c => c.conquista_id) || []);
      const novasConquistas: string[] = [];

      const { data: userData } = await supabase
        .from('gamificacao_usuarios')
        .select('*')
        .eq('user_id', userId)
        .single();

      for (const def of definicoes || []) {
        if (conquistasObtidas.has(def.id)) continue;

        let conquistou = false;
        const criterio = def.criterio as string;
        if (criterio === 'xp' && (userData?.xp_total ?? 0) >= (def.meta ?? 0)) {
          conquistou = true;
        } else if (criterio === 'nivel' && (userData?.nivel ?? 0) >= (def.meta ?? 0)) {
          conquistou = true;
        }

        if (conquistou) {
          await supabase.from('conquistas_usuarios').insert({
            user_id: userId,
            conquista_id: def.id,
          });
          novasConquistas.push(def.nome);
        }
      }

      return novasConquistas;
    } catch (error) {
      if (import.meta.env.DEV) console.error('Erro ao verificar conquistas:', error);
      return [];
    }
  },

  async getDesafiosDiarios(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('desafios_diarios')
      .select('*')
      .eq('data_ativo', today);

    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao buscar desafios:', error);
      return [];
    }

    const { data: progresso } = await supabase
      .from('desafios_usuarios')
      .select('*')
      .eq('user_id', userId)
      .in('desafio_id', data?.map(d => d.id) || []);

    return (data || []).map(desafio => ({
      ...desafio,
      progresso: progresso?.find(p => p.desafio_id === desafio.id),
    }));
  },

  async updateDesafioProgress(userId: string, desafioId: string, progress: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('desafios_usuarios')
        .upsert({
          user_id: userId,
          desafio_id: desafioId,
          progresso: progress,
          concluido: progress >= 100,
          updated_at: new Date().toISOString(),
        } as any, { onConflict: 'user_id,desafio_id' } as any);

      return !error;
    } catch {
      return false;
    }
  },

  async getRanking(limit = 10) {
    const { data, error } = await supabase
      .from('gamificacao_usuarios')
      .select('user_id, xp_total, nivel')
      .order('xp_total', { ascending: false })
      .limit(limit);

    if (error) {
      if (import.meta.env.DEV) console.error('Erro ao buscar ranking:', error);
      return [];
    }

    return data || [];
  },
};
