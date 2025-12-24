import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { hours_threshold = 24 } = await req.json();

    const thresholdDate = new Date(Date.now() - hours_threshold * 60 * 60 * 1000).toISOString();
    const { data: pendingOrders } = await supabase.from("orders").select("*, customer:customers(name)").in("status", ["pending", "confirmed"]).lt("created_at", thresholdDate);

    const alerts = [];
    for (const order of pendingOrders || []) {
      const hoursWaiting = Math.floor((Date.now() - new Date(order.created_at).getTime()) / (60*60*1000));
      const severity = hoursWaiting > 48 ? "critical" : hoursWaiting > 24 ? "high" : "warning";
      
      const alert = {
        type: "pending_order", severity, title: `Pedido aguardando: ${order.order_number}`,
        message: `Pedido de ${order.customer?.name} aguarda há ${hoursWaiting}h`,
        entity_type: "order", entity_id: order.id,
        data: { order_number: order.order_number, customer: order.customer?.name, hours_waiting: hoursWaiting, status: order.status }
      };
      
      await supabase.from("alerts").insert({ ...alert, status: "active" });
      alerts.push(alert);
    }

    return new Response(JSON.stringify({ success: true, alerts_generated: alerts.length, alerts }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
