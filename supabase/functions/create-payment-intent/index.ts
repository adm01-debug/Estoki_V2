import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@13.0.0?target=deno";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { rateLimit, rateLimitResponse, RateLimitPresets } from "../_shared/rate-limit.ts";
import { CreatePaymentIntentSchema, validateInput } from "../_shared/schemas.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const rl = rateLimit(req, { key: "create-payment-intent", ...RateLimitPresets.payment });
  if (!rl.ok) return rateLimitResponse(rl, req);
  try {
    const body = await req.json().catch(() => ({}));
    const v = validateInput(CreatePaymentIntentSchema, body);
    if (!v.success) {
      return new Response(JSON.stringify(v), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const { amount, currency, customerId, description, metadata } = v.data;
    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, { apiVersion: "2023-10-16" });
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100),
      currency,
      customer: customerId,
      description,
      metadata,
      automatic_payment_methods: { enabled: true },
    });
    return new Response(
      JSON.stringify({ clientSecret: paymentIntent.client_secret, id: paymentIntent.id }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
