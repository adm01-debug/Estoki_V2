import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    // Buscar produtos abaixo do ponto de reposição
    const { data: products } = await supabase
      .from("products")
      .select("*, supplier:supplier_id(id, name, email, lead_time_days)")
      .lte("current_stock", supabase.raw("reorder_point"));

    const suggestions = (products || []).map(p => {
      const safetyStock = p.safety_stock || 10;
      const avgDailySales = p.avg_daily_sales || 5;
      const leadTime = p.supplier?.lead_time_days || 7;
      const suggestedQty = Math.ceil((avgDailySales * leadTime) + safetyStock - p.current_stock);

      return {
        product_id: p.id,
        product_name: p.name,
        sku: p.sku,
        current_stock: p.current_stock,
        reorder_point: p.reorder_point,
        suggested_quantity: Math.max(suggestedQty, p.min_order_qty || 1),
        supplier_id: p.supplier?.id,
        supplier_name: p.supplier?.name,
        estimated_delivery: new Date(Date.now() + (leadTime * 86400000)).toISOString().split("T")[0],
      };
    });

    // Salvar sugestões
    if (suggestions.length > 0) {
      await supabase.from("reorder_suggestions").upsert(
        suggestions.map(s => ({ ...s, status: "pending", created_at: new Date().toISOString() })),
        { onConflict: "product_id" }
      );
    }

    return new Response(JSON.stringify({ success: true, suggestions }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400,
    });
  }
});
