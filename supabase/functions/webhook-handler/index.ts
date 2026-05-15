import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

const jsonResponse = (body: unknown, status = 200, request?: Request) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(request), "Content-Type": "application/json" },
  });

const WebhookSchema = z.object({
  event: z.string().min(1).max(200),
  data: z.record(z.unknown()).optional().default({}),
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

    const parsed = WebhookSchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, 400, req);
    }

    const { event, data } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { error: insertError } = await supabase.from("alertas_historico").insert({
      tipo: "webhook",
      titulo: `Webhook: ${event}`,
      mensagem: `Webhook recebido: ${event}`,
      dados_contexto: data,
      severidade: "info",
    });

    if (insertError) {
      console.error("Error inserting webhook history:", insertError);
      // Continue even if logging fails, but return 202 to indicate processing issues
      return jsonResponse({ success: true, warning: "Log insertion failed", event }, 202, req);
    }

    return jsonResponse({ success: true, event, received: new Date().toISOString() }, 200, req);
  } catch (error) {
    console.error("webhook-handler error:", error);
    return jsonResponse({ error: "Internal server error" }, 500, req);
  }
});
