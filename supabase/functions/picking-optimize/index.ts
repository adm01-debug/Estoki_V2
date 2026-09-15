import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
import { GenericPayloadSchema, validateInput } from "../_shared/schemas.ts";
import { optimizeRoute, locationToPoint, routeLength, type Point } from "../_shared/tsp.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const __raw = await req.json();
    const __v = validateInput(GenericPayloadSchema, __raw);
    if (!__v.success) return new Response(JSON.stringify(__v), { status: 400, headers: { ...getCorsHeaders(req), 'Content-Type': 'application/json' } });
    const { order_ids, strategy = "zone" } = __raw;

    if (!order_ids || !Array.isArray(order_ids)) throw new Error("order_ids array é obrigatório");

    // Buscar itens dos pedidos
    const { data: items } = await supabase
      .from("order_items")
      .select("*, product:product_id(*, location:primary_location)")
      .in("order_id", order_ids);

    if (!items || items.length === 0) throw new Error("Nenhum item encontrado");

    // Agrupar itens por localização
    const locationGroups: Record<string, typeof items> = {};
    items.forEach((item) => {
      const loc = item.product?.location || "UNKNOWN";
      if (!locationGroups[loc]) locationGroups[loc] = [];
      locationGroups[loc].push(item);
    });

    // Ordem ingênua (baseline) — soma da distância percorrendo por ordem alfabética
    const rawOrder: Point[] = Object.keys(locationGroups)
      .sort()
      .map((loc) => locationToPoint(loc, loc));
    const baselineLen = routeLength(rawOrder);

    // Constrói pontos e roda TSP (Nearest Neighbor + 2-opt, multi-start)
    const points: Point[] = Object.keys(locationGroups).map((loc) =>
      locationToPoint(loc, loc)
    );
    const { route: optimized, length: optimizedLen, seeded } = optimizeRoute(points, {
      seeds: Math.min(5, points.length),
      refine: true,
    });

    // Sequenciar itens conforme rota otimizada
    const pickingList = optimized.flatMap((point, idx) =>
      locationGroups[point.id].map((item) => ({
        sequence: idx + 1,
        location: point.id,
        product_id: item.product_id,
        product_name: item.product?.name,
        sku: item.product?.sku,
        quantity: item.quantity,
        order_id: item.order_id,
      }))
    );

    const improvementPct = baselineLen > 0
      ? Math.max(0, ((baselineLen - optimizedLen) / baselineLen) * 100)
      : 0;

    // Salvar rota otimizada
    const { data: route } = await supabase
      .from("picking_routes")
      .insert({
        order_ids,
        strategy,
        items_count: pickingList.length,
        locations_count: optimized.length,
        status: "pending",
        optimized_at: new Date().toISOString(),
      })
      .select()
      .single();

    return new Response(
      JSON.stringify({
        success: true,
        route_id: route?.id,
        total_items: pickingList.length,
        total_locations: optimized.length,
        optimization: {
          algorithm: "nearest_neighbor + 2-opt",
          seeds: seeded,
          baseline_distance: Math.round(baselineLen),
          optimized_distance: Math.round(optimizedLen),
          improvement_pct: Number(improvementPct.toFixed(2)),
        },
        picking_list: pickingList,
      }),
      { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
