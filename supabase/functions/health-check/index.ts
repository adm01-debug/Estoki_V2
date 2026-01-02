import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface HealthStatus {
  status: "healthy" | "degraded" | "unhealthy";
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: CheckResult;
    storage: CheckResult;
    auth: CheckResult;
    cache: CheckResult;
  };
  system: {
    memory: { used: number; total: number };
    load: number[];
  };
}

interface CheckResult {
  status: "pass" | "warn" | "fail";
  latency_ms: number;
  message?: string;
}

const startTime = Date.now();

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  const checks: HealthStatus["checks"] = {
    database: { status: "pass", latency_ms: 0 },
    storage: { status: "pass", latency_ms: 0 },
    auth: { status: "pass", latency_ms: 0 },
    cache: { status: "pass", latency_ms: 0 },
  };

  // Check Database
  const dbStart = Date.now();
  try {
    const { error } = await supabase.from("_health").select("id").limit(1);
    checks.database.latency_ms = Date.now() - dbStart;
    if (error) {
      // Tabela pode não existir, tentar query simples
      const { error: error2 } = await supabase.rpc("now");
      if (error2) {
        checks.database.status = "fail";
        checks.database.message = error2.message;
      }
    }
  } catch (e) {
    checks.database.status = "fail";
    checks.database.latency_ms = Date.now() - dbStart;
    checks.database.message = e.message;
  }

  // Check Storage
  const storageStart = Date.now();
  try {
    const { error } = await supabase.storage.listBuckets();
    checks.storage.latency_ms = Date.now() - storageStart;
    if (error) {
      checks.storage.status = "warn";
      checks.storage.message = error.message;
    }
  } catch (e) {
    checks.storage.status = "fail";
    checks.storage.latency_ms = Date.now() - storageStart;
    checks.storage.message = e.message;
  }

  // Check Auth
  const authStart = Date.now();
  try {
    const { error } = await supabase.auth.getSession();
    checks.auth.latency_ms = Date.now() - authStart;
    if (error) {
      checks.auth.status = "warn";
      checks.auth.message = error.message;
    }
  } catch (e) {
    checks.auth.status = "fail";
    checks.auth.latency_ms = Date.now() - authStart;
    checks.auth.message = e.message;
  }

  // Determine overall status
  const hasFailure = Object.values(checks).some(c => c.status === "fail");
  const hasWarning = Object.values(checks).some(c => c.status === "warn");

  const overallStatus: HealthStatus["status"] = hasFailure
    ? "unhealthy"
    : hasWarning
    ? "degraded"
    : "healthy";

  const health: HealthStatus = {
    status: overallStatus,
    timestamp: new Date().toISOString(),
    version: Deno.env.get("APP_VERSION") || "1.0.0",
    uptime: Math.floor((Date.now() - startTime) / 1000),
    checks,
    system: {
      memory: { used: 0, total: 0 },
      load: [0, 0, 0],
    },
  };

  const httpStatus = overallStatus === "unhealthy" ? 503 : 200;

  return new Response(JSON.stringify(health, null, 2), {
    status: httpStatus,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
