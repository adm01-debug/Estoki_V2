import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { CarrierQuoteRequestSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };

  try {
    const body = await req.json();
    const validation = validateInput(CarrierQuoteRequestSchema, body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error, details: validation.details }),
        { status: 400, headers }
      );
    }

    const { origin_cep, destination_cep, weight, dimensions, carriers } = validation.data;

    const quotes = carriers
      .map((carrier: string) => {
        const basePrice =
          weight * 0.8 + (dimensions.length * dimensions.width * dimensions.height) / 5000;
        const multipliers: Record<string, number> = {
          correios: 1,
          jadlog: 0.9,
          azul: 1.2,
          loggi: 0.85,
        };
        const days: Record<string, number> = { correios: 7, jadlog: 5, azul: 2, loggi: 3 };

        return {
          carrier,
          price: (basePrice * (multipliers[carrier] || 1)).toFixed(2),
          delivery_days: days[carrier] || 7,
          available: true,
        };
      })
      .sort((a: any, b: any) => parseFloat(a.price) - parseFloat(b.price));

    return new Response(JSON.stringify({ success: true, quotes }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
});
