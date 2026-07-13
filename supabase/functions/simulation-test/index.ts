import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-simulation-count",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

/**
 * Script de simulação e teste de estresse para Edge Functions e Webhooks.
 * Executa múltiplos cenários para validar consistência e resiliência.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET");

if (!WEBHOOK_SECRET) {
  console.warn("[simulation-test] WEBHOOK_SECRET not configured — endpoint disabled");
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const scenarios = [
  { event: "order.created", data: { id: "ORD-001", items: [{ sku: "SKU-123", qty: 10 }] } },
  { event: "stock.low", data: { sku: "SKU-999", current: 2, min: 5 } },
  { event: "quality.failed", data: { lot: "LOT-A1", inspector: "AI-Test" } },
  { event: "system.heartbeat", data: { status: "healthy" } },
];

async function runSimulation(count = 10) {
  console.log(`🚀 Iniciando simulação de ${count} eventos...`);
  const results = { success: 0, failure: 0, errors: [] as any[] };

  for (let i = 0; i < count; i++) {
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];

    try {
      const response = await fetch(`${SUPABASE_URL}/functions/v1/webhook-handler`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-webhook-secret": WEBHOOK_SECRET,
        },
        body: JSON.stringify(scenario),
      });

      if (response.ok) {
        results.success++;
      } else {
        results.failure++;
        const errorText = await response.text();
        results.errors.push({ i, scenario, error: errorText });
      }
    } catch (e: any) {
      results.failure++;
      results.errors.push({ i, scenario, error: e.message });
    }
  }

  return results;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
  if (!WEBHOOK_SECRET) {
    return new Response(
      JSON.stringify({ error: "WEBHOOK_SECRET is not configured on the server" }),
      { status: 503, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }

  const url = new URL(req.url);
  const countHeader = req.headers.get("X-Simulation-Count");
  const count = parseInt(countHeader || url.searchParams.get("count") || "100");

  const report = await runSimulation(count);

  // Opcional: Salvar relatório no banco de dados para rastreabilidade
  await supabase.from("alertas_historico").insert({
    tipo: "sistema" as any,
    titulo: "Simulação de Stress Webhook",
    mensagem: `Processados ${count} eventos. Sucesso: ${report.success}, Falhas: ${report.failure}`,
    severidade: report.failure > 0 ? "aviso" : "info",
    dados_contexto: report,
  });

  return new Response(
    JSON.stringify({
      message: "Simulação concluída e registrada",
      report,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    }
  );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
