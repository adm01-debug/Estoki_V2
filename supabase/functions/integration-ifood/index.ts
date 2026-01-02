import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const IFOOD_API_BASE = "https://merchant-api.ifood.com.br";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, credentials, data } = await req.json();

    if (!action || !credentials?.access_token) {
      throw new Error("action e credentials são obrigatórios");
    }

    const headers = {
      "Authorization": `Bearer ${credentials.access_token}`,
      "Content-Type": "application/json",
    };

    let result: any;

    switch (action) {
      case "get_merchants":
        const merchantsResp = await fetch(`${IFOOD_API_BASE}/merchant/v1.0/merchants`, { headers });
        result = await merchantsResp.json();
        break;

      case "get_orders":
        if (!data?.merchant_id) throw new Error("merchant_id é obrigatório");
        const ordersResp = await fetch(
          `${IFOOD_API_BASE}/order/v1.0/events:polling`,
          { headers }
        );
        result = await ordersResp.json();
        break;

      case "get_order_details":
        if (!data?.order_id) throw new Error("order_id é obrigatório");
        const orderResp = await fetch(
          `${IFOOD_API_BASE}/order/v1.0/orders/${data.order_id}`,
          { headers }
        );
        result = await orderResp.json();
        break;

      case "confirm_order":
        if (!data?.order_id) throw new Error("order_id é obrigatório");
        const confirmResp = await fetch(
          `${IFOOD_API_BASE}/order/v1.0/orders/${data.order_id}/confirm`,
          { method: "POST", headers }
        );
        result = { confirmed: confirmResp.ok };
        break;

      case "dispatch_order":
        if (!data?.order_id) throw new Error("order_id é obrigatório");
        const dispatchResp = await fetch(
          `${IFOOD_API_BASE}/order/v1.0/orders/${data.order_id}/dispatch`,
          { method: "POST", headers }
        );
        result = { dispatched: dispatchResp.ok };
        break;

      case "update_item_availability":
        if (!data?.merchant_id || !data?.item_id || data?.available === undefined) {
          throw new Error("merchant_id, item_id e available são obrigatórios");
        }
        const availResp = await fetch(
          `${IFOOD_API_BASE}/catalog/v2.0/merchants/${data.merchant_id}/items/${data.item_id}/status`,
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
      integration: "ifood",
      action,
      request: { action, data },
      response: result,
      created_at: new Date().toISOString(),
    }).catch(() => {});

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
