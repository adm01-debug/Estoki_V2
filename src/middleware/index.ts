import { supabase } from '@/integrations/supabase/client';

export async function authMiddleware(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  return !!session;
}

export async function adminMiddleware(): Promise<boolean> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return false;
  // Use user_roles table (not profiles) to prevent privilege escalation
  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', session.user.id)
    .single();
  return data?.role === 'admin';
}

export default { authMiddleware, adminMiddleware };
