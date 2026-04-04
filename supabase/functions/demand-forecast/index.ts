import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { productId, periods = 12, method = "moving_average" } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: movements } = await supabase.from("stock_movements").select("quantity, created_at").eq("product_id", productId).eq("type", "OUT").order("created_at", { ascending: false }).limit(periods * 30);
    const monthlyData: number[] = [];
    const now = new Date();
    for (let i = 0; i < periods; i++) {
      const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      const monthSales = movements?.filter(m => { const d = new Date(m.created_at); return d >= start && d <= end; }).reduce((sum, m) => sum + m.quantity, 0) || 0;
      monthlyData.unshift(monthSales);
    }
    let forecast: number;
    if (method === "moving_average") { forecast = monthlyData.slice(-3).reduce((a, b) => a + b, 0) / 3; }
    else { const alpha = 0.3; forecast = monthlyData.reduce((prev, curr) => alpha * curr + (1 - alpha) * prev, monthlyData[0]); }
    return new Response(JSON.stringify({ productId, method, historicalData: monthlyData, forecast: Math.round(forecast), nextPeriods: [1, 2, 3].map(i => Math.round(forecast * (1 + (Math.random() - 0.5) * 0.1))) }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
