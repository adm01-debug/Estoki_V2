import { supabase } from '@/integrations/supabase/client';

export async function authMiddleware(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function adminMiddleware(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  const { data: user } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', session.user.id)
    .single();
  return user?.role === 'admin';
}

export default { authMiddleware, adminMiddleware };
