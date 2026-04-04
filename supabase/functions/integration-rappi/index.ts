import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

const RAPPI_API_BASE = "https://services.rappi.com.br";

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

    if (!action || !credentials?.api_key) {
      throw new Error("action e credentials são obrigatórios");
    }

    const headers = {
      "x-api-key": credentials.api_key,
      "Content-Type": "application/json",
    };

    let result: any;

    switch (action) {
      case "get_stores":
        const storesResp = await fetch(`${RAPPI_API_BASE}/api/v1/stores`, { headers });
        result = await storesResp.json();
        break;

      case "get_orders":
        if (!data?.store_id) throw new Error("store_id é obrigatório");
        const ordersResp = await fetch(
          `${RAPPI_API_BASE}/api/v1/stores/${data.store_id}/orders?status=${data?.status || "pending"}`,
          { headers }
        );
        result = await ordersResp.json();
        break;

      case "get_order":
        if (!data?.order_id) throw new Error("order_id é obrigatório");
        const orderResp = await fetch(
          `${RAPPI_API_BASE}/api/v1/orders/${data.order_id}`,
          { headers }
        );
        result = await orderResp.json();
        break;

      case "accept_order":
        if (!data?.order_id) throw new Error("order_id é obrigatório");
        const acceptResp = await fetch(
          `${RAPPI_API_BASE}/api/v1/orders/${data.order_id}/accept`,
          { method: "POST", headers }
        );
        result = { accepted: acceptResp.ok };
        break;

      case "reject_order":
        if (!data?.order_id || !data?.reason) throw new Error("order_id e reason são obrigatórios");
        const rejectResp = await fetch(
          `${RAPPI_API_BASE}/api/v1/orders/${data.order_id}/reject`,
          {
            method: "POST",
            headers,
            body: JSON.stringify({ reason: data.reason }),
          }
        );
        result = { rejected: rejectResp.ok };
        break;

      case "update_menu":
        if (!data?.store_id || !data?.items) throw new Error("store_id e items são obrigatórios");
        const menuResp = await fetch(
          `${RAPPI_API_BASE}/api/v1/stores/${data.store_id}/menu`,
          {
            method: "PUT",
            headers,
            body: JSON.stringify({ items: data.items }),
          }
        );
        result = await menuResp.json();
        break;

      case "update_availability":
        if (!data?.store_id || !data?.item_id || data?.available === undefined) {
          throw new Error("store_id, item_id e available são obrigatórios");
        }
        const availResp = await fetch(
          `${RAPPI_API_BASE}/api/v1/stores/${data.store_id}/items/${data.item_id}/availability`,
          {
            method: "PATCH",
            headers,
            body: JSON.stringify({ available: data.available }),
          }
        );
        result = { updated: availResp.ok };
        break;

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    await supabase.from("integration_logs").insert({
      integration: "rappi",
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
