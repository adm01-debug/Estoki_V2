import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { period = 90 } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const startDate = new Date(); startDate.setDate(startDate.getDate() - period);
    const { data: products } = await supabase.from("products").select("id, name, sku, stock_quantity, cost");
    const { data: movements } = await supabase.from("stock_movements").select("product_id, quantity").eq("type", "OUT").gte("created_at", startDate.toISOString());
    const sales: Record<string, number> = {};
    for (const m of movements || []) { sales[m.product_id] = (sales[m.product_id] || 0) + m.quantity; }
    const analysis = (products || []).map(p => ({ ...p, totalSales: sales[p.id] || 0, value: (sales[p.id] || 0) * p.cost })).sort((a, b) => b.value - a.value);
    const totalValue = analysis.reduce((sum, p) => sum + p.value, 0);
    let cumulative = 0;
    for (const p of analysis) { cumulative += p.value; (p as any).cumulativePercent = (cumulative / totalValue) * 100; (p as any).class = (p as any).cumulativePercent <= 80 ? "A" : (p as any).cumulativePercent <= 95 ? "B" : "C"; }
    return new Response(JSON.stringify({ totalValue, analysis, summary: { A: analysis.filter((p: any) => p.class === "A").length, B: analysis.filter((p: any) => p.class === "B").length, C: analysis.filter((p: any) => p.class === "C").length } }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
