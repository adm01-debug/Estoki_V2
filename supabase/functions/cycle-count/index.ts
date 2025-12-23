import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { locationId, counts, userId } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const results = [];
    for (const count of counts) {
      const { data: stock } = await supabase.from("location_stock").select("quantity").eq("product_id", count.productId).eq("location_id", locationId).single();
      const systemQty = stock?.quantity || 0;
      const variance = count.counted - systemQty;
      const { data: result, error } = await supabase.from("cycle_counts").insert({ location_id: locationId, product_id: count.productId, system_quantity: systemQty, counted_quantity: count.counted, variance, user_id: userId, status: variance === 0 ? "matched" : "variance" }).select().single();
      if (error) throw error;
      results.push(result);
    }
    return new Response(JSON.stringify({ counts: results, totalVariance: results.filter(r => r.status === "variance").length }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
