import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

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
  const dueFactor = Math.floor((new Date(dueDate).getTime() - new Date("1997-10-07").getTime()) / 86400000);
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
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const data: BoletoRequest = await req.json();

    if (!data.amount || !data.due_date || !data.payer) {
      throw new Error("amount, due_date e payer são obrigatórios");
    }

    const boletoId = crypto.randomUUID();
    const barcode = generateBarcode(data.amount, data.due_date);
    const digitableLine = generateDigitableLine(barcode);

    const { data: boleto, error } = await supabase.from("boletos").insert({
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
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      boleto: {
        ...boleto,
        pdf_url: `/api/boleto/${boletoId}/pdf`,
      },
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
