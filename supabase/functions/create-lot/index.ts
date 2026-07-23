import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { CreateLotSchema, validateInput } from "../_shared/schemas.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const body = await req.json().catch(() => ({}));
    const v = validateInput(CreateLotSchema, body);
    if (!v.success) {
      return new Response(JSON.stringify(v), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const { lotNumber, productId, quantity, manufacturingDate, expirationDate, supplierId } = v.data;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: lot, error } = await supabase
      .from("lots")
      .insert({
        lot_number: lotNumber,
        product_id: productId,
        quantity,
        manufacturing_date: manufacturingDate,
        expiration_date: expirationDate,
        supplier_id: supplierId,
        status: "active",
      })
      .select()
      .single();
    if (error) throw error;
    return new Response(JSON.stringify({ lot }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
