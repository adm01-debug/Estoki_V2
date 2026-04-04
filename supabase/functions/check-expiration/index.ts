import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { daysThreshold = 30 } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const thresholdDate = new Date();
    thresholdDate.setDate(thresholdDate.getDate() + daysThreshold);
    const { data: expiring, error } = await supabase.from("lots").select("*, products(name, sku)").lte("expiration_date", thresholdDate.toISOString()).gt("quantity", 0).eq("status", "active").order("expiration_date");
    if (error) throw error;
    const expired = expiring?.filter(l => new Date(l.expiration_date) < new Date()) || [];
    const warning = expiring?.filter(l => new Date(l.expiration_date) >= new Date()) || [];
    return new Response(JSON.stringify({ expired: expired.length, warning: warning.length, items: { expired, warning } }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
