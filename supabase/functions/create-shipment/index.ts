import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { CreateShipmentSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };

  try {
    const body = await req.json();
    const validation = validateInput(CreateShipmentSchema, body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error, details: validation.details }),
        { status: 400, headers }
      );
    }

    const { orderId, carrier, trackingNumber } = validation.data;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: shipment, error } = await supabase
      .from("shipments")
      .insert({
        order_id: orderId,
        carrier,
        tracking_number: trackingNumber,
        status: "created",
        shipped_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    await supabase
      .from("orders")
      .update({
        status: "shipped",
        tracking_number: trackingNumber,
      })
      .eq("id", orderId);

    return new Response(JSON.stringify({ shipment }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
});
