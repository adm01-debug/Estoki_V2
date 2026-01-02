import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface InvoiceItem {
  description: string;
  quantity: number;
  unit_price: number;
  total: number;
}

interface InvoiceRequest {
  order_id: string;
  customer: { name: string; email: string; document: string; address?: string };
  items: InvoiceItem[];
  due_date?: string;
  notes?: string;
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

    const invoice: InvoiceRequest = await req.json();

    if (!invoice.order_id || !invoice.customer || !invoice.items?.length) {
      throw new Error("order_id, customer e items são obrigatórios");
    }

    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
    const subtotal = invoice.items.reduce((sum, item) => sum + item.total, 0);
    const tax = subtotal * 0.05; // 5% tax example
    const total = subtotal + tax;

    const { data, error } = await supabase
      .from("invoices")
      .insert({
        invoice_number: invoiceNumber,
        order_id: invoice.order_id,
        customer_name: invoice.customer.name,
        customer_email: invoice.customer.email,
        customer_document: invoice.customer.document,
        customer_address: invoice.customer.address,
        items: invoice.items,
        subtotal,
        tax,
        total,
        due_date: invoice.due_date || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        notes: invoice.notes,
        status: "pending",
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({
      success: true,
      invoice: data,
      pdf_url: `https://invoices.example.com/${invoiceNumber}.pdf`,
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
