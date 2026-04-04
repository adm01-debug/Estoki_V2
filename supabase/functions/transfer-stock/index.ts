import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { productId, fromLocation, toLocation, quantity, userId } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: fromStock, error: fErr } = await supabase.from("location_stock").select("*").eq("product_id", productId).eq("location_id", fromLocation).single();
    if (fErr || !fromStock || fromStock.quantity < quantity) throw new Error("Estoque insuficiente na origem");
    await supabase.from("location_stock").update({ quantity: fromStock.quantity - quantity }).eq("id", fromStock.id);
    const { data: toStock } = await supabase.from("location_stock").select("*").eq("product_id", productId).eq("location_id", toLocation).single();
    if (toStock) { await supabase.from("location_stock").update({ quantity: toStock.quantity + quantity }).eq("id", toStock.id); }
    else { await supabase.from("location_stock").insert({ product_id: productId, location_id: toLocation, quantity }); }
    const { data: transfer, error } = await supabase.from("stock_transfers").insert({ product_id: productId, from_location: fromLocation, to_location: toLocation, quantity, user_id: userId, status: "completed" }).select().single();
    if (error) throw error;
    return new Response(JSON.stringify({ transfer }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
