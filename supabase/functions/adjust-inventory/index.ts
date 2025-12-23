import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { productId, locationId, adjustedQuantity, reason, userId } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: current } = await supabase.from("location_stock").select("quantity").eq("product_id", productId).eq("location_id", locationId).single();
    const previousQty = current?.quantity || 0;
    const difference = adjustedQuantity - previousQty;
    if (current) { await supabase.from("location_stock").update({ quantity: adjustedQuantity }).eq("product_id", productId).eq("location_id", locationId); }
    else { await supabase.from("location_stock").insert({ product_id: productId, location_id: locationId, quantity: adjustedQuantity }); }
    const { data: adjustment, error } = await supabase.from("inventory_adjustments").insert({ product_id: productId, location_id: locationId, previous_quantity: previousQty, new_quantity: adjustedQuantity, difference, reason, adjusted_by: userId }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ adjustment }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
