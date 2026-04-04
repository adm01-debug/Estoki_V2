import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { items, orderId, userId } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const reservations = [];
    for (const item of items) {
      const { data: product, error: pErr } = await supabase.from("products").select("stock_quantity, reserved_quantity").eq("id", item.productId).single();
      if (pErr) throw pErr;
      const available = product.stock_quantity - product.reserved_quantity;
      if (available < item.quantity) throw new Error(`Estoque insuficiente para produto ${item.productId}`);
      await supabase.from("products").update({ reserved_quantity: product.reserved_quantity + item.quantity }).eq("id", item.productId);
      const { data: reservation, error } = await supabase.from("stock_reservations").insert({ product_id: item.productId, quantity: item.quantity, order_id: orderId, user_id: userId, status: "reserved" }).select().single();
      if (error) throw error;
      reservations.push(reservation);
    }
    return new Response(JSON.stringify({ reservations }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
