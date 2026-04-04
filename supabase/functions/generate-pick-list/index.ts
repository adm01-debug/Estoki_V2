import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { orderId, items, strategy = "FIFO" } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const pickList = [];
    for (const item of items) {
      const orderBy = strategy === "FIFO" ? "created_at" : strategy === "FEFO" ? "expiration_date" : "location_code";
      const { data: stocks } = await supabase.from("location_stock").select("*, locations(code, zone, aisle, level)").eq("product_id", item.productId).gt("quantity", 0).order(orderBy);
      let remaining = item.quantity;
      for (const stock of stocks || []) {
        if (remaining <= 0) break;
        const pickQty = Math.min(remaining, stock.quantity);
        pickList.push({ productId: item.productId, locationId: stock.location_id, locationCode: stock.locations?.code, quantity: pickQty, zone: stock.locations?.zone, aisle: stock.locations?.aisle, level: stock.locations?.level });
        remaining -= pickQty;
      }
      if (remaining > 0) throw new Error(`Estoque insuficiente para produto ${item.productId}`);
    }
    pickList.sort((a, b) => a.zone?.localeCompare(b.zone) || a.aisle?.localeCompare(b.aisle) || (a.level || 0) - (b.level || 0));
    const { data: pick, error } = await supabase.from("pick_orders").insert({ order_id: orderId, items: pickList, strategy, status: "pending" }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ pickOrder: pick, items: pickList }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
