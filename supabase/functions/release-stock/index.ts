import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { orderId } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: reservations, error: rErr } = await supabase.from("stock_reservations").select("*").eq("order_id", orderId).eq("status", "reserved");
    if (rErr) throw rErr;
    for (const res of reservations || []) {
      const { data: product } = await supabase.from("products").select("reserved_quantity").eq("id", res.product_id).single();
      await supabase.from("products").update({ reserved_quantity: Math.max(0, product.reserved_quantity - res.quantity) }).eq("id", res.product_id);
      await supabase.from("stock_reservations").update({ status: "released" }).eq("id", res.id);
    }
    return new Response(JSON.stringify({ released: reservations?.length || 0 }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
