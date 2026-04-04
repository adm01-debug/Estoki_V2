import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { period = 90 } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const startDate = new Date(); startDate.setDate(startDate.getDate() - period);
    const { data: movements } = await supabase.from("stock_movements").select("product_id, quantity, products(name, sku, stock_quantity, cost)").eq("type", "OUT").gte("created_at", startDate.toISOString());
    const sales: Record<string, { name: string; sku: string; sold: number; stock: number; cost: number }> = {};
    for (const m of movements || []) {
      if (!sales[m.product_id]) sales[m.product_id] = { name: m.products?.name || "", sku: m.products?.sku || "", sold: 0, stock: m.products?.stock_quantity || 0, cost: m.products?.cost || 0 };
      sales[m.product_id].sold += m.quantity;
    }
    const analysis = Object.entries(sales).map(([id, data]) => {
      const turnover = data.stock > 0 ? data.sold / data.stock : 0;
      const daysOfStock = data.sold > 0 ? (data.stock / (data.sold / period)) : 999;
      return { productId: id, ...data, turnover: Math.round(turnover * 100) / 100, daysOfStock: Math.round(daysOfStock) };
    }).sort((a, b) => b.turnover - a.turnover);
    return new Response(JSON.stringify({ period, analysis }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
