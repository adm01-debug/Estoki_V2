import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { validateInput } from "../_shared/schemas.ts";
import { z } from "https://esm.sh/zod@3.23.8";
import { optimizeRoute, locationToPoint, routeLength, type Point } from "../_shared/tsp.ts";

const BodySchema = z.object({
  wave_id: z.string().uuid().optional(),
  order_ids: z.array(z.string().uuid()).optional(),
  seeds: z.number().int().min(1).max(10).optional(),
}).refine((d) => d.wave_id || (d.order_ids && d.order_ids.length > 0), {
  message: "Informe wave_id ou order_ids",
});

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };
  try {
    const raw = await req.json().catch(() => ({}));
    const v = validateInput(BodySchema, raw);
    if (!v.success) return new Response(JSON.stringify(v), { status: 400, headers });

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolver order_ids a partir de wave_id se necessário
    let orderIds = v.data.order_ids ?? [];
    if (v.data.wave_id && orderIds.length === 0) {
      const { data: wave } = await supabase
        .from("ondas_separacao")
        .select("pedidos_ids")
        .eq("id", v.data.wave_id)
        .maybeSingle();
      orderIds = (wave?.pedidos_ids as string[]) ?? [];
    }
    if (orderIds.length === 0) {
      return new Response(JSON.stringify({ error: "Nenhum pedido na onda" }), { status: 400, headers });
    }

    // Buscar itens com posição
    const { data: items } = await supabase
      .from("order_items")
      .select("order_id, product_id, quantity, product:product_id(sku, name, primary_location)")
      .in("order_id", orderIds);

    if (!items?.length) {
      return new Response(JSON.stringify({ error: "Nenhum item encontrado" }), { status: 400, headers });
    }

    const groups: Record<string, typeof items> = {};
    for (const it of items) {
      const loc = (it.product as { primary_location?: string } | null)?.primary_location || "UNKNOWN";
      (groups[loc] ??= []).push(it);
    }
    const locs = Object.keys(groups);
    const points: Point[] = locs.map((l) => locationToPoint(l, l));

    const baseline = routeLength(points);
    const { route, length, seeded } = optimizeRoute(points, {
      seeds: v.data.seeds ?? Math.min(5, points.length),
      refine: true,
    });

    const sequenced = route.flatMap((p, idx) =>
      groups[p.id].map((it) => ({
        sequence: idx + 1,
        location: p.id,
        order_id: it.order_id,
        product_id: it.product_id,
        sku: (it.product as { sku?: string } | null)?.sku,
        quantity: it.quantity,
      }))
    );

    // Persistir métricas se wave_id
    if (v.data.wave_id) {
      await supabase
        .from("ondas_separacao")
        .update({
          status: "otimizada",
          updated_at: new Date().toISOString(),
        })
        .eq("id", v.data.wave_id);
    }

    return new Response(JSON.stringify({
      success: true,
      wave_id: v.data.wave_id ?? null,
      total_orders: orderIds.length,
      total_items: sequenced.length,
      total_locations: route.length,
      optimization: {
        algorithm: "nearest_neighbor + 2-opt",
        seeds: seeded,
        baseline_distance: Math.round(baseline),
        optimized_distance: Math.round(length),
        improvement_pct: baseline > 0
          ? Number((((baseline - length) / baseline) * 100).toFixed(2))
          : 0,
      },
      sequence: sequenced,
    }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: (error as Error).message }), { status: 400, headers });
  }
});
