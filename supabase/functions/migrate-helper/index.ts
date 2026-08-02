// Edge function temporária para migração de banco.
// Após a migração, remova esta função.
// Segurança: nunca expõe SERVICE_ROLE_KEY nem DB_URL.

const ACCESS_KEY = Deno.env.get("MIGRATE_HELPER_KEY") ?? "";
const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, apikey, content-type, x-access-key",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: cors });
  const key = req.headers.get("x-access-key");
  if (!ACCESS_KEY || key !== ACCESS_KEY) {
    return new Response(JSON.stringify({ error: "unauthorized" }), { status: 401, headers: { ...cors, "Content-Type": "application/json" } });
  }

  const url = new URL(req.url);
  const action = url.searchParams.get("action") || "ping";

  try {
    if (action === "ping") {
      return new Response(JSON.stringify({ ok: true, ts: new Date().toISOString() }), { headers: { ...cors, "Content-Type": "application/json" } });
    }
    if (action === "status") {
      return new Response(JSON.stringify({
        ok: true,
        has_url: Boolean(Deno.env.get("SUPABASE_URL")),
        has_service_role: Boolean(Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")),
        has_db_url: Boolean(Deno.env.get("SUPABASE_DB_URL")),
      }), { headers: { ...cors, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ error: "unknown_action" }), { status: 400, headers: { ...cors, "Content-Type": "application/json" } });
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e) }), { status: 500, headers: { ...cors, "Content-Type": "application/json" } });
  }
});