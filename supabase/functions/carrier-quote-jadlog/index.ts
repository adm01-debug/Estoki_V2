import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { origin_zip, destination_zip, weight, length, width, height, value, services = ["EXPRESSO", "PACKAGE"] } = await req.json();
    if (!origin_zip || !destination_zip || !weight) return new Response(JSON.stringify({ error: "origin_zip, destination_zip, weight required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    const quotes = services.map((service: string) => {
      const basePrice = service === "EXPRESSO" ? 30.00 : 22.00;
      const weightPrice = weight * (service === "EXPRESSO" ? 2.80 : 2.00);
      const adValorem = (value || 0) * 0.003;
      const price = basePrice + weightPrice + adValorem;
      const days = service === "EXPRESSO" ? Math.floor(Math.random() * 2) + 1 : Math.floor(Math.random() * 4) + 3;
      return {
        service, code: service === "EXPRESSO" ? "6" : "5", price: Math.round(price * 100) / 100,
        delivery_days: days, delivery_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        carrier: "Jadlog"
      };
    });

    return new Response(JSON.stringify({ success: true, origin_zip, destination_zip, weight, quotes }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
