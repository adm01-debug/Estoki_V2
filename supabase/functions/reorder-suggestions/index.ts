import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: products } = await supabase.from("products").select("id, name, sku, stock_quantity, reorder_point, reorder_quantity, cost, lead_time_days, suppliers(name)").lte("stock_quantity", supabase.sql`reorder_point`);
    const suggestions = (products || []).filter(p => p.stock_quantity <= p.reorder_point).map(p => ({ productId: p.id, name: p.name, sku: p.sku, currentStock: p.stock_quantity, reorderPoint: p.reorder_point, suggestedQty: p.reorder_quantity || Math.max(p.reorder_point * 2, 10), estimatedCost: (p.reorder_quantity || p.reorder_point * 2) * p.cost, leadTimeDays: p.lead_time_days, supplier: p.suppliers?.name }));
    return new Response(JSON.stringify({ suggestions, totalEstimatedCost: suggestions.reduce((sum, s) => sum + s.estimatedCost, 0) }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
