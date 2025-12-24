import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { warehouse_id, valuation_method = "average", as_of_date } = await req.json();

    let query = supabase.from("location_stock").select("*, product:products(*), location:locations(*)");
    if (warehouse_id) query = query.eq("location.warehouse_id", warehouse_id);
    const { data: stocks } = await query;

    const valuations = stocks?.map(s => {
      let unitCost = s.product?.cost || 0;
      if (valuation_method === "fifo") unitCost = s.product?.fifo_cost || unitCost;
      else if (valuation_method === "lifo") unitCost = s.product?.lifo_cost || unitCost;
      return {
        product_id: s.product_id, product_name: s.product?.name, sku: s.product?.sku,
        location_id: s.location_id, location_code: s.location?.code,
        quantity: s.quantity, unit_cost: unitCost, total_value: s.quantity * unitCost, valuation_method
      };
    }) || [];

    const summary = {
      total_items: valuations.length, total_quantity: valuations.reduce((sum, v) => sum + v.quantity, 0),
      total_value: valuations.reduce((sum, v) => sum + v.total_value, 0), valuation_method, as_of_date: as_of_date || new Date().toISOString()
    };

    await supabase.from("inventory_valuations").insert({ ...summary, warehouse_id, items: valuations });

    return new Response(JSON.stringify({ success: true, summary, valuations }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
