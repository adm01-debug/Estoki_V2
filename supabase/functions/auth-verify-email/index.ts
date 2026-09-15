import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { VerifyEmailSchema, validateInput } from "../_shared/schemas.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(req) });
  try {
    const body = await req.json().catch(() => ({}));
    const v = validateInput(VerifyEmailSchema, body);
    if (!v.success) {
      return new Response(JSON.stringify({ error: v.error, details: v.details }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const { token } = v.data;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const { data, error } = await supabase.auth.verifyOtp({ token_hash: token, type: "email" });
    if (error) throw error;
    return new Response(JSON.stringify({ verified: true, user: data.user }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
