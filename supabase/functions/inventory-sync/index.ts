import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { warehouse_id, products, source = "manual" } = await req.json();

    if (!products || !Array.isArray(products)) {
      throw new Error("products array é obrigatório");
    }

    const results = { synced: 0, errors: 0, updates: [] as any[] };

    for (const product of products) {
      try {
        const { sku, quantity, location, batch, expiration_date } = product;

        // Buscar produto existente
        const { data: existing } = await supabase
          .from("inventory")
          .select("*")
          .eq("sku", sku)
          .eq("warehouse_id", warehouse_id || "default")
          .single();

        if (existing) {
          // Atualizar quantidade
          const { error } = await supabase
            .from("inventory")
            .update({
              quantity,
              location: location || existing.location,
              batch: batch || existing.batch,
              expiration_date: expiration_date || existing.expiration_date,
              last_sync_at: new Date().toISOString(),
              sync_source: source,
            })
            .eq("id", existing.id);

          if (!error) {
            results.synced++;
            results.updates.push({ sku, action: "updated", old_qty: existing.quantity, new_qty: quantity });
          }
        } else {
          // Criar novo
          const { error } = await supabase
            .from("inventory")
            .insert({
              sku,
              quantity,
              warehouse_id: warehouse_id || "default",
              location,
              batch,
              expiration_date,
              last_sync_at: new Date().toISOString(),
              sync_source: source,
            });

          if (!error) {
            results.synced++;
            results.updates.push({ sku, action: "created", quantity });
          }
        }
      } catch (e) {
        results.errors++;
      }
    }

    // Log da sincronização
    await supabase.from("inventory_sync_logs").insert({
      warehouse_id,
      source,
      products_count: products.length,
      synced_count: results.synced,
      errors_count: results.errors,
    });

    return new Response(JSON.stringify({ success: true, results }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
