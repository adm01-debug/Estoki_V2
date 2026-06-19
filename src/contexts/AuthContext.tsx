import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  ReactNode,
} from "react";
import { User, Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { logger } from "@/utils/logger";
import { authService, type AppRole, type Profile } from "@/services/authService";

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  role: AppRole | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, nome: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasRole: (requiredRole: AppRole) => boolean;
  canAccess: (allowedRoles: AppRole[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const { profile: userProfile, role: userRole } = await authService.getUserData(userId);
      if (userProfile) setProfile(userProfile);
      if (userRole) setRole(userRole);
      return { profile: userProfile, role: userRole };
    } catch (error) {
      logger.error("Erro ao sincronizar dados do usuário:", error);
      return { profile: null, role: null };
    }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1) Subscribe BEFORE calling getSession (recommended Supabase pattern).
    //    INITIAL_SESSION fires on subscribe with the current session.
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, currentSession) => {
      if (!mounted) return;

      setSession(currentSession);
      setUser(currentSession?.user ?? null);

      if (currentSession?.user) {
        // Defer Supabase calls to avoid the known deadlock when invoked
        // synchronously inside the auth state change callback.
        setTimeout(() => {
          if (mounted) {
            void fetchUserData(currentSession.user.id);
          }
        }, 0);
      } else {
        setProfile(null);
        setRole(null);
      }

      // Any auth event (including INITIAL_SESSION) means hydration is done.
      setLoading(false);
    });

    // 2) Safety net: if onAuthStateChange never fires (network failure, etc.),
    //    force loading=false after 6s so the app does not hang on a spinner.
    const safety = setTimeout(() => {
      if (mounted) {
        setLoading((prev) => {
          if (prev) logger.warn("Auth safety net triggered: forcing loading=false");
          return false;
        });
      }
    }, 6000);

    return () => {
      mounted = false;
      subscription.unsubscribe();
      clearTimeout(safety);
    };
  }, [fetchUserData]);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    return { error };
  };

  const signUp = async (email: string, password: string, nome: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/`,
        data: { nome },
      },
    });
    return { error };
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setProfile(null);
    setRole(null);
  };

  const hasRole = (requiredRole: AppRole): boolean => {
    if (!role) return false;
    const hierarchy: Record<AppRole, number> = { operador: 1, supervisor: 2, admin: 3 };
    return hierarchy[role] >= hierarchy[requiredRole];
  };

  const canAccess = (allowedRoles: AppRole[]): boolean => {
    if (!role) return false;
    return allowedRoles.includes(role);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, profile, role, loading, signIn, signUp, signOut, hasRole, canAccess }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
