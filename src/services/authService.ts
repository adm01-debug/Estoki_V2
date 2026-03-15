// @ts-nocheck
import { supabase } from '@/lib/supabase';
export const authService = {
  async signIn(email: string, password: string) { const { data, error } = await supabase.auth.signInWithPassword({ email, password }); if (error) throw error; return data; },
  async signUp(email: string, password: string, metadata?: Record<string, any>) { const { data, error } = await supabase.auth.signUp({ email, password, options: { data: metadata } }); if (error) throw error; return data; },
  async signOut() { const { error } = await supabase.auth.signOut(); if (error) throw error; },
  async resetPassword(email: string) { const { error } = await supabase.auth.resetPasswordForEmail(email); if (error) throw error; },
  async updatePassword(newPassword: string) { const { error } = await supabase.auth.updateUser({ password: newPassword }); if (error) throw error; },
  async getUser() { const { data: { user } } = await supabase.auth.getUser(); return user; },
  async getSession() { const { data: { session } } = await supabase.auth.getSession(); return session; },
  onAuthStateChange(callback: (event: string, session: any) => void) { return supabase.auth.onAuthStateChange(callback); }
};
