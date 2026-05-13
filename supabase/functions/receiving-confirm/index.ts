import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

interface ConfirmItemRequest {
  item_id: string;
  received_quantity: number;
  lot_number?: string;
  expiration_date?: string;
  quality_status?: "approved" | "rejected" | "pending_inspection";
  notes?: string;
}

interface ConfirmReceivingRequest {
  receiving_id: string;
  items: ConfirmItemRequest[];
  confirmed_by: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { receiving_id, items, confirmed_by }: ConfirmReceivingRequest = await req.json();

    if (!receiving_id || !items?.length) {
      return new Response(
        JSON.stringify({ error: "receiving_id and items are required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Verificar se recebimento existe
    const { data: receiving, error: recError } = await supabase
      .from("receivings")
      .select("*")
      .eq("id", receiving_id)
      .single();

    if (recError || !receiving) {
      return new Response(
        JSON.stringify({ error: "Receiving not found" }),
        { status: 404, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Atualizar cada item
    const updatePromises = items.map(async (item) => {
      const { error } = await supabase
        .from("receiving_items")
        .update({
          received_quantity: item.received_quantity,
          lot_number: item.lot_number,
          expiration_date: item.expiration_date,
          quality_status: item.quality_status || "approved",
          notes: item.notes,
          status: "received",
          received_at: new Date().toISOString(),
        })
        .eq("id", item.item_id);
      
      if (error) throw error;
      return item;
    });

    await Promise.all(updatePromises);

    // Verificar se todos os itens foram recebidos
    const { data: allItems } = await supabase
      .from("receiving_items")
      .select("status")
      .eq("receiving_id", receiving_id);

    const allReceived = allItems?.every((i) => i.status === "received");
    const newStatus = allReceived ? "completed" : "partial";

    // Atualizar status do recebimento
    await supabase
      .from("receivings")
      .update({
        status: newStatus,
        confirmed_by,
        confirmed_at: new Date().toISOString(),
      })
      .eq("id", receiving_id);

    // Log de auditoria
    await supabase.from("audit_log").insert({
      action: "receiving_confirmed",
      entity_type: "receiving",
      entity_id: receiving_id,
      user_id: confirmed_by,
      details: { items_confirmed: items.length, new_status: newStatus },
    });

    return new Response(
      JSON.stringify({ success: true, status: newStatus, items_confirmed: items.length }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
