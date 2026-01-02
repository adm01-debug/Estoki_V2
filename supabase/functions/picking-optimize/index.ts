import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { order_ids, strategy = "zone" } = await req.json();

    if (!order_ids || !Array.isArray(order_ids)) throw new Error("order_ids array é obrigatório");

    // Buscar itens dos pedidos
    const { data: items } = await supabase
      .from("order_items")
      .select("*, product:product_id(*, location:primary_location)")
      .in("order_id", order_ids);

    if (!items || items.length === 0) throw new Error("Nenhum item encontrado");

    // Agrupar por localização
    const locationGroups: Record<string, typeof items> = {};
    items.forEach(item => {
      const loc = item.product?.location || "UNKNOWN";
      if (!locationGroups[loc]) locationGroups[loc] = [];
      locationGroups[loc].push(item);
    });

    // Ordenar localizações (simulação de rota otimizada)
    const sortedLocations = Object.keys(locationGroups).sort((a, b) => {
      const [zoneA, rowA] = a.split("-");
      const [zoneB, rowB] = b.split("-");
      if (zoneA !== zoneB) return zoneA.localeCompare(zoneB);
      return parseInt(rowA || "0") - parseInt(rowB || "0");
    });

    // Criar lista de picking otimizada
    const pickingList = sortedLocations.flatMap((loc, idx) => 
      locationGroups[loc].map(item => ({
        sequence: idx + 1,
        location: loc,
        product_id: item.product_id,
        product_name: item.product?.name,
        sku: item.product?.sku,
        quantity: item.quantity,
        order_id: item.order_id,
      }))
    );

    // Salvar rota otimizada
    const { data: route } = await supabase.from("picking_routes").insert({
      order_ids, strategy, items_count: pickingList.length,
      locations_count: sortedLocations.length, status: "pending",
      optimized_at: new Date().toISOString(),
    }).select().single();

    return new Response(JSON.stringify({
      success: true,
      route_id: route?.id,
      total_items: pickingList.length,
      total_locations: sortedLocations.length,
      picking_list: pickingList,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
});
