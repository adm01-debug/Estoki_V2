import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { getCorsHeaders } from "../_shared/cors.ts";
import { WebhookEventSchema, validateInput } from "../_shared/schemas.ts";

const jsonResponse = (body: unknown, status = 200, request?: Request) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(request), "Content-Type": "application/json" },
  });

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, req);

  try {
    // Check body size (max 1MB)
    const contentLength = req.headers.get("content-length");
    if (contentLength && parseInt(contentLength) > 1024 * 1024) {
      return jsonResponse({ error: "Payload too large" }, 413, req);
    }

    // Validate webhook secret
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-webhook-secret");

    if (webhookSecret && providedSecret !== webhookSecret) {
      return jsonResponse({ error: "Unauthorized" }, 401, req);
    }

    const body = await req.json();
    const validation = validateInput(WebhookEventSchema, body);

    if (!validation.success) {
      return jsonResponse({ error: validation.error, details: validation.details }, 400, req);
    }

    const { event, data } = validation.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Using service role to ensure system logging works even without session
    const { error: insertError } = await supabase.from("alertas_historico").insert({
      tipo: "webhook" as any,
      titulo: `Webhook: ${event}`,
      mensagem: `Evento externo processado: ${event}`,
      dados_contexto: data,
      severidade: "info",
    });

    if (insertError) {
      console.error("Error inserting webhook history:", insertError);
      return jsonResponse(
        { success: false, error: "Logging failed", details: insertError.message },
        500,
        req
      );
    }

    return jsonResponse({ success: true, event, received: new Date().toISOString() }, 200, req);
  } catch (error) {
    console.error("webhook-handler error:", error);
    return jsonResponse({ error: "Internal server error" }, 500, req);
  }
});
