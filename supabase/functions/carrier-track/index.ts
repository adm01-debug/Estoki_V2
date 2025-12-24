import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { tracking_number, carrier } = await req.json();
    if (!tracking_number) return new Response(JSON.stringify({ error: "tracking_number required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Simulação de rastreamento
    const events = [
      { date: new Date(Date.now() - 3*24*60*60*1000).toISOString(), status: "posted", description: "Objeto postado", location: "São Paulo - SP" },
      { date: new Date(Date.now() - 2*24*60*60*1000).toISOString(), status: "in_transit", description: "Em trânsito para destino", location: "Curitiba - PR" },
      { date: new Date(Date.now() - 1*24*60*60*1000).toISOString(), status: "out_for_delivery", description: "Saiu para entrega", location: "Destino Final" },
      { date: new Date().toISOString(), status: "delivered", description: "Entregue ao destinatário", location: "Destino Final" }
    ];

    const currentStatus = events[events.length - 1].status;
    await supabase.from("shipments").update({ status: currentStatus, last_tracking_update: new Date().toISOString(), tracking_events: events }).eq("tracking_number", tracking_number);

    return new Response(JSON.stringify({ success: true, tracking_number, carrier: carrier || "auto", current_status: currentStatus, events }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
