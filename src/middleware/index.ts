import { supabase } from "@/integrations/supabase/client";
import { highestRole } from "@/utils/role";

export async function authMiddleware(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  return !!session;
}

export async function adminMiddleware(): Promise<boolean> {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (!session) return false;
  // Use user_roles table (not profiles) to prevent privilege escalation.
  // Um usuario pode ter role em varios tenants (WMS-9 fase 3), por isso a
  // consulta pode devolver mais de uma linha.
  const { data } = await supabase.from("user_roles").select("role").eq("user_id", session.user.id);
  return highestRole((data ?? []).map((r) => r.role)) === "admin";
}

export default { authMiddleware, adminMiddleware };
