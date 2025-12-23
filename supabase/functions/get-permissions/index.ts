import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const authHeader = req.headers.get("Authorization")!;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, { global: { headers: { Authorization: authHeader } } });
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) throw new Error("Não autenticado");
    const { data: roles } = await supabase.from("user_roles").select("role, permissions").eq("user_id", user.id);
    const permissions = new Set<string>();
    for (const r of roles || []) { for (const p of r.permissions || []) { permissions.add(p); } }
    return new Response(JSON.stringify({ userId: user.id, email: user.email, roles: roles?.map(r => r.role) || [], permissions: Array.from(permissions) }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
