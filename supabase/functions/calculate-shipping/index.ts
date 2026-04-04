import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { carrier, originZip, destZip, weight, dimensions } = await req.json();
    const carriers: Record<string, any> = {
      correios: { baseRate: 15, weightRate: 2.5, volumeRate: 0.01 },
      jadlog: { baseRate: 18, weightRate: 2.0, volumeRate: 0.008 },
      azul: { baseRate: 25, weightRate: 1.8, volumeRate: 0.012 }
    };
    const config = carriers[carrier] || carriers.correios;
    const volume = dimensions ? (dimensions.width * dimensions.height * dimensions.length) / 6000 : weight;
    const chargeableWeight = Math.max(weight, volume);
    const price = config.baseRate + (chargeableWeight * config.weightRate);
    const deliveryDays = carrier === "azul" ? 2 : carrier === "jadlog" ? 4 : 7;
    return new Response(JSON.stringify({ carrier, price: Math.round(price * 100) / 100, deliveryDays, chargeableWeight }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
