import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { BoletoGenerateSchema, validateInput } from "../_shared/schemas.ts";
import { rateLimit, rateLimitResponse, RateLimitPresets } from "../_shared/rate-limit.ts";

interface BoletoRequest {
  amount: number;
  due_date: string;
  payer: { name: string; document: string; address?: string };
  description: string;
  instructions?: string[];
}

function generateBarcode(amount: number, dueDate: string): string {
  const bank = "237"; // Bradesco
  const currency = "9";
  const dueFactor = Math.floor(
    (new Date(dueDate).getTime() - new Date("1997-10-07").getTime()) / 86400000
  );
  const value = String(Math.floor(amount * 100)).padStart(10, "0");
  return `${bank}${currency}${dueFactor}${value}${Date.now().toString().slice(-15)}`;
}

function generateDigitableLine(barcode: string): string {
  const parts = [
    barcode.substring(0, 5) + "." + barcode.substring(5, 10),
    barcode.substring(10, 15) + "." + barcode.substring(15, 21),
    barcode.substring(21, 26) + "." + barcode.substring(26, 32),
    barcode.substring(32, 33),
    barcode.substring(33, 47),
  ];
  return parts.join(" ");
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }
  const rl = rateLimit(req, { key: "boleto-generate", ...RateLimitPresets.boleto });
  if (!rl.ok) return rateLimitResponse(rl, req);

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body = await req.json().catch(() => ({}));
    const v = validateInput(BoletoGenerateSchema, body);
    if (!v.success) {
      return new Response(JSON.stringify({ error: v.error, details: v.details }), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    }
    const data = v.data;

    const boletoId = crypto.randomUUID();
    const barcode = generateBarcode(data.amount, data.due_date);
    const digitableLine = generateDigitableLine(barcode);

    const { data: boleto, error } = await supabase
      .from("boletos")
      .insert({
        id: boletoId,
        amount: data.amount,
        due_date: data.due_date,
        barcode,
        digitable_line: digitableLine,
        payer_name: data.payer.name,
        payer_document: data.payer.document,
        payer_address: data.payer.address,
        description: data.description,
        instructions: data.instructions || [],
        status: "pending",
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(
      JSON.stringify({
        success: true,
        boleto: {
          ...boleto,
          pdf_url: `/api/boleto/${boletoId}/pdf`,
        },
      }),
      {
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
