import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

interface WavePlanningRequest {
  warehouse_id: string;
  order_ids?: string[];
  priority?: "high" | "normal" | "low";
  max_orders_per_wave?: number;
  strategy?: "zone" | "product" | "carrier" | "priority";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { warehouse_id, order_ids, priority, max_orders_per_wave = 50, strategy = "zone" }: WavePlanningRequest = await req.json();

    // Buscar pedidos pendentes
    let query = supabase
      .from("orders")
      .select("*, items:order_items(*, product:products(*, locations:location_stock(*)))")
      .eq("warehouse_id", warehouse_id)
      .eq("status", "pending")
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true });

    if (order_ids?.length) {
      query = query.in("id", order_ids);
    }
    if (priority) {
      query = query.eq("priority", priority);
    }

    const { data: orders, error } = await query.limit(max_orders_per_wave);
    if (error) throw error;

    if (!orders?.length) {
      return new Response(
        JSON.stringify({ success: true, waves: [], message: "No pending orders found" }),
        { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
      );
    }

    // Agrupar por estratégia
    const waves: any[] = [];
    let currentWave: any = { orders: [], zones: new Set(), total_items: 0 };

    for (const order of orders) {
      const orderZones = new Set(order.items?.flatMap((i: any) => 
        i.product?.locations?.map((l: any) => l.zone_id) || []
      ));

      currentWave.orders.push(order.id);
      orderZones.forEach((z) => currentWave.zones.add(z));
      currentWave.total_items += order.items?.length || 0;

      if (currentWave.orders.length >= 10 || currentWave.zones.size >= 5) {
        waves.push({
          ...currentWave,
          zones: Array.from(currentWave.zones),
          wave_number: `WAVE-${Date.now()}-${waves.length + 1}`,
        });
        currentWave = { orders: [], zones: new Set(), total_items: 0 };
      }
    }

    if (currentWave.orders.length > 0) {
      waves.push({
        ...currentWave,
        zones: Array.from(currentWave.zones),
        wave_number: `WAVE-${Date.now()}-${waves.length + 1}`,
      });
    }

    // Salvar waves no banco
    for (const wave of waves) {
      const { data: savedWave } = await supabase
        .from("picking_waves")
        .insert({
          wave_number: wave.wave_number,
          warehouse_id,
          status: "planned",
          order_count: wave.orders.length,
          item_count: wave.total_items,
          zones: wave.zones,
        })
        .select()
        .single();

      if (savedWave) {
        await supabase
          .from("orders")
          .update({ wave_id: savedWave.id, status: "wave_assigned" })
          .in("id", wave.orders);
      }
    }

    return new Response(
      JSON.stringify({ success: true, waves_created: waves.length, waves }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  }
});
