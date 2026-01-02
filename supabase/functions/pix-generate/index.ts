import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PixRequest {
  amount: number;
  description?: string;
  payer_name?: string;
  expiration_minutes?: number;
}

function generatePixPayload(pixKey: string, amount: number, merchantName: string, description: string, txId: string): string {
  const formatField = (id: string, value: string) => `${id}${String(value.length).padStart(2, "0")}${value}`;
  
  let payload = "";
  payload += formatField("00", "01"); // Payload Format Indicator
  payload += formatField("26", formatField("00", "br.gov.bcb.pix") + formatField("01", pixKey));
  payload += formatField("52", "0000"); // Merchant Category Code
  payload += formatField("53", "986"); // Transaction Currency (BRL)
  payload += formatField("54", amount.toFixed(2)); // Transaction Amount
  payload += formatField("58", "BR"); // Country Code
  payload += formatField("59", merchantName.substring(0, 25)); // Merchant Name
  payload += formatField("60", "SAO PAULO"); // Merchant City
  payload += formatField("62", formatField("05", txId.substring(0, 25))); // Additional Data Field
  
  // CRC16-CCITT placeholder
  payload += "6304";
  
  // Calculate CRC16
  let crc = 0xFFFF;
  for (let i = 0; i < payload.length; i++) {
    crc ^= payload.charCodeAt(i) << 8;
    for (let j = 0; j < 8; j++) {
      crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
    }
  }
  crc &= 0xFFFF;
  
  return payload.replace("6304", "6304" + crc.toString(16).toUpperCase().padStart(4, "0"));
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

    const data: PixRequest = await req.json();
    
    if (!data.amount || data.amount <= 0) {
      throw new Error("amount é obrigatório e deve ser maior que zero");
    }

    const txId = crypto.randomUUID().replace(/-/g, "").substring(0, 25);
    const pixKey = Deno.env.get("PIX_KEY") || "estoki@empresa.com.br";
    const merchantName = Deno.env.get("MERCHANT_NAME") || "ESTOKI WMS";
    
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + (data.expiration_minutes || 60));

    const payload = generatePixPayload(pixKey, data.amount, merchantName, data.description || "Pagamento", txId);

    const { data: pix, error } = await supabase.from("pix_payments").insert({
      tx_id: txId,
      amount: data.amount,
      description: data.description,
      payer_name: data.payer_name,
      payload,
      status: "pending",
      expires_at: expiresAt.toISOString(),
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      pix: {
        ...pix,
        qr_code_url: `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(payload)}`,
        copy_paste: payload,
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
