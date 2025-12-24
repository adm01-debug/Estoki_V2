import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { origin_zip, destination_zip, weight, length, width, height, services = ["SEDEX", "PAC"] } = await req.json();
    if (!origin_zip || !destination_zip || !weight) return new Response(JSON.stringify({ error: "origin_zip, destination_zip, weight required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    // Simulação de cotação Correios (em produção usaria API real)
    const quotes = services.map((service: string) => {
      const basePrice = service === "SEDEX" ? 25.00 : 18.00;
      const weightPrice = weight * (service === "SEDEX" ? 2.50 : 1.80);
      const volumePrice = ((length * width * height) / 6000) * (service === "SEDEX" ? 1.20 : 0.90);
      const price = basePrice + weightPrice + volumePrice;
      const days = service === "SEDEX" ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 5;
      return {
        service, code: service === "SEDEX" ? "04014" : "04510", price: Math.round(price * 100) / 100,
        delivery_days: days, delivery_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        carrier: "Correios"
      };
    });

    return new Response(JSON.stringify({ success: true, origin_zip, destination_zip, weight, quotes }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
