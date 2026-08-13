import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { GenerateSkuSchema, validateInput } from "../_shared/schemas.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };
  try {
    const raw = await req.json().catch(() => ({}));
    const v = validateInput(GenerateSkuSchema, raw);
    if (!v.success) return new Response(JSON.stringify(v), { status: 400, headers });
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    return new Response(
      JSON.stringify({
        success: true,
        function: "generate-sku",
        timestamp: new Date().toISOString(),
        ...v.data,
      }),
      { headers }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers });
  }
});
