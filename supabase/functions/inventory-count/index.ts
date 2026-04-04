import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  
  try {
    const { action, data } = await req.json();
    
    switch (action) {
      case "create": {
        const { name, type = "full", location_ids, category_ids, user_id } = data;
        const { data: count, error } = await supabase.from("inventory_counts").insert({ name, type, status: "draft", location_ids, category_ids, created_by: user_id }).select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, count }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
      }
      case "generate_items": {
        const { count_id } = data;
        const { data: count } = await supabase.from("inventory_counts").select("*").eq("id", count_id).single();
        if (!count) throw new Error("Contagem nao encontrada");
        
        let query = supabase.from("stock_balances").select("product_id, location_id, quantity");
        if (count.location_ids?.length) query = query.in("location_id", count.location_ids);
        const { data: balances } = await query;
        
        const items = balances?.map((b: any) => ({ count_id, product_id: b.product_id, location_id: b.location_id, system_quantity: b.quantity, counted_quantity: null, status: "pending" })) || [];
        await supabase.from("inventory_count_items").insert(items);
        await supabase.from("inventory_counts").update({ status: "in_progress", total_items: items.length }).eq("id", count_id);
        
        return new Response(JSON.stringify({ success: true, itemsCreated: items.length }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
      }
      case "register_count": {
        const { item_id, counted_quantity, user_id } = data;
        const { data: item } = await supabase.from("inventory_count_items").select("*").eq("id", item_id).single();
        if (!item) throw new Error("Item nao encontrado");
        
        const variance = counted_quantity - item.system_quantity;
        await supabase.from("inventory_count_items").update({ counted_quantity, variance, status: "counted", counted_by: user_id, counted_at: new Date().toISOString() }).eq("id", item_id);
        
        return new Response(JSON.stringify({ success: true, variance }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
      }
      case "apply_adjustments": {
        const { count_id, user_id } = data;
        const { data: items } = await supabase.from("inventory_count_items").select("*").eq("count_id", count_id).neq("variance", 0);
        
        for (const item of items || []) {
          await supabase.from("stock_balances").update({ quantity: item.counted_quantity }).eq("product_id", item.product_id).eq("location_id", item.location_id);
          await supabase.from("stock_movements").insert({ product_id: item.product_id, to_location_id: item.location_id, quantity: item.variance, type: "adjustment", reference_type: "inventory_count", reference_id: count_id, user_id });
        }
        
        await supabase.from("inventory_counts").update({ status: "completed", completed_at: new Date().toISOString() }).eq("id", count_id);
        return new Response(JSON.stringify({ success: true, adjustments: items?.length }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
      }
      default: throw new Error("Acao desconhecida");
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
