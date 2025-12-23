import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { productId, serviceLevel = 0.95 } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: product } = await supabase.from("products").select("lead_time_days").eq("id", productId).single();
    const { data: movements } = await supabase.from("stock_movements").select("quantity").eq("product_id", productId).eq("type", "OUT").limit(90);
    const demands = movements?.map(m => m.quantity) || [0];
    const avgDemand = demands.reduce((a, b) => a + b, 0) / demands.length;
    const variance = demands.reduce((sum, d) => sum + Math.pow(d - avgDemand, 2), 0) / demands.length;
    const stdDev = Math.sqrt(variance);
    const zScore = serviceLevel === 0.95 ? 1.65 : serviceLevel === 0.99 ? 2.33 : 1.28;
    const leadTime = product?.lead_time_days || 7;
    const safetyStock = Math.ceil(zScore * stdDev * Math.sqrt(leadTime));
    return new Response(JSON.stringify({ productId, avgDailyDemand: Math.round(avgDemand * 100) / 100, stdDev: Math.round(stdDev * 100) / 100, leadTimeDays: leadTime, serviceLevel, safetyStock }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
