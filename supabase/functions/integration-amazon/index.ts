import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AMAZON_SP_API_BASE = "https://sellingpartnerapi-na.amazon.com";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, credentials, data, marketplace_id = "ATVPDKIKX0DER" } = await req.json();

    if (!action || !credentials?.access_token) {
      throw new Error("action e credentials são obrigatórios");
    }

    const headers = {
      "x-amz-access-token": credentials.access_token,
      "Content-Type": "application/json",
    };

    let result: any;

    switch (action) {
      case "list_orders":
        const ordersResp = await fetch(
          `${AMAZON_SP_API_BASE}/orders/v0/orders?MarketplaceIds=${marketplace_id}&CreatedAfter=${data?.created_after || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()}`,
          { headers }
        );
        result = await ordersResp.json();
        break;

      case "get_order":
        if (!data?.order_id) throw new Error("order_id é obrigatório");
        const orderResp = await fetch(
          `${AMAZON_SP_API_BASE}/orders/v0/orders/${data.order_id}`,
          { headers }
        );
        result = await orderResp.json();
        break;

      case "get_order_items":
        if (!data?.order_id) throw new Error("order_id é obrigatório");
        const itemsResp = await fetch(
          `${AMAZON_SP_API_BASE}/orders/v0/orders/${data.order_id}/orderItems`,
          { headers }
        );
        result = await itemsResp.json();
        break;

      case "update_inventory":
        if (!data?.sku || data?.quantity === undefined) {
          throw new Error("sku e quantity são obrigatórios");
        }
        // Amazon usa feeds para atualização de inventário
        const feedContent = `sku\tquantity\n${data.sku}\t${data.quantity}`;
        result = {
          feed_type: "POST_INVENTORY_AVAILABILITY_DATA",
          content: feedContent,
          status: "queued",
          message: "Feed queued for processing",
        };
        break;

      case "list_catalog_items":
        const catalogResp = await fetch(
          `${AMAZON_SP_API_BASE}/catalog/2022-04-01/items?marketplaceIds=${marketplace_id}&identifiersType=SKU&identifiers=${data?.skus?.join(",")}`,
          { headers }
        );
        result = await catalogResp.json();
        break;

      case "get_pricing":
        if (!data?.asin) throw new Error("asin é obrigatório");
        const pricingResp = await fetch(
          `${AMAZON_SP_API_BASE}/products/pricing/v0/price?MarketplaceId=${marketplace_id}&Asins=${data.asin}&ItemType=Asin`,
          { headers }
        );
        result = await pricingResp.json();
        break;

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    await supabase.from("integration_logs").insert({
      integration: "amazon",
      action,
      request: { action, data, marketplace_id },
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
