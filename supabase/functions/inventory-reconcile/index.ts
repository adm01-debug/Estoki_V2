import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { cycle_count_id, adjustments, reconciled_by } = await req.json();
    if (!cycle_count_id || !adjustments?.length) return new Response(JSON.stringify({ error: "cycle_count_id and adjustments required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const results = [];
    for (const adj of adjustments) {
      const { data: currentStock } = await supabase.from("location_stock").select("*").eq("product_id", adj.product_id).eq("location_id", adj.location_id).single();
      const systemQty = currentStock?.quantity || 0;
      const variance = adj.counted_quantity - systemQty;

      if (variance !== 0) {
        await supabase.from("stock_movements").insert({
          product_id: adj.product_id, location_id: adj.location_id, movement_type: variance > 0 ? "ADJUSTMENT_IN" : "ADJUSTMENT_OUT",
          quantity: Math.abs(variance), reference_type: "cycle_count", reference_id: cycle_count_id, created_by: reconciled_by, notes: adj.notes
        });

        if (currentStock) {
          await supabase.from("location_stock").update({ quantity: adj.counted_quantity }).eq("id", currentStock.id);
        } else {
          await supabase.from("location_stock").insert({ product_id: adj.product_id, location_id: adj.location_id, quantity: adj.counted_quantity });
        }
      }
      results.push({ product_id: adj.product_id, system_qty: systemQty, counted_qty: adj.counted_quantity, variance });
    }

    await supabase.from("cycle_counts").update({ status: "reconciled", reconciled_at: new Date().toISOString(), reconciled_by }).eq("id", cycle_count_id);

    return new Response(JSON.stringify({ success: true, adjustments_made: results.filter(r => r.variance !== 0).length, results }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
