import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => { setUser(session?.user ?? null); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);
  const signIn = useCallback(async (email: string, password: string) => { return supabase.auth.signInWithPassword({ email, password }); }, []);
  const signUp = useCallback(async (email: string, password: string) => { return supabase.auth.signUp({ email, password }); }, []);
  const signOut = useCallback(async () => { return supabase.auth.signOut(); }, []);
  return { user, loading, signIn, signUp, signOut, isAuthenticated: !!user };
}
