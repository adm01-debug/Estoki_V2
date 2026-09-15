import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { CarrierWebhookSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? "",
      { global: { headers: { Authorization: req.headers.get("Authorization")! } } }
    );

    const {
      data: { user },
    } = await supabaseClient.auth.getUser();
    if (!user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }

    const raw = await req.json().catch(() => null);
    const validation = validateInput(CarrierWebhookSchema, raw);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error, details: validation.details }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }
    const result = {
      success: true,
      function: "carrier-webhooks",
      data: validation.data,
      timestamp: new Date().toISOString(),
    };

    return new Response(JSON.stringify(result), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
