import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: getCorsHeaders(req) });
  }

  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: Deno.osUptime ? Deno.osUptime() : "unknown"
  };

  return new Response(JSON.stringify(health), {
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    status: 200
  });
});
