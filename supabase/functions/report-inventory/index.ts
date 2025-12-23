import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { startDate, endDate } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: movements } = await supabase.from("stock_movements").select("*, products(name, sku, cost)").gte("created_at", startDate).lte("created_at", endDate);
    const summary = { totalIn: 0, totalOut: 0, valueIn: 0, valueOut: 0, byProduct: {} as Record<string, any> };
    for (const m of movements || []) {
      const value = m.quantity * (m.products?.cost || 0);
      if (m.type === "IN") { summary.totalIn += m.quantity; summary.valueIn += value; }
      else { summary.totalOut += m.quantity; summary.valueOut += value; }
      if (!summary.byProduct[m.product_id]) summary.byProduct[m.product_id] = { name: m.products?.name, sku: m.products?.sku, in: 0, out: 0 };
      summary.byProduct[m.product_id][m.type === "IN" ? "in" : "out"] += m.quantity;
    }
    return new Response(JSON.stringify({ period: { startDate, endDate }, summary, movements: movements?.length || 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
