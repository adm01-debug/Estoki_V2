import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY =
  Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

type TelemetryRow = {
  operation: string | null;
  table_name: string | null;
  rpc_name: string | null;
  duration_ms: number | null;
  severity: string | null;
  error_message: string | null;
  created_at: string;
};

function pct(sorted: number[], q: number) {
  if (!sorted.length) return 0;
  return Math.round(sorted[Math.floor(sorted.length * q)] ?? 0);
}

async function requireAdmin(req: Request): Promise<{ ok: boolean; userId?: string; error?: string }> {
  const authHeader = req.headers.get("Authorization") ?? "";
  const token = authHeader.replace(/^Bearer\s+/i, "");
  if (!token) return { ok: false, error: "Missing bearer token" };

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  });
  const { data: userData, error: userErr } = await userClient.auth.getUser();
  if (userErr || !userData?.user) return { ok: false, error: "Invalid session" };

  const { data: roleData } = await admin
    .from("user_roles")
    .select("role")
    .eq("user_id", userData.user.id);
  const isAdmin = (roleData ?? []).some((r: { role: string }) => r.role === "admin");
  if (!isAdmin) return { ok: false, error: "Admin required" };
  return { ok: true, userId: userData.user.id };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const auth = await requireAdmin(req);
  if (!auth.ok) {
    return new Response(JSON.stringify({ error: auth.error }), {
      status: 403,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

    // 1. DB / connection / slow-query health (RPC restricted to service_role)
    const { data: dbHealth, error: dbErr } = await admin.rpc("get_backend_health");
    if (dbErr) throw dbErr;

    // 2. Query telemetry aggregated over the last 24h
    const { data: telemetry } = await admin
      .from("query_telemetry")
      .select("operation,table_name,rpc_name,duration_ms,severity,error_message,created_at")
      .gte("created_at", since)
      .order("created_at", { ascending: false })
      .limit(5000);

    const rows = (telemetry ?? []) as TelemetryRow[];
    const durations = rows
      .map((r) => r.duration_ms ?? 0)
      .filter((d) => d > 0)
      .sort((a, b) => a - b);
    const avg =
      durations.length > 0
        ? Math.round(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0;
    const errorRows = rows.filter(
      (r) => r.severity === "error" || r.severity === "critical" || !!r.error_message
    );

    const perOperation: Record<
      string,
      { count: number; errors: number; avgMs: number; p95Ms: number; durations: number[] }
    > = {};
    for (const r of rows) {
      const key = r.rpc_name || r.table_name || r.operation || "unknown";
      const bucket = (perOperation[key] ??= {
        count: 0,
        errors: 0,
        avgMs: 0,
        p95Ms: 0,
        durations: [],
      });
      bucket.count += 1;
      if (r.severity === "error" || r.severity === "critical" || r.error_message) bucket.errors += 1;
      if ((r.duration_ms ?? 0) > 0) bucket.durations.push(r.duration_ms ?? 0);
    }
    const topOperations = Object.entries(perOperation)
      .map(([name, s]) => {
        s.durations.sort((a, b) => a - b);
        return {
          name,
          count: s.count,
          errors: s.errors,
          avgMs: s.durations.length
            ? Math.round(s.durations.reduce((a, b) => a + b, 0) / s.durations.length)
            : 0,
          p95Ms: pct(s.durations, 0.95),
        };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, 15);

    // 3. Audit activity — count by action last 24h
    const { data: auditRows } = await admin
      .from("audit_log")
      .select("action")
      .gte("created_at", since)
      .limit(5000);
    const auditByAction: Record<string, number> = {};
    for (const a of (auditRows ?? []) as Array<{ action: string }>) {
      auditByAction[a.action] = (auditByAction[a.action] ?? 0) + 1;
    }

    // 4. Alertas históricos por severidade nas últimas 24h
    const { data: alertRows } = await admin
      .from("alertas_historico")
      .select("severidade")
      .gte("created_at", since)
      .limit(5000);
    const alertsBySeverity: Record<string, number> = {};
    for (const a of (alertRows ?? []) as Array<{ severidade: string | null }>) {
      const k = a.severidade ?? "desconhecido";
      alertsBySeverity[k] = (alertsBySeverity[k] ?? 0) + 1;
    }

    // 5. Recent errors (top 20 most recent from telemetry + alerts)
    const recentErrors = errorRows.slice(0, 20).map((r) => ({
      when: r.created_at,
      source: r.rpc_name ? "rpc" : "query",
      target: r.rpc_name || r.table_name || r.operation,
      severity: r.severity,
      message: r.error_message ?? "(sem mensagem)",
    }));

    return new Response(
      JSON.stringify({
        generated_at: new Date().toISOString(),
        window_hours: 24,
        db: dbHealth,
        queries: {
          total: rows.length,
          errors: errorRows.length,
          errorRatePct: rows.length
            ? Math.round((errorRows.length / rows.length) * 10000) / 100
            : 0,
          latency: {
            avgMs: avg,
            p50Ms: pct(durations, 0.5),
            p95Ms: pct(durations, 0.95),
            p99Ms: pct(durations, 0.99),
          },
          topOperations,
        },
        audit: {
          total_events: (auditRows ?? []).length,
          by_action: auditByAction,
        },
        alerts: {
          total: (alertRows ?? []).length,
          by_severity: alertsBySeverity,
        },
        recentErrors,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : String(e) }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});