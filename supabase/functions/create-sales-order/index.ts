import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { customerId, items, shippingAddress, notes } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const orderNumber = `SO-${Date.now()}`;
    const subtotal = items.reduce((sum: number, i: any) => sum + (i.quantity * i.unitPrice), 0);
    const { data: order, error } = await supabase.from("sales_orders").insert({ order_number: orderNumber, customer_id: customerId, items, subtotal, shipping_address: shippingAddress, notes, status: "pending" }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ order }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
