/**
 * GET /metrics — Prometheus scrape endpoint (P2 #26).
 *
 * Auth: `Authorization: Bearer <METRICS_TOKEN>` (preferred for Prometheus /
 * Grafana Agent scrapes) OR an admin user JWT. Never public: telemetry leaks
 * operational shape of the system.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { PROM_CONTENT_TYPE, PrometheusRegistry } from "../_shared/prometheus.ts";
import { withLogging, type Logger } from "../_shared/logger.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY =
  Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
const METRICS_TOKEN = Deno.env.get("METRICS_TOKEN") ?? "";

// One client per isolate (see _shared/bulk.ts rationale).
const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

/** Constant-time-ish comparison to avoid trivial token oracle. */
function safeEqual(a: string, b: string): boolean {
  if (!a || !b || a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

async function authorize(req: Request): Promise<boolean> {
  const token = (req.headers.get("Authorization") ?? "").replace(/^Bearer\s+/i, "").trim();
  if (!token) return false;
  if (METRICS_TOKEN && safeEqual(token, METRICS_TOKEN)) return true;

  // Fallback: admin JWT (lets the in-app dashboard reuse the same endpoint).
  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) return false;
  const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", data.user.id);
  return (roles ?? []).some((r: { role: string }) => r.role === "admin");
}

function quantile(sorted: number[], q: number): number {
  if (!sorted.length) return 0;
  return Math.round(sorted[Math.min(sorted.length - 1, Math.floor(sorted.length * q))] ?? 0);
}

type TelemetryRow = {
  operation: string | null;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number | null;
  severity: string | null;
  error_message: string | null;
};

async function buildMetrics(log: Logger): Promise<string> {
  const reg = new PrometheusRegistry();
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const scrapeStart = performance.now();

  // --- Query telemetry (last 24h) ---
  const { data: telemetry, error: telErr } = await admin
    .from("query_telemetry")
    .select("operation,table_name,rpc_name,duration_ms,severity,error_message")
    .gte("created_at", since)
    .limit(5000);
  if (telErr) log.warn("metrics.telemetry_failed", { error: telErr.message });

  const rows = (telemetry ?? []) as TelemetryRow[];
  const durations = rows.map((r) => r.duration_ms ?? 0).filter((d) => d > 0).sort((a, b) => a - b);
  const isError = (r: TelemetryRow) =>
    r.severity === "error" || r.severity === "critical" || !!r.error_message;
  const errors = rows.filter(isError).length;

  reg.add("estoki_queries_total", rows.length, {
    help: "Total de queries registradas na telemetria (janela 24h)",
    type: "gauge",
  });
  reg.add("estoki_query_errors_total", errors, {
    help: "Queries com erro na janela de 24h",
    type: "gauge",
  });
  for (const q of [0.5, 0.95, 0.99] as const) {
    reg.add("estoki_query_duration_ms", quantile(durations, q), {
      help: "Latência de query por quantil, em milissegundos (janela 24h)",
      type: "gauge",
      labels: { quantile: String(q) },
    });
  }

  // Per-operation breakdown (cardinality capped em 20 séries).
  const perOp = new Map<string, { count: number; errors: number }>();
  for (const r of rows) {
    const key = r.rpc_name || r.table_name || r.operation || "unknown";
    const b = perOp.get(key) ?? { count: 0, errors: 0 };
    b.count += 1;
    if (isError(r)) b.errors += 1;
    perOp.set(key, b);
  }
  const topOps = [...perOp.entries()].sort((a, b) => b[1].count - a[1].count).slice(0, 20);
  for (const [name, b] of topOps) {
    reg.add("estoki_operation_requests_total", b.count, {
      help: "Chamadas por operação (top 20, janela 24h)",
      type: "gauge",
      labels: { operation: name },
    });
    reg.add("estoki_operation_errors_total", b.errors, {
      help: "Erros por operação (top 20, janela 24h)",
      type: "gauge",
      labels: { operation: name },
    });
  }

  // --- Saúde do Postgres ---
  const { data: dbHealth, error: dbErr } = await admin.rpc("get_backend_health");
  if (dbErr) {
    log.warn("metrics.db_health_failed", { error: dbErr.message });
  } else if (dbHealth && typeof dbHealth === "object") {
    const h = dbHealth as Record<string, unknown>;
    const numeric = (v: unknown) => (typeof v === "number" ? v : Number(v ?? 0));
    const map: Array<[string, unknown, string]> = [
      ["estoki_db_connections_active", h.active_connections ?? h.connections_active, "Conexões ativas no Postgres"],
      ["estoki_db_connections_total", h.total_connections ?? h.connections_total, "Conexões totais no Postgres"],
      ["estoki_db_cache_hit_ratio", h.cache_hit_ratio, "Cache hit ratio do buffer pool (0-1)"],
      ["estoki_db_locks_waiting", h.waiting_locks ?? h.locks_waiting, "Locks em espera"],
      ["estoki_db_slow_queries", h.slow_queries_count ?? h.slow_queries, "Queries lentas detectadas"],
      ["estoki_db_size_bytes", h.database_size_bytes ?? h.db_size_bytes, "Tamanho do banco em bytes"],
    ];
    for (const [name, value, help] of map) {
      if (value === undefined || value === null) continue;
      reg.add(name, numeric(value), { help, type: "gauge" });
    }
  }

  // --- Alertas por severidade (24h) ---
  const { data: alertRows } = await admin
    .from("alertas_historico")
    .select("severidade")
    .gte("created_at", since)
    .limit(5000);
  const bySeverity = new Map<string, number>();
  for (const a of (alertRows ?? []) as Array<{ severidade: string | null }>) {
    const k = a.severidade ?? "desconhecido";
    bySeverity.set(k, (bySeverity.get(k) ?? 0) + 1);
  }
  for (const [severity, count] of bySeverity) {
    reg.add("estoki_alerts_total", count, {
      help: "Alertas gerados por severidade (janela 24h)",
      type: "gauge",
      labels: { severity },
    });
  }

  // --- Auditoria (24h) ---
  const { count: auditCount } = await admin
    .from("audit_log")
    .select("id", { count: "exact", head: true })
    .gte("created_at", since);
  reg.add("estoki_audit_events_total", auditCount ?? 0, {
    help: "Eventos de auditoria registrados (janela 24h)",
    type: "gauge",
  });

  reg.add("estoki_metrics_scrape_duration_ms", Math.round(performance.now() - scrapeStart), {
    help: "Tempo de coleta deste scrape em milissegundos",
    type: "gauge",
  });
  reg.add("estoki_metrics_up", 1, { help: "1 quando o endpoint respondeu com sucesso", type: "gauge" });

  return reg.render();
}

const handler = async (req: Request, log: Logger): Promise<Response> => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (req.method !== "GET" && req.method !== "POST") {
    return new Response("method not allowed", { status: 405, headers: corsHeaders });
  }

  if (!(await authorize(req))) {
    log.warn("metrics.unauthorized");
    return new Response("unauthorized", { status: 401, headers: corsHeaders });
  }

  try {
    const body = await buildMetrics(log);
    return new Response(body, {
      headers: { ...corsHeaders, "Content-Type": PROM_CONTENT_TYPE, "Cache-Control": "no-store" },
    });
  } catch (e) {
    log.error("metrics.failed", { error: e instanceof Error ? e.message : String(e) });
    return new Response("estoki_metrics_up 0\n", {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": PROM_CONTENT_TYPE },
    });
  }
};

Deno.serve(withLogging("metrics", handler));
