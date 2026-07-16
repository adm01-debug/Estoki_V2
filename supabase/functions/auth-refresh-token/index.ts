import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { RefreshTokenSchema, validateInput } from "../_shared/schemas.ts";
import { rateLimit, rateLimitResponse, RateLimitPresets } from "../_shared/rate-limit.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(req) });
  const rl = rateLimit(req, { key: "auth-refresh-token", ...RateLimitPresets.auth });
  if (!rl.ok) return rateLimitResponse(rl, req);
  try {
    const body = await req.json().catch(() => ({}));
    const v = validateInput(RefreshTokenSchema, body);
    if (!v.success) {
      return new Response(JSON.stringify({ error: v.error, details: v.details }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const { refresh_token } = v.data;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!
    );
    const { data, error } = await supabase.auth.refreshSession({ refresh_token });
    if (error) throw error;
    return new Response(JSON.stringify({ session: data.session }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
