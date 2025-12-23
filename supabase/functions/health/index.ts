import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  const health = {
    status: "healthy",
    timestamp: new Date().toISOString(),
    version: "1.0.0",
    uptime: Deno.osUptime ? Deno.osUptime() : "unknown"
  };

  return new Response(JSON.stringify(health), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
    status: 200
  });
});
