import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

interface PutawayItem {
  receiving_item_id: string;
  location_id: string;
  quantity: number;
}

interface ReceivingPutawayRequest {
  receiving_id: string;
  items: PutawayItem[];
  putaway_by: string;
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

    const { receiving_id, items, putaway_by }: ReceivingPutawayRequest = await req.json();

    if (!receiving_id || !items?.length) {
      return new Response(
        JSON.stringify({ error: "receiving_id and items are required" }),
        { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    const results = [];

    for (const item of items) {
      // Buscar item do recebimento
      const { data: recItem } = await supabase
        .from("receiving_items")
        .select("*, product:products(*)")
        .eq("id", item.receiving_item_id)
        .single();

      if (!recItem) continue;

      // Verificar se localização existe e está disponível
      const { data: location } = await supabase
        .from("locations")
        .select("*")
        .eq("id", item.location_id)
        .single();

      if (!location) continue;

      // Criar movimentação de estoque (entrada)
      const { data: movement, error: movError } = await supabase
        .from("stock_movements")
        .insert({
          product_id: recItem.product_id,
          location_id: item.location_id,
          movement_type: "IN",
          quantity: item.quantity,
          reference_type: "receiving",
          reference_id: receiving_id,
          lot_number: recItem.lot_number,
          expiration_date: recItem.expiration_date,
          unit_cost: recItem.unit_cost,
          created_by: putaway_by,
        })
        .select()
        .single();

      if (movError) throw movError;

      // Atualizar ou criar estoque na localização
      const { data: existingStock } = await supabase
        .from("location_stock")
        .select("*")
        .eq("product_id", recItem.product_id)
        .eq("location_id", item.location_id)
        .maybeSingle();

      if (existingStock) {
        await supabase
          .from("location_stock")
          .update({ quantity: existingStock.quantity + item.quantity })
          .eq("id", existingStock.id);
      } else {
        await supabase.from("location_stock").insert({
          product_id: recItem.product_id,
          location_id: item.location_id,
          quantity: item.quantity,
          lot_number: recItem.lot_number,
          expiration_date: recItem.expiration_date,
        });
      }

      // Marcar item como armazenado
      await supabase
        .from("receiving_items")
        .update({ status: "putaway", putaway_location_id: item.location_id })
        .eq("id", item.receiving_item_id);

      results.push({ item_id: item.receiving_item_id, location_id: item.location_id, quantity: item.quantity });
    }

    // Atualizar status do recebimento
    await supabase
      .from("receivings")
      .update({ status: "putaway_completed", putaway_at: new Date().toISOString() })
      .eq("id", receiving_id);

    // Log de auditoria
    await supabase.from("audit_logs").insert({
      action: "receiving_putaway",
      entity_type: "receiving",
      entity_id: receiving_id,
      user_id: putaway_by,
      details: { items_putaway: results.length },
    });

    return new Response(
      JSON.stringify({ success: true, items_putaway: results }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
