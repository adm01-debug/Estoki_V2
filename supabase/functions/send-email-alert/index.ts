import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

const jsonResponse = (body: unknown, status = 200, request?: Request) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(request), "Content-Type": "application/json" },
  });

const EmailAlertSchema = z.object({
  to: z.union([z.string().email(), z.array(z.string().email()).min(1)]),
  subject: z.string().min(1).max(500).optional(),
  html: z.string().max(100000).optional(),
  tipo: z.string().max(100).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405, req);

  try {
    const parsed = EmailAlertSchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, 400, req);
    }

    const { to, subject, html, tipo } = parsed.data;

    const resendKey = Deno.env.get("RESEND_API_KEY");
    if (!resendKey) {
      return jsonResponse({ error: "Email service not configured" }, 503, req);
    }

    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${resendKey}`,
      },
      body: JSON.stringify({
        from: "ESTOKI WMS <onboarding@resend.dev>",
        to: Array.isArray(to) ? to : [to],
        subject: subject || `[ESTOKI] Alerta - ${tipo || "Sistema"}`,
        html: html || `<h2>Alerta do ESTOKI WMS</h2><p>Tipo: ${tipo}</p>`,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`Resend error: ${response.status} - ${errorText}`);
      return jsonResponse({ error: "Failed to send email" }, 502, req);
    }

    const data = await response.json();
    return jsonResponse({ success: true, id: data.id }, 200, req);
  } catch (error) {
    console.error("send-email-alert error:", error);
    return jsonResponse({ error: "Internal server error" }, 500, req);
  }
});
