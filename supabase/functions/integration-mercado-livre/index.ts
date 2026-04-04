import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

const ML_API_BASE = "https://api.mercadolibre.com";

interface MLCredentials {
  access_token: string;
  refresh_token?: string;
  user_id: string;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, credentials, data } = await req.json();

    if (!action || !credentials?.access_token) {
      throw new Error("action e credentials.access_token são obrigatórios");
    }

    const headers = {
      "Authorization": `Bearer ${credentials.access_token}`,
      "Content-Type": "application/json",
    };

    let result: any;

    switch (action) {
      case "get_user":
        const userResp = await fetch(`${ML_API_BASE}/users/me`, { headers });
        result = await userResp.json();
        break;

      case "list_orders":
        const ordersResp = await fetch(
          `${ML_API_BASE}/orders/search?seller=${credentials.user_id}&sort=date_desc`,
          { headers }
        );
        result = await ordersResp.json();
        break;

      case "get_order":
        if (!data?.order_id) throw new Error("order_id é obrigatório");
        const orderResp = await fetch(`${ML_API_BASE}/orders/${data.order_id}`, { headers });
        result = await orderResp.json();
        break;

      case "list_items":
        const itemsResp = await fetch(
          `${ML_API_BASE}/users/${credentials.user_id}/items/search`,
          { headers }
        );
        result = await itemsResp.json();
        break;

      case "update_stock":
        if (!data?.item_id || data?.available_quantity === undefined) {
          throw new Error("item_id e available_quantity são obrigatórios");
        }
        const stockResp = await fetch(`${ML_API_BASE}/items/${data.item_id}`, {
          method: "PUT",
          headers,
          body: JSON.stringify({ available_quantity: data.available_quantity }),
        });
        result = await stockResp.json();
        break;

      case "get_shipment":
        if (!data?.shipment_id) throw new Error("shipment_id é obrigatório");
        const shipResp = await fetch(`${ML_API_BASE}/shipments/${data.shipment_id}`, { headers });
        result = await shipResp.json();
        break;

      case "sync_products":
        // Sincronizar produtos com estoque local
        const { data: localProducts } = await supabase
          .from("products")
          .select("id, sku, ml_item_id, stock_quantity")
          .not("ml_item_id", "is", null);

        const syncResults = [];
        for (const product of localProducts || []) {
          if (product.ml_item_id) {
            const syncResp = await fetch(`${ML_API_BASE}/items/${product.ml_item_id}`, {
              method: "PUT",
              headers,
              body: JSON.stringify({ available_quantity: product.stock_quantity }),
            });
            syncResults.push({
              sku: product.sku,
              ml_item_id: product.ml_item_id,
              synced: syncResp.ok,
            });
          }
        }
        result = { synced: syncResults.length, details: syncResults };
        break;

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    // Log da integração
    await supabase.from("integration_logs").insert({
      integration: "mercado_livre",
      action,
      request: { action, data },
      response: result,
      created_at: new Date().toISOString(),
    }).catch(() => {});

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
