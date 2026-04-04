import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

const jsonResponse = (body: unknown, status = 200, request?: Request) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(request), "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return jsonResponse({ error: "Missing authorization header" }, 401);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      return jsonResponse({ error: "Não autenticado" }, 401);
    }

    const { data: roles } = await supabase
      .from("user_roles")
      .select("role, permissions")
      .eq("user_id", user.id);

    const permissions = new Set<string>();
    for (const r of roles || []) {
      for (const p of (r as any).permissions || []) {
        permissions.add(p);
      }
    }

    return jsonResponse({
      userId: user.id,
      email: user.email,
      roles: roles?.map((r) => r.role) || [],
      permissions: Array.from(permissions),
    });
  } catch (error) {
    console.error("get-permissions error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
