import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { CarrierQuoteSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const raw = await req.json().catch(() => null);
    const validation = validateInput(CarrierQuoteSchema, raw);
    if (!validation.success) {
      return new Response(
        JSON.stringify({ error: validation.error, details: validation.details }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }
    const {
      origin_zip,
      destination_zip,
      weight,
      value,
      services = ["EXPRESSO", "PACKAGE"],
    } = validation.data;

    const quotes = services.map((service: string) => {
      const basePrice = service === "EXPRESSO" ? 30.0 : 22.0;
      const weightPrice = weight * (service === "EXPRESSO" ? 2.8 : 2.0);
      const adValorem = (value || 0) * 0.003;
      const price = basePrice + weightPrice + adValorem;
      const days =
        service === "EXPRESSO"
          ? Math.floor(Math.random() * 2) + 1
          : Math.floor(Math.random() * 4) + 3;
      return {
        service,
        code: service === "EXPRESSO" ? "6" : "5",
        price: Math.round(price * 100) / 100,
        delivery_days: days,
        delivery_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        carrier: "Jadlog",
      };
    });

    return new Response(
      JSON.stringify({ success: true, origin_zip, destination_zip, weight, quotes }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
