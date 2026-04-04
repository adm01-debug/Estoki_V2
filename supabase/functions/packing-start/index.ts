import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { order_id, packer_id, station_id } = await req.json();
    if (!order_id) return new Response(JSON.stringify({ error: "order_id required" }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });

    const { data: order } = await supabase.from("orders").select("*, items:order_items(*, product:products(*))").eq("id", order_id).single();
    if (!order) return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });

    const packingNumber = `PCK-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`;
    const { data: packing } = await supabase.from("packings").insert({
      packing_number: packingNumber, order_id, packer_id, station_id, status: "in_progress", started_at: new Date().toISOString(),
      total_items: order.items?.length || 0
    }).select().single();

    await supabase.from("orders").update({ status: "packing", packing_id: packing?.id }).eq("id", order_id);
    await supabase.from("audit_logs").insert({ action: "packing_started", entity_type: "packing", entity_id: packing?.id, user_id: packer_id });

    return new Response(JSON.stringify({ success: true, packing_number: packingNumber, packing }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
