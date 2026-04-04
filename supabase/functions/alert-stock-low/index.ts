import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { warehouse_id } = await req.json();

    const { data: products } = await supabase.from("products").select("*, stock:location_stock(quantity)").eq("active", true);
    const lowStockItems = [];

    for (const product of products || []) {
      const totalStock = product.stock?.reduce((sum: number, s: any) => sum + (s.quantity || 0), 0) || 0;
      if (totalStock <= (product.reorder_point || 0)) {
        lowStockItems.push({
          product_id: product.id, sku: product.sku, name: product.name,
          current_stock: totalStock, reorder_point: product.reorder_point, safety_stock: product.safety_stock,
          suggested_order: (product.reorder_quantity || 100) - totalStock
        });
      }
    }

    if (lowStockItems.length > 0) {
      for (const item of lowStockItems) {
        await supabase.from("alerts").insert({
          type: "stock_low", severity: item.current_stock === 0 ? "critical" : "warning",
          title: `Estoque baixo: ${item.sku}`, message: `${item.name} está com ${item.current_stock} unidades (mínimo: ${item.reorder_point})`,
          entity_type: "product", entity_id: item.product_id, data: item, status: "active"
        });
      }
    }

    return new Response(JSON.stringify({ success: true, alerts_generated: lowStockItems.length, items: lowStockItems }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
