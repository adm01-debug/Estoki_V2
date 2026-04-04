import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { supplierId, items, expectedDelivery, notes } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const orderNumber = `PO-${Date.now()}`;
    const total = items.reduce((sum: number, i: any) => sum + (i.quantity * i.unitPrice), 0);
    const { data: order, error } = await supabase.from("purchase_orders").insert({ order_number: orderNumber, supplier_id: supplierId, items, total, expected_delivery: expectedDelivery, notes, status: "draft" }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ order }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
