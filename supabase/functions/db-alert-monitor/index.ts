/**
 * POST|GET /db-alert-monitor — Alerta automatizado de saúde do Postgres (P2 #27).
 *
 * Mede WAL, taxa de rollbacks e deadlocks via RPC `check_db_alert_thresholds`
 * (SECURITY DEFINER) e grava alertas em `alertas_historico` com dedupe de 6h.
 *
 * Auth: `Authorization: Bearer <METRICS_TOKEN>` (scheduler externo) OU JWT admin.
 * Nunca público — expõe forma operacional do banco.
 */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { withLogging, type Logger } from "../_shared/logger.ts";
import { getCorsHeaders } from "../_shared/cors.ts";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
const SUPABASE_ANON_KEY =
  Deno.env.get("SUPABASE_ANON_KEY") ?? Deno.env.get("SUPABASE_PUBLISHABLE_KEY") ?? "";
const METRICS_TOKEN = Deno.env.get("METRICS_TOKEN") ?? "";

const admin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/** Limites configuráveis pelo chamador; defaults = contrato do item P2 #27. */
export const DbAlertMonitorSchema = z.object({
  walLimitMb: z.number().int().min(64).max(102400).default(500),
  rollbackRatio: z.number().min(0.001).max(1).default(0.05),
});

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

  const userClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false },
  });
  const { data, error } = await userClient.auth.getUser();
  if (error || !data?.user) return false;
  const { data: roles } = await admin.from("user_roles").select("role").eq("user_id", data.user.id);
  return (roles ?? []).some((r: { role: string }) => r.role === "admin");
}

const handler = async (req: Request, log: Logger): Promise<Response> => {
  const cors = getCorsHeaders(req);
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const headers = { ...cors, "Content-Type": "application/json" };

  if (!(await authorize(req))) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers });
  }

  const raw = req.method === "POST" ? await req.json().catch(() => ({})) : {};
  const parsed = DbAlertMonitorSchema.safeParse(raw ?? {});
  if (!parsed.success) {
    return new Response(
      JSON.stringify({ error: "invalid_input", details: parsed.error.flatten().fieldErrors }),
      { status: 400, headers },
    );
  }

  const { walLimitMb, rollbackRatio } = parsed.data;
  const { data, error } = await admin.rpc("check_db_alert_thresholds", {
    p_wal_limit_mb: walLimitMb,
    p_rollback_ratio: rollbackRatio,
  });

  if (error) {
    log.error("db_alert.rpc_failed", { error: error.message });
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }

  const result = data as Record<string, unknown>;
  const created = (result?.alerts_created as string[]) ?? [];
  log[created.length ? "warn" : "info"]("db_alert.checked", {
    wal_mb: result?.wal_mb,
    rollback_ratio: result?.rollback_ratio,
    delta_deadlocks: result?.delta_deadlocks,
    alerts_created: created,
  });

  return new Response(JSON.stringify(result), { headers });
};

Deno.serve(withLogging("db-alert-monitor", handler));
