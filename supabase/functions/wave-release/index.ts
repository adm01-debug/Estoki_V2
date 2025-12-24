import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { wave_id, released_by } = await req.json();

    if (!wave_id) {
      return new Response(JSON.stringify({ error: "wave_id is required" }), 
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Buscar wave e pedidos
    const { data: wave } = await supabase
      .from("picking_waves")
      .select("*, orders(*)")
      .eq("id", wave_id)
      .single();

    if (!wave) {
      return new Response(JSON.stringify({ error: "Wave not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Gerar pick lists para cada pedido
    const pickLists = [];
    for (const order of wave.orders || []) {
      const { data: items } = await supabase
        .from("order_items")
        .select("*, product:products(*, locations:location_stock(*, location:locations(*)))")
        .eq("order_id", order.id);

      const pickItems = items?.flatMap((item: any) => {
        const bestLocation = item.product?.locations
          ?.filter((l: any) => l.quantity >= item.quantity)
          ?.sort((a: any, b: any) => a.location?.sequence - b.location?.sequence)[0];

        return bestLocation ? [{
          order_item_id: item.id,
          product_id: item.product_id,
          location_id: bestLocation.location_id,
          location_code: bestLocation.location?.code,
          quantity: item.quantity,
          status: "pending",
        }] : [];
      }) || [];

      if (pickItems.length) {
        const { data: pickList } = await supabase
          .from("pick_lists")
          .insert({
            wave_id,
            order_id: order.id,
            status: "pending",
            total_items: pickItems.length,
          })
          .select()
          .single();

        if (pickList) {
          await supabase.from("pick_list_items").insert(
            pickItems.map((pi: any) => ({ ...pi, pick_list_id: pickList.id }))
          );
          pickLists.push(pickList);
        }
      }
    }

    // Atualizar status da wave
    await supabase
      .from("picking_waves")
      .update({ status: "released", released_at: new Date().toISOString(), released_by })
      .eq("id", wave_id);

    await supabase
      .from("orders")
      .update({ status: "picking" })
      .eq("wave_id", wave_id);

    return new Response(
      JSON.stringify({ success: true, pick_lists_created: pickLists.length }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
