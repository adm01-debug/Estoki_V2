import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { orderId, userId } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: order, error: oErr } = await supabase.from("sales_orders").select("*").eq("id", orderId).single();
    if (oErr) throw oErr;
    for (const item of order.items) {
      const { data: product } = await supabase.from("products").select("stock_quantity, reserved_quantity").eq("id", item.productId).single();
      if (product && product.stock_quantity - product.reserved_quantity < item.quantity) throw new Error(`Estoque insuficiente: ${item.productId}`);
      await supabase.from("products").update({ reserved_quantity: product.reserved_quantity + item.quantity }).eq("id", item.productId);
    }
    await supabase.from("sales_orders").update({ status: "processing", processed_at: new Date().toISOString(), processed_by: userId }).eq("id", orderId);
    return new Response(JSON.stringify({ success: true, orderId }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
