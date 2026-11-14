import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";

export type AppRole = "operador" | "supervisor" | "admin";

export interface Profile {
  id: string;
  nome: string | null;
  email: string | null;
  avatar_url?: string | null;
  departamento?: string | null;
}

export const authService = {
  async signIn(email: string, password: string) {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      logger.error("Erro ao autenticar usuário", error, { email });
      throw error;
    }
    return data;
  },

  async getProfile(userId: string): Promise<Profile | null> {
    if (!userId) return null;
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, nome, email, avatar_url, departamento")
        .eq("id", userId)
        .maybeSingle();

      if (error) {
        logger.error("Erro ao buscar perfil do usuário", error, { userId });
        return null;
      }
      return data;
    } catch (e) {
      logger.error("Exceção ao buscar perfil", e);
      return null;
    }
  },

  async getRole(userId: string): Promise<AppRole | null> {
    if (!userId) return null;
    try {
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
    } catch (e) {
      logger.error("Exceção ao buscar role", e);
      return null;
    }
  },

  async getUserData(userId: string) {
    const [profile, role] = await Promise.all([this.getProfile(userId), this.getRole(userId)]);
    return { profile, role };
  },

  async updateProfile(
    userId: string,
    updates: Partial<Pick<Profile, "nome" | "avatar_url" | "departamento">>
  ): Promise<Profile | null> {
    if (!userId) return null;
    const { data, error } = await supabase
      .from("profiles")
      .update(updates)
      .eq("id", userId)
      .select("id, nome, email, avatar_url, departamento")
      .maybeSingle();

    if (error) {
      logger.error("Erro ao atualizar perfil", error, { userId, updates });
      throw error;
    }
    return data;
  },
};
