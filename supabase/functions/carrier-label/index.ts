import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { CarrierLabelSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const raw = await req.json().catch(() => null);
    const validation = validateInput(CarrierLabelSchema, raw);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error, details: validation.details }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }
    const { shipment_id, carrier, sender, recipient, packages } = validation.data;

    const trackingCode = `${carrier.toUpperCase().substring(0, 2)}${Date.now()}BR`;

    const { data: label, error } = await supabase
      .from("shipping_labels")
      .insert({
        shipment_id,
        carrier,
        tracking_code: trackingCode,
        sender,
        recipient,
        packages,
        status: "generated",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        label_id: label.id,
        tracking_code: trackingCode,
        label_url: `/api/labels/${label.id}/pdf`,
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
