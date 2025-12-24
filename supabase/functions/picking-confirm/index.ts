import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface PickConfirmItem {
  pick_item_id: string;
  picked_quantity: number;
  location_id?: string;
  lot_number?: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { pick_list_id, items, picker_id }: { pick_list_id: string; items: PickConfirmItem[]; picker_id: string } = await req.json();

    if (!pick_list_id || !items?.length) {
      return new Response(JSON.stringify({ error: "pick_list_id and items are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    for (const item of items) {
      // Atualizar item do pick list
      const { data: pickItem } = await supabase
        .from("pick_list_items")
        .update({
          picked_quantity: item.picked_quantity,
          status: item.picked_quantity > 0 ? "picked" : "skipped",
          picked_at: new Date().toISOString(),
          picked_by: picker_id,
        })
        .eq("id", item.pick_item_id)
        .select("*, pick_list:pick_lists(*)")
        .single();

      if (pickItem && item.picked_quantity > 0) {
        // Baixar estoque da localização
        await supabase.rpc("decrease_location_stock", {
          p_product_id: pickItem.product_id,
          p_location_id: pickItem.location_id,
          p_quantity: item.picked_quantity,
        });

        // Registrar movimentação
        await supabase.from("stock_movements").insert({
          product_id: pickItem.product_id,
          location_id: pickItem.location_id,
          movement_type: "OUT",
          quantity: item.picked_quantity,
          reference_type: "picking",
          reference_id: pick_list_id,
          created_by: picker_id,
        });
      }
    }

    // Verificar se pick list está completa
    const { data: allItems } = await supabase
      .from("pick_list_items")
      .select("status")
      .eq("pick_list_id", pick_list_id);

    const allPicked = allItems?.every((i) => ["picked", "skipped"].includes(i.status));

    if (allPicked) {
      await supabase
        .from("pick_lists")
        .update({ status: "completed", completed_at: new Date().toISOString() })
        .eq("id", pick_list_id);

      // Atualizar pedido para packing
      const { data: pickList } = await supabase
        .from("pick_lists")
        .select("order_id")
        .eq("id", pick_list_id)
        .single();

      if (pickList?.order_id) {
        await supabase
          .from("orders")
          .update({ status: "ready_for_packing" })
          .eq("id", pickList.order_id);
      }
    }

    return new Response(
      JSON.stringify({ success: true, items_confirmed: items.length, completed: allPicked }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
