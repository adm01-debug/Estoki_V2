import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { days_ahead = 30 } = await req.json().catch(() => ({}));

    const checkDate = new Date();
    checkDate.setDate(checkDate.getDate() + days_ahead);

    // Produtos vencendo em breve
    const { data: expiring } = await supabase
      .from("inventory_lots")
      .select("*, product:product_id(name, sku)")
      .lte("expiration_date", checkDate.toISOString())
      .gt("expiration_date", new Date().toISOString())
      .gt("quantity", 0);

    // Produtos já vencidos
    const { data: expired } = await supabase
      .from("inventory_lots")
      .select("*, product:product_id(name, sku)")
      .lt("expiration_date", new Date().toISOString())
      .gt("quantity", 0);

    const alerts = [
      ...(expiring || []).map(l => ({
        lot_id: l.id, type: "expiring_soon", severity: "warning",
        message: `Lote ${l.batch_number} vence em ${l.expiration_date}`,
        days_until_expiration: Math.ceil((new Date(l.expiration_date).getTime() - Date.now()) / 86400000),
      })),
      ...(expired || []).map(l => ({
        lot_id: l.id, type: "expired", severity: "critical",
        message: `Lote ${l.batch_number} VENCIDO em ${l.expiration_date}`,
        days_until_expiration: 0,
      })),
    ];

    if (alerts.length > 0) {
      await supabase.from("expiration_alerts").insert(alerts);
    }

    return new Response(JSON.stringify({
      success: true, expiring: expiring?.length || 0, expired: expired?.length || 0, alerts,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
});
