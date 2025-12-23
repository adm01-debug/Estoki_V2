import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { purchaseOrderId, receivedItems, userId } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: po, error: poErr } = await supabase.from("purchase_orders").select("*").eq("id", purchaseOrderId).single();
    if (poErr) throw poErr;
    const receivingNumber = `RCV-${Date.now()}`;
    const { data: receiving, error } = await supabase.from("receivings").insert({ receiving_number: receivingNumber, purchase_order_id: purchaseOrderId, items: receivedItems, received_by: userId, status: "pending_putaway" }).select().single();
    if (error) throw error;
    for (const item of receivedItems) {
      await supabase.from("products").update({ stock_quantity: supabase.rpc("increment_stock", { pid: item.productId, qty: item.quantity }) }).eq("id", item.productId);
    }
    const allReceived = receivedItems.every((r: any) => po.items.find((i: any) => i.productId === r.productId)?.quantity <= r.quantity);
    await supabase.from("purchase_orders").update({ status: allReceived ? "received" : "partial" }).eq("id", purchaseOrderId);
    return new Response(JSON.stringify({ receiving }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
