import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { order_id, carrier_id, service_type } = await req.json();
    if (!order_id || !carrier_id) return new Response(JSON.stringify({ error: "order_id and carrier_id required" }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });

    const { data: order } = await supabase.from("orders").select("*, customer:customers(*), packing:packings(*)").eq("id", order_id).single();
    if (!order) return new Response(JSON.stringify({ error: "Order not found" }), { status: 404, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });

    const trackingNumber = `${carrier_id.substring(0,3).toUpperCase()}${Date.now()}BR`;
    const labelData = {
      tracking_number: trackingNumber, sender: { name: "ESTOKI WMS", address: "Rua Principal, 100", city: "São Paulo", state: "SP", zip: "01310-100" },
      recipient: { name: order.customer?.name, address: order.shipping_address, city: order.shipping_city, state: order.shipping_state, zip: order.shipping_zip },
      package: { weight: order.packing?.total_weight || 1, volume: order.packing?.total_volume || 0.01 }, service: service_type || "SEDEX", barcode: trackingNumber
    };

    const { data: shipment } = await supabase.from("shipments").insert({
      order_id, carrier_id, tracking_number: trackingNumber, service_type: service_type || "SEDEX",
      status: "label_generated", label_data: labelData, total_weight: order.packing?.total_weight, total_volume: order.packing?.total_volume
    }).select().single();

    await supabase.from("orders").update({ status: "shipped", shipment_id: shipment?.id, tracking_number: trackingNumber }).eq("id", order_id);

    return new Response(JSON.stringify({ success: true, tracking_number: trackingNumber, label: labelData }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
