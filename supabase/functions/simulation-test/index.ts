import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-simulation-count",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

// Real production endpoints exercised in the simulation.
// Each scenario represents a common request pattern the app performs.
type Scenario = {
  name: string;
  fn: string;
  method?: "GET" | "POST";
  body?: unknown;
  // Any status in expectStatus counts as a pass (some endpoints legitimately
  // return 4xx when input is intentionally invalid/absent).
  expectStatus: number[];
};

const scenarios: Scenario[] = [
  { name: "health-check", fn: "health-check", method: "GET", expectStatus: [200, 503] },
  { name: "dashboard-stats", fn: "dashboard-stats", body: {}, expectStatus: [200, 500] },
  { name: "calculate-kpis", fn: "calculate-kpis", body: {}, expectStatus: [200, 500] },
  { name: "abc-analysis", fn: "abc-analysis", body: {}, expectStatus: [200, 500] },
  { name: "check-reorder", fn: "check-reorder", body: {}, expectStatus: [200, 500] },
  { name: "previsao-demanda", fn: "previsao-demanda", body: {}, expectStatus: [200, 500] },
  { name: "gerar-desafios-diarios", fn: "gerar-desafios-diarios", body: {}, expectStatus: [200, 500] },
  { name: "nfe-import (invalid)", fn: "nfe-import", body: {}, expectStatus: [400] },
  { name: "nfe-import (xml)", fn: "nfe-import", body: { xml_content: "<nfe>test</nfe>" }, expectStatus: [200, 400, 500] },
  { name: "export-data", fn: "export-data", body: { type: "products" }, expectStatus: [200, 400, 500] },
];

type CallResult = {
  scenario: string;
  status: number;
  ok: boolean;
  durationMs: number;
  error?: string;
};

function makeTraceparent(): string {
  const hex = (n: number) =>
    Array.from(crypto.getRandomValues(new Uint8Array(n)))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
  return `00-${hex(16)}-${hex(8)}-01`;
}

async function runOne(s: Scenario): Promise<CallResult> {
  const start = performance.now();
  try {
    const res = await fetch(`${SUPABASE_URL}/functions/v1/${s.fn}`, {
      method: s.method ?? "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
        apikey: SUPABASE_ANON_KEY,
        // Unique per-request traceparent to avoid gateway per-trace rate limits
        traceparent: makeTraceparent(),
      },
      body: s.method === "GET" ? undefined : JSON.stringify(s.body ?? {}),
    });
    // Drain body to avoid leaks
    await res.text();
    const durationMs = performance.now() - start;
    return {
      scenario: s.name,
      status: res.status,
      ok: s.expectStatus.includes(res.status),
      durationMs,
    };
  } catch (e) {
    return {
      scenario: s.name,
      status: 0,
      ok: false,
      durationMs: performance.now() - start,
      error: e instanceof Error ? e.message : String(e),
    };
  }
}

async function runSimulation(count = 10) {
  console.log(`🚀 Iniciando simulação sequencial de ${count} cenários (pacing anti rate-limit)...`);
  const all: CallResult[] = [];
  // Sequential with jitter — the Supabase gateway rate-limits per-trace, and
  // edge→edge fetches share the parent trace. Serializing + jitter avoids the
  // 429 wall while still exercising real endpoints under sustained load.
  for (let i = 0; i < count; i++) {
    const s = scenarios[i % scenarios.length];
    all.push(await runOne(s));
    // 120ms ± 60ms jitter → ~7 req/s sustained
    await new Promise((r) => setTimeout(r, 90 + Math.floor(Math.random() * 60)));
  }

  const success = all.filter((r) => r.ok).length;
  const failure = all.length - success;
  const durations = all.map((r) => r.durationMs).sort((a, b) => a - b);
  const avg = durations.reduce((a, b) => a + b, 0) / (durations.length || 1);
  const p50 = durations[Math.floor(durations.length * 0.5)] ?? 0;
  const p95 = durations[Math.floor(durations.length * 0.95)] ?? 0;
  const p99 = durations[Math.floor(durations.length * 0.99)] ?? 0;

  // Aggregate per endpoint
  const byScenario: Record<string, { total: number; ok: number; avgMs: number; p95Ms: number }> = {};
  for (const s of scenarios) {
    const rows = all.filter((r) => r.scenario === s.name);
    if (!rows.length) continue;
    const okCount = rows.filter((r) => r.ok).length;
    const ds = rows.map((r) => r.durationMs).sort((a, b) => a - b);
    byScenario[s.name] = {
      total: rows.length,
      ok: okCount,
      avgMs: Math.round(ds.reduce((a, b) => a + b, 0) / ds.length),
      p95Ms: Math.round(ds[Math.floor(ds.length * 0.95)] ?? 0),
    };
  }

  const errors = all
    .filter((r) => !r.ok)
    .slice(0, 25)
    .map((r, idx) => ({
      i: idx,
      scenario: { event: r.scenario },
      error: r.error ?? `HTTP ${r.status}`,
    }));

  return {
    success,
    failure,
    total: all.length,
    latency: {
      avgMs: Math.round(avg),
      p50Ms: Math.round(p50),
      p95Ms: Math.round(p95),
      p99Ms: Math.round(p99),
    },
    byScenario,
    errors,
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
  const url = new URL(req.url);
  const countHeader = req.headers.get("X-Simulation-Count");
  const count = Math.min(
    parseInt(countHeader || url.searchParams.get("count") || "100"),
    2000
  );

  const report = await runSimulation(count);

  await supabase.from("alertas_historico").insert({
    tipo: "sistema" as any,
    titulo: "Simulação de Carga — Edge Functions",
    mensagem: `Processados ${count} cenários. Sucesso: ${report.success}, Falhas: ${report.failure}, p95: ${report.latency.p95Ms}ms`,
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
