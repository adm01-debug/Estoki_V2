import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ReceivingItem {
  product_id: string;
  expected_quantity: number;
  unit_cost?: number;
  lot_number?: string;
  expiration_date?: string;
}

interface CreateReceivingRequest {
  purchase_order_id?: string;
  supplier_id: string;
  warehouse_id: string;
  expected_date: string;
  items: ReceivingItem[];
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

    const { purchase_order_id, supplier_id, warehouse_id, expected_date, items, notes }: CreateReceivingRequest = await req.json();

    // Validações
    if (!supplier_id || !warehouse_id || !items?.length) {
      return new Response(
        JSON.stringify({ error: "supplier_id, warehouse_id and items are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Gerar número do recebimento
    const receiptNumber = `REC-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;

    // Criar recebimento
    const { data: receiving, error: receivingError } = await supabase
      .from("receivings")
      .insert({
        receipt_number: receiptNumber,
        purchase_order_id,
        supplier_id,
        warehouse_id,
        expected_date,
        status: "pending",
        notes,
        created_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (receivingError) throw receivingError;

    // Criar itens do recebimento
    const receivingItems = items.map((item) => ({
      receiving_id: receiving.id,
      product_id: item.product_id,
      expected_quantity: item.expected_quantity,
      received_quantity: 0,
      unit_cost: item.unit_cost,
      lot_number: item.lot_number,
      expiration_date: item.expiration_date,
      status: "pending",
    }));

    const { error: itemsError } = await supabase
      .from("receiving_items")
      .insert(receivingItems);

    if (itemsError) throw itemsError;

    // Log de auditoria
    await supabase.from("audit_logs").insert({
      action: "receiving_created",
      entity_type: "receiving",
      entity_id: receiving.id,
      details: { receipt_number: receiptNumber, items_count: items.length },
    });

    return new Response(
      JSON.stringify({ success: true, receiving, receipt_number: receiptNumber }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
