import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Script de simulação e teste de estresse para Edge Functions e Webhooks.
 * Executa múltiplos cenários para validar consistência e resiliência.
 */

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY")!;
const WEBHOOK_SECRET = Deno.env.get("WEBHOOK_SECRET") || "test-secret";

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const scenarios = [
  { event: "order.created", data: { id: "ORD-001", items: [{ sku: "SKU-123", qty: 10 }] } },
  { event: "stock.low", data: { sku: "SKU-999", current: 2, min: 5 } },
  { event: "quality.failed", data: { lot: "LOT-A1", inspector: "AI-Test" } },
  { event: "malformed.data", data: { invalid: true }, expectedStatus: 200 }, // Should still log
];

async function runSimulation(count = 10) {
  console.log(`🚀 Iniciando simulação de ${count} eventos...`);
  const results = { success: 0, failure: 0, errors: [] };

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
    } catch (e) {
      results.failure++;
      results.errors.push({ i, scenario, error: e.message });
    }
    
    if (i % 50 === 0 && i > 0) console.log(`Processed ${i}/${count}...`);
  }

  return results;
}

Deno.serve(async (req) => {
  const url = new URL(req.url);
  const count = parseInt(url.searchParams.get("count") || "100");
  
  const report = await runSimulation(count);
  
  return new Response(JSON.stringify({
    message: "Simulação concluída",
    report,
    timestamp: new Date().toISOString()
  }), {
    headers: { "Content-Type": "application/json" }
  });
});
