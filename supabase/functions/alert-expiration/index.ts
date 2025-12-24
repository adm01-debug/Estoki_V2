import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { days_threshold = 30 } = await req.json();

    const thresholdDate = new Date(Date.now() + days_threshold * 24 * 60 * 60 * 1000).toISOString();
    const { data: expiringStock } = await supabase.from("location_stock").select("*, product:products(*), location:locations(*)").lt("expiration_date", thresholdDate).gt("quantity", 0);

    const alerts = [];
    for (const stock of expiringStock || []) {
      const daysUntilExpiry = Math.floor((new Date(stock.expiration_date).getTime() - Date.now()) / (24*60*60*1000));
      const severity = daysUntilExpiry <= 7 ? "critical" : daysUntilExpiry <= 14 ? "high" : "warning";
      
      const alert = {
        type: "expiration", severity, title: `Vencimento próximo: ${stock.product?.sku}`,
        message: `${stock.product?.name} no lote ${stock.lot_number} vence em ${daysUntilExpiry} dias`,
        entity_type: "stock", entity_id: stock.id,
        data: { product_id: stock.product_id, location_id: stock.location_id, quantity: stock.quantity, expiration_date: stock.expiration_date, days_until_expiry: daysUntilExpiry }
      };
      
      await supabase.from("alerts").insert({ ...alert, status: "active" });
      alerts.push(alert);
    }

    return new Response(JSON.stringify({ success: true, alerts_generated: alerts.length, alerts }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
