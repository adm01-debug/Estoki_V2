import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: products, error } = await supabase.from("products").select("id, name, sku, stock_quantity, reorder_point, reorder_quantity").lte("stock_quantity", supabase.rpc("get_reorder_point")).gt("reorder_point", 0);
    if (error) {
      const { data: allProducts } = await supabase.from("products").select("id, name, sku, stock_quantity, reorder_point, reorder_quantity").gt("reorder_point", 0);
      const lowStock = allProducts?.filter(p => p.stock_quantity <= p.reorder_point) || [];
      return new Response(JSON.stringify({ alerts: lowStock.length, products: lowStock }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }
    return new Response(JSON.stringify({ alerts: products?.length || 0, products }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
