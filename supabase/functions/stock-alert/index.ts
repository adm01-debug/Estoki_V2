import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Buscar produtos com estoque baixo
    const { data: lowStock } = await supabase
      .from("products")
      .select("id, name, sku, current_stock, min_stock, category")
      .lt("current_stock", supabase.rpc("get_min_stock_threshold"));

    // Buscar produtos sem estoque
    const { data: outOfStock } = await supabase
      .from("products")
      .select("id, name, sku, category")
      .eq("current_stock", 0);

    // Criar alertas
    const alerts = [
      ...(lowStock || []).map(p => ({
        product_id: p.id,
        type: "low_stock",
        message: `Estoque baixo: ${p.name} (${p.current_stock}/${p.min_stock})`,
        severity: "warning",
      })),
      ...(outOfStock || []).map(p => ({
        product_id: p.id,
        type: "out_of_stock",
        message: `Sem estoque: ${p.name}`,
        severity: "critical",
      })),
    ];

    if (alerts.length > 0) {
      await supabase.from("stock_alerts").insert(alerts);
    }

    return new Response(JSON.stringify({
      success: true,
      alerts_created: alerts.length,
      low_stock: lowStock?.length || 0,
      out_of_stock: outOfStock?.length || 0,
    }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 400,
    });
  }
});
