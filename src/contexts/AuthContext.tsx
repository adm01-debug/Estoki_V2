import { createContext, useContext, useEffect, useState, useRef, useCallback, ReactNode } from "react";
 import { User, Session } from "@supabase/supabase-js";
 import { supabase } from "@/integrations/supabase/client";
 import { logger } from "@/utils/logger";

type AppRole = "operador" | "supervisor" | "admin";

interface Profile {
  id: string;
  nome: string | null;
  email: string | null;
}

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
  
  // Track whether the initial session hydration is complete
  const hydrated = useRef(false);

  const fetchUserData = useCallback(async (userId: string) => {
    try {
      const [profileRes, roleRes] = await Promise.all([
        supabase.from("profiles").select("id, nome, email").eq("id", userId).maybeSingle(),
        supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
      ]);

      if (profileRes.data) setProfile(profileRes.data);
      if (roleRes.data) setRole(roleRes.data.role as AppRole);
     } catch (error) {
       logger.error("Error fetching user data:", error);
     }
  }, []);

  useEffect(() => {
    let mounted = true;

    // 1) Listen to auth changes — but only finish loading after hydration
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, currentSession) => {
        if (!mounted) return;

        setSession(currentSession);
        setUser(currentSession?.user ?? null);

        if (currentSession?.user) {
          setTimeout(() => {
            if (mounted) fetchUserData(currentSession.user.id);
          }, 0);
        } else {
          setProfile(null);
          setRole(null);
        }

        // Only set loading=false from the listener AFTER initial hydration is done
        // This prevents INITIAL_SESSION with null from prematurely ending loading
        if (hydrated.current) {
          setLoading(false);
        }
      }
    );

    // 2) Hydrate: get the persisted session
    const hydrate = async () => {
      try {
        const { data } = await Promise.race([
          supabase.auth.getSession(),
          new Promise<never>((_, reject) =>
            setTimeout(() => reject(new Error("getSession timeout")), 3000)
          ),
        ]);

        if (!mounted) return;

        const sess = data?.session ?? null;
        setSession(sess);
        setUser(sess?.user ?? null);

        if (sess?.user) {
          await fetchUserData(sess.user.id);
        }
       } catch (err) {
         logger.warn("Auth hydration failed or timed out:", { error: err });
       } finally {
        if (mounted) {
          hydrated.current = true;
          setLoading(false);
        }
      }
    };

    hydrate();

    // 3) Safety net — never stay loading for more than 4 seconds
    const safety = setTimeout(() => {
      if (mounted) {
        hydrated.current = true;
        setLoading(false);
      }
    }, 4000);

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
