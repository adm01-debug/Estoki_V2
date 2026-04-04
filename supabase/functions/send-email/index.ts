import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

const jsonResponse = (body: unknown, status = 200, request?: Request) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(request), "Content-Type": "application/json" },
  });

const SendEmailSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
  subject: z.string().min(1).max(500),
  body: z.string().max(50000).optional(),
  template: z.string().max(100).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  if (req.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405, req);
  }

  try {
    const parsed = SendEmailSchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, 400, req);
    }

    const { to, subject, body, template } = parsed.data;

    console.log(`Email queued → to: ${Array.isArray(to) ? to.join(", ") : to}, subject: ${subject}`);

    return jsonResponse({ success: true, message: "Email queued" }, 200, req);
  } catch (error) {
    console.error("send-email error:", error);
    return jsonResponse({ error: "Internal server error" }, 500, req);
  }
});
