import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PaymentRequest {
  amount: number;
  currency?: string;
  method: "pix" | "boleto" | "credit_card";
  customer: { name: string; email: string; document: string };
  description?: string;
  metadata?: Record<string, any>;
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

    const payment: PaymentRequest = await req.json();

    if (!payment.amount || !payment.method || !payment.customer) {
      throw new Error("amount, method e customer são obrigatórios");
    }

    // Gerar ID único do pagamento
    const paymentId = crypto.randomUUID();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 3);

    // Salvar no banco
    const { data, error } = await supabase.from("payments").insert({
      id: paymentId,
      amount: payment.amount,
      currency: payment.currency || "BRL",
      method: payment.method,
      status: "pending",
      customer_name: payment.customer.name,
      customer_email: payment.customer.email,
      customer_document: payment.customer.document,
      description: payment.description,
      metadata: payment.metadata,
      expires_at: expiresAt.toISOString(),
    }).select().single();

    if (error) throw error;

    // Gerar dados do método de pagamento
    let paymentData: any = { payment_id: paymentId };

    if (payment.method === "pix") {
      paymentData.pix_key = `00020126580014br.gov.bcb.pix0136${paymentId}`;
      paymentData.qr_code = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${paymentData.pix_key}`;
    } else if (payment.method === "boleto") {
      paymentData.barcode = `23793.38128 60000.000003 ${paymentId.substring(0,5)} 1 ${Math.floor(payment.amount * 100)}`;
      paymentData.due_date = expiresAt.toISOString().split("T")[0];
    }

    return new Response(JSON.stringify({
      success: true,
      payment: data,
      payment_data: paymentData,
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
