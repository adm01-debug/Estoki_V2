// @ts-nocheck
import { supabase } from '@/integrations/supabase/client';

export const gamificacaoService = {
  // Adicionar XP ao usuário
  async addXP(userId: string, amount: number, reason: string): Promise<boolean> {
    try {
      // Atualizar XP total do usuário
      const { data: userData, error: userError } = await supabase
        .from('gamificacao_usuarios')
        .select('xp_total, nivel')
        .eq('user_id', userId)
        .single();

      if (userError && userError.code !== 'PGRST116') {
        console.error('Erro ao buscar usuário:', userError);
        return false;
      }

      const currentXP = userData?.xp_total || 0;
      const newXP = currentXP + amount;
      const newLevel = Math.floor(newXP / 1000) + 1;

      // Upsert gamificacao_usuarios
      const { error: upsertError } = await supabase
        .from('gamificacao_usuarios')
        .upsert({
          user_id: userId,
          xp_total: newXP,
          nivel: newLevel,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id' });

      if (upsertError) {
        console.error('Erro ao atualizar XP:', upsertError);
        return false;
      }

      // Registrar histórico de XP
      await supabase.from('xp_historico').insert({
        user_id: userId,
        xp_ganho: amount,
        motivo: reason,
      });

      return true;
    } catch (error) {
      console.error('Erro ao adicionar XP:', error);
      return false;
    }
  },

  // Verificar e conceder conquistas
  async checkConquistas(userId: string): Promise<string[]> {
    try {
      // Buscar definições de conquistas
      const { data: definicoes } = await supabase
        .from('conquistas_definicoes')
        .select('*');

      // Buscar conquistas já obtidas
      const { data: obtidas } = await supabase
        .from('conquistas_usuarios')
        .select('conquista_id')
        .eq('user_id', userId);

      const conquistasObtidas = new Set(obtidas?.map(c => c.conquista_id) || []);
      const novasConquistas: string[] = [];

      // Buscar dados do usuário para verificação
      const { data: userData } = await supabase
        .from('gamificacao_usuarios')
        .select('*')
        .eq('user_id', userId)
        .single();

      for (const def of definicoes || []) {
        if (conquistasObtidas.has(def.id)) continue;

        // Verificar critérios (simplificado)
        let conquistou = false;
        if (def.tipo === 'xp' && userData?.xp_total >= def.valor_necessario) {
          conquistou = true;
        } else if (def.tipo === 'nivel' && userData?.nivel >= def.valor_necessario) {
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
      console.error('Erro ao verificar conquistas:', error);
      return [];
    }
  },

  // Buscar desafios diários
  async getDesafiosDiarios(userId: string) {
    const today = new Date().toISOString().split('T')[0];
    
    const { data, error } = await supabase
      .from('desafios_diarios')
      .select('*')
      .eq('data', today);

    if (error) {
      console.error('Erro ao buscar desafios:', error);
      return [];
    }

    // Buscar progresso do usuário
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

  // Atualizar progresso do desafio
  async updateDesafioProgress(userId: string, desafioId: string, progress: number): Promise<boolean> {
    try {
      const { error } = await supabase
        .from('desafios_usuarios')
        .upsert({
          user_id: userId,
          desafio_id: desafioId,
          progresso: progress,
          completado: progress >= 100,
          updated_at: new Date().toISOString(),
        }, { onConflict: 'user_id,desafio_id' });

      return !error;
    } catch {
      return false;
    }
  },

  // Buscar ranking
  async getRanking(limit = 10) {
    const { data, error } = await supabase
      .from('gamificacao_usuarios')
      .select(`
        user_id,
        xp_total,
        nivel,
        profiles (nome, avatar_url)
      `)
      .order('xp_total', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Erro ao buscar ranking:', error);
      return [];
    }

    return data || [];
  },
};
