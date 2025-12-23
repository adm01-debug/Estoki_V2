import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { productId, quantity, locationId, type, reference, userId } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: product, error: pErr } = await supabase.from("products").select("stock_quantity").eq("id", productId).single();
    if (pErr) throw pErr;
    const newQty = type === "IN" ? product.stock_quantity + quantity : product.stock_quantity - quantity;
    if (newQty < 0) throw new Error("Estoque insuficiente");
    await supabase.from("products").update({ stock_quantity: newQty }).eq("id", productId);
    const { data: movement, error } = await supabase.from("stock_movements").insert({ product_id: productId, quantity, type, location_id: locationId, reference, user_id: userId, previous_qty: product.stock_quantity, new_qty: newQty }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ movement, newStock: newQty }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
