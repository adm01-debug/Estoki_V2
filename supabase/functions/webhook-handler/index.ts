import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-webhook-secret",
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });

const WebhookSchema = z.object({
  event: z.string().min(1).max(200),
  data: z.record(z.unknown()).optional().default({}),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    // Validate webhook secret
    const webhookSecret = Deno.env.get("WEBHOOK_SECRET");
    const providedSecret = req.headers.get("x-webhook-secret");

    if (webhookSecret && providedSecret !== webhookSecret) {
      return jsonResponse({ error: "Unauthorized" }, 401);
    }

    const parsed = WebhookSchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, 400);
    }

    const { event, data } = parsed.data;

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    await supabase.from("alertas_historico").insert({
      tipo: "webhook",
      titulo: `Webhook: ${event}`,
      mensagem: `Webhook recebido: ${event}`,
      dados_contexto: data,
      severidade: "info",
    });

    return jsonResponse({ success: true, event, received: new Date().toISOString() });
  } catch (error) {
    console.error("webhook-handler error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
