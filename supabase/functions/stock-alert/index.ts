import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Buscar todos os produtos com estoque (min_stock é coluna real de products)
    const { data: products, error } = await supabase
      .from("products")
      .select("id, name, sku, current_stock, min_stock, category")
      .order("name");
    if (error) throw error;

    // Filtro em memória: supabase.rpc()/raw() não existem no supabase-js v2
    const lowStock = (products || []).filter(
      (p) => p.min_stock != null && p.min_stock > 0 && p.current_stock < p.min_stock
    );
    const outOfStock = (products || []).filter((p) => p.current_stock === 0);

    // Não duplicar: considerar apenas o último alerta aberto por produto+tipo
    const { data: pending } = await supabase
      .from("stock_alerts")
      .select("product_id, type, created_at")
      .eq("status", "open")
      .order("created_at", { ascending: false });
    const lastOpen = new Map();
    for (const a of pending || []) {
      const key = `${a.product_id}|${a.type}`;
      if (!lastOpen.has(key)) lastOpen.set(key, a.created_at);
    }

    // Criar alertas (sem duplicar abertos)
    const alerts = [
      ...(lowStock || [])
        .filter((p) => lastOpen.get(`${p.id}|low_stock`) == null)
        .map((p) => ({
          product_id: p.id,
          type: "low_stock",
          message: `Estoque baixo: ${p.name} (${p.current_stock}/${p.min_stock})`,
          severity: "warning",
        })),
      ...(outOfStock || [])
        .filter((p) => lastOpen.get(`${p.id}|out_of_stock`) == null)
        .map((p) => ({
          product_id: p.id,
          type: "out_of_stock",
          message: `Sem estoque: ${p.name}`,
          severity: "critical",
        })),
    ];

    if (alerts.length > 0) {
      await supabase.from("stock_alerts").insert(alerts);
    }

    return new Response(
      JSON.stringify({
        success: true,
        alerts_created: alerts.length,
        low_stock: lowStock.length,
        out_of_stock: outOfStock.length,
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
