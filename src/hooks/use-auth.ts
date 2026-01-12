/**
 * Hook de Autenticação Completo
 * Gerenciamento de sessão, login, logout, permissões
 */

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User, Session, AuthError } from '@supabase/supabase-js';
import { analytics } from '@/config/analytics';
import { setUserContext } from '@/config/feature-flags';

// Tipos
export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'admin' | 'manager' | 'operator' | 'viewer';
  department?: string;
  permissions: string[];
  is_active: boolean;
  last_login?: string;
  created_at: string;
}

export interface AuthState {
  user: User | null;
  profile: UserProfile | null;
  session: Session | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: AuthError | null;
}

export interface AuthActions {
  signIn: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  signUp: (email: string, password: string, fullName: string) => Promise<{ success: boolean; error?: string }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ success: boolean; error?: string }>;
  updatePassword: (newPassword: string) => Promise<{ success: boolean; error?: string }>;
  updateProfile: (updates: Partial<UserProfile>) => Promise<{ success: boolean; error?: string }>;
  refreshSession: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasRole: (roles: string | string[]) => boolean;
}

// Permissões por role
const ROLE_PERMISSIONS: Record<string, string[]> = {
  admin: ['*'],
  manager: [
    'inventory.read', 'inventory.write',
    'receiving.read', 'receiving.write',
    'shipping.read', 'shipping.write',
    'reports.read', 'reports.export',
    'users.read',
  ],
  operator: [
    'inventory.read', 'inventory.write',
    'receiving.read', 'receiving.write',
    'shipping.read', 'shipping.write',
  ],
  viewer: [
    'inventory.read',
    'receiving.read',
    'shipping.read',
    'reports.read',
  ],
};

// Hook principal
export function useAuth(): AuthState & AuthActions {
  const [state, setState] = useState<AuthState>({
    user: null,
    profile: null,
    session: null,
    isLoading: true,
    isAuthenticated: false,
    error: null,
  });

  // Carregar perfil do usuário
  const loadProfile = useCallback(async (userId: string): Promise<UserProfile | null> => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) throw error;

      const permissions = ROLE_PERMISSIONS[data.role] || [];
      
      return {
        ...data,
        permissions,
      };
    } catch (error) {
      console.error('[Auth] Error loading profile:', error);
      return null;
    }
  }, []);

  // Inicialização
  useEffect(() => {
    let mounted = true;

    const initAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) throw error;

        if (session?.user && mounted) {
          const profile = await loadProfile(session.user.id);
          
          setState({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });

          // Configurar contexto para feature flags
          if (profile) {
            setUserContext({
              userId: profile.id,
              role: profile.role,
              email: profile.email,
            });
          }
        } else if (mounted) {
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } catch (error) {
        if (mounted) {
          setState(prev => ({ 
            ...prev, 
            isLoading: false, 
            error: error as AuthError 
          }));
        }
      }
    };

    initAuth();

    // Listener de mudanças de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (!mounted) return;

        if (event === 'SIGNED_IN' && session?.user) {
          const profile = await loadProfile(session.user.id);
          
          setState({
            user: session.user,
            profile,
            session,
            isLoading: false,
            isAuthenticated: true,
            error: null,
          });

          analytics.userLogin(session.user.id, 'email');
        } else if (event === 'SIGNED_OUT') {
          setState({
            user: null,
            profile: null,
            session: null,
            isLoading: false,
            isAuthenticated: false,
            error: null,
          });
        } else if (event === 'TOKEN_REFRESHED' && session) {
          setState(prev => ({ ...prev, session }));
        }
      }
    );

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [loadProfile]);

  // Sign In
  const signIn = useCallback(async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, isLoading: false, error: authError }));
      return { success: false, error: authError.message };
    }
  }, []);

  // Sign Up
  const signUp = useCallback(async (email: string, password: string, fullName: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName },
        },
      });

      if (error) throw error;

      // Criar perfil inicial
      if (data.user) {
        await supabase.from('profiles').insert({
          id: data.user.id,
          email,
          full_name: fullName,
          role: 'viewer',
          is_active: true,
        });
      }

      return { success: true };
    } catch (error) {
      const authError = error as AuthError;
      setState(prev => ({ ...prev, isLoading: false, error: authError }));
      return { success: false, error: authError.message };
    }
  }, []);

  // Sign Out
  const signOut = useCallback(async () => {
    const userId = state.user?.id;
    await supabase.auth.signOut();
    if (userId) analytics.userLogout(userId);
  }, [state.user?.id]);

  // Reset Password
  const resetPassword = useCallback(async (email: string) => {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as AuthError).message };
    }
  }, []);

  // Update Password
  const updatePassword = useCallback(async (newPassword: string) => {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;
      return { success: true };
    } catch (error) {
      return { success: false, error: (error as AuthError).message };
    }
  }, []);

  // Update Profile
  const updateProfile = useCallback(async (updates: Partial<UserProfile>) => {
    try {
      if (!state.user?.id) throw new Error('Not authenticated');

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', state.user.id);

      if (error) throw error;

      setState(prev => ({
        ...prev,
        profile: prev.profile ? { ...prev.profile, ...updates } : null,
      }));

      return { success: true };
    } catch (error) {
      return { success: false, error: (error as Error).message };
    }
  }, [state.user?.id]);

  // Refresh Session
  const refreshSession = useCallback(async () => {
    const { data: { session } } = await supabase.auth.refreshSession();
    if (session) {
      setState(prev => ({ ...prev, session }));
    }
  }, []);

  // Check Permission
  const hasPermission = useCallback((permission: string): boolean => {
    if (!state.profile) return false;
    if (state.profile.permissions.includes('*')) return true;
    return state.profile.permissions.includes(permission);
  }, [state.profile]);

  // Check Role
  const hasRole = useCallback((roles: string | string[]): boolean => {
    if (!state.profile) return false;
    const roleList = Array.isArray(roles) ? roles : [roles];
    return roleList.includes(state.profile.role);
  }, [state.profile]);

  return {
    ...state,
    signIn,
    signUp,
    signOut,
    resetPassword,
    updatePassword,
    updateProfile,
    refreshSession,
    hasPermission,
    hasRole,
  };
}

// Context para uso global
const AuthContext = createContext<(AuthState & AuthActions) | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const auth = useAuth();
  return <AuthContext.Provider value={auth}>{children}</AuthContext.Provider>;
};

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuthContext must be used within AuthProvider');
  return context;
};

export default useAuth;
