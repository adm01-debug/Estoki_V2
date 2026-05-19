import { supabase } from '@/integrations/supabase/client';
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logger.error("Erro ao autenticar usuário", error, { email });
      throw error;
    }
    return data;
  },

import { logger } from '@/utils/logger';

export type AppRole = "operador" | "supervisor" | "admin";

export interface Profile {
  id: string;
  nome: string | null;
  email: string | null;
}

export const authService = {
  async getProfile(userId: string): Promise<Profile | null> {
    const { data, error } = await supabase
      .from("profiles")
      .select("id, nome, email")
      .eq("id", userId)
      .maybeSingle();

    if (error) {
      logger.error("Erro ao buscar perfil do usuário", error, { userId });
      throw error;
    }
    return data;
  },

  async getRole(userId: string): Promise<AppRole | null> {
    const { data, error } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      logger.error("Erro ao buscar permissões do usuário", error, { userId });
      throw error;
    }
    return (data?.role as AppRole) || null;
  },

  async getUserData(userId: string) {
    const [profile, role] = await Promise.all([
      this.getProfile(userId),
      this.getRole(userId)
    ]);
    return { profile, role };
  }
};
