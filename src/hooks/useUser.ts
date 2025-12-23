import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
export function useUser() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => { setUser(user); setLoading(false); });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => { setUser(session?.user ?? null); });
    return () => subscription.unsubscribe();
  }, []);
  return { user, loading };
}
