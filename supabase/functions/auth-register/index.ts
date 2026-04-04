import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { RegisterSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
    }

    const body = await req.json();
    const validation = validateInput(RegisterSchema, body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error, details: validation.details }), { status: 400, headers });
    }

    const { email, password, nome } = validation.data;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { nome: nome || email.split("@")[0] },
    });
    if (error) throw error;

    return new Response(JSON.stringify({ user: data.user }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
  }
});
