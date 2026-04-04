import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: products } = await supabase.from("products").select("id, name, sku, stock_quantity, cost, price").gt("stock_quantity", 0);
    let totalValue = 0, totalCost = 0, totalItems = 0;
    const items = products?.map(p => {
      const value = p.stock_quantity * p.price;
      const cost = p.stock_quantity * p.cost;
      totalValue += value; totalCost += cost; totalItems += p.stock_quantity;
      return { ...p, totalValue: value, totalCost: cost };
    }) || [];
    items.sort((a, b) => b.totalValue - a.totalValue);
    return new Response(JSON.stringify({ totalItems, totalValue, totalCost, margin: totalValue - totalCost, products: items }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
