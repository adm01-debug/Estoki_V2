import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { CarrierQuoteSchema, validateInput } from "../_shared/schemas.ts";
import { hasCredentials, quote as correiosQuote, MissingCredentialsError } from "../_shared/correios.ts";

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
      length = 20,
      width = 20,
      height = 20,
      services = ["SEDEX", "PAC"],
    } = validation.data;

    const serviceCodes = services.map((s: string) =>
      s === "SEDEX" ? "04014" : s === "PAC" ? "04510" : s
    );

    let quotes: unknown;
    let mode: "real" | "simulated" = "simulated";

    if (hasCredentials()) {
      try {
        quotes = await correiosQuote({
          originZip: origin_zip,
          destZip: destination_zip,
          weightKg: weight,
          lengthCm: length,
          widthCm: width,
          heightCm: height,
          services: serviceCodes,
        });
        mode = "real";
      } catch (err) {
        if (!(err instanceof MissingCredentialsError)) {
          console.error("[carrier-quote-correios] fallback simulação:", err);
        }
      }
    }

    if (!quotes) {
      quotes = services.map((service: string) => {
      const basePrice = service === "SEDEX" ? 25.0 : 18.0;
      const weightPrice = weight * (service === "SEDEX" ? 2.5 : 1.8);
      const volumePrice = ((length * width * height) / 6000) * (service === "SEDEX" ? 1.2 : 0.9);
      const price = basePrice + weightPrice + volumePrice;
      const days =
        service === "SEDEX" ? Math.floor(Math.random() * 3) + 1 : Math.floor(Math.random() * 5) + 5;
      return {
        service,
        code: service === "SEDEX" ? "04014" : "04510",
        price: Math.round(price * 100) / 100,
        delivery_days: days,
        delivery_date: new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
        carrier: "Correios",
      };
      });
    }

    return new Response(
      JSON.stringify({ success: true, mode, origin_zip, destination_zip, weight, quotes }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
