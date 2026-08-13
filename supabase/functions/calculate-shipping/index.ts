import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { validateInput, ShippingQuoteSchema } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const body = await req.json();
    const validation = validateInput(ShippingQuoteSchema, body);

    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error, details: validation.details }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const { carrier, weight, dimensions } = validation.data;

    const carriers: Record<string, any> = {
      correios: { baseRate: 15, weightRate: 2.5, volumeRate: 0.01 },
      jadlog: { baseRate: 18, weightRate: 2.0, volumeRate: 0.008 },
      azul: { baseRate: 25, weightRate: 1.8, volumeRate: 0.012 },
      fedex: { baseRate: 50, weightRate: 5.0, volumeRate: 0.05 },
      dhl: { baseRate: 60, weightRate: 6.0, volumeRate: 0.06 },
    };

    const config = carriers[carrier];

    // Cálculo de peso cubado (LxAxC / 6000) ou peso real, o que for maior
    const volume = dimensions
      ? (dimensions.width * dimensions.height * dimensions.length) / 6000
      : 0;
    const chargeableWeight = Math.max(weight, volume);

    const price = config.baseRate + chargeableWeight * config.weightRate;
    const deliveryDays =
      {
        azul: 2,
        jadlog: 4,
        correios: 7,
        fedex: 3,
        dhl: 1,
      }[carrier as string] || 5;

    return new Response(
      JSON.stringify({
        carrier,
        price: Math.round(price * 100) / 100,
        deliveryDays,
        chargeableWeight,
        timestamp: new Date().toISOString(),
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: "Internal Server Error", message: error.message }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
