import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { warehouse_id, snapshot_type = "full" } = await req.json();

    const snapshotId = `SNAP-${new Date().toISOString().slice(0,10).replace(/-/g,"")}-${Math.random().toString(36).substr(2,6).toUpperCase()}`;
    let query = supabase.from("location_stock").select("*, product:products(*), location:locations(*)");
    if (warehouse_id) query = query.eq("location.warehouse_id", warehouse_id);
    const { data: stocks } = await query;

    const totalItems = stocks?.length || 0;
    const totalQuantity = stocks?.reduce((sum, s) => sum + (s.quantity || 0), 0) || 0;
    const totalValue = stocks?.reduce((sum, s) => sum + ((s.quantity || 0) * (s.product?.cost || 0)), 0) || 0;

    const { data: snapshot } = await supabase.from("inventory_snapshots").insert({
      snapshot_id: snapshotId, warehouse_id, snapshot_type, snapshot_date: new Date().toISOString(),
      total_items: totalItems, total_quantity: totalQuantity, total_value: totalValue, status: "completed"
    }).select().single();

    const snapshotItems = stocks?.map(s => ({
      snapshot_id: snapshot?.id, product_id: s.product_id, location_id: s.location_id,
      quantity: s.quantity, lot_number: s.lot_number, unit_cost: s.product?.cost
    })) || [];

    if (snapshotItems.length) await supabase.from("inventory_snapshot_items").insert(snapshotItems);

    return new Response(JSON.stringify({ success: true, snapshot_id: snapshotId, total_items: totalItems, total_quantity: totalQuantity, total_value: totalValue }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
