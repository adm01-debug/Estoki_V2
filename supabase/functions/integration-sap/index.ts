import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { action, config, data } = await req.json();

    if (!action || !config?.base_url || !config?.session_id) {
      throw new Error("action, config.base_url e config.session_id são obrigatórios");
    }

    const headers = {
      "Cookie": `B1SESSION=${config.session_id}`,
      "Content-Type": "application/json",
    };

    let result: any;
    const baseUrl = config.base_url.replace(/\/$/, "");

    switch (action) {
      case "login":
        const loginResp = await fetch(`${baseUrl}/b1s/v1/Login`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            CompanyDB: config.company_db,
            UserName: config.username,
            Password: config.password,
          }),
        });
        result = await loginResp.json();
        break;

      case "get_items":
        const itemsResp = await fetch(
          `${baseUrl}/b1s/v1/Items?$select=ItemCode,ItemName,QuantityOnStock,AvgStdPrice&$top=${data?.limit || 100}`,
          { headers }
        );
        result = await itemsResp.json();
        break;

      case "get_item":
        if (!data?.item_code) throw new Error("item_code é obrigatório");
        const itemResp = await fetch(
          `${baseUrl}/b1s/v1/Items('${data.item_code}')`,
          { headers }
        );
        result = await itemResp.json();
        break;

      case "update_stock":
        if (!data?.item_code || data?.warehouse || data?.quantity === undefined) {
          throw new Error("item_code, warehouse e quantity são obrigatórios");
        }
        // SAP usa Goods Receipt/Issue para atualizar estoque
        const stockResp = await fetch(`${baseUrl}/b1s/v1/InventoryGenEntries`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            DocumentLines: [{
              ItemCode: data.item_code,
              WarehouseCode: data.warehouse,
              Quantity: data.quantity,
            }],
          }),
        });
        result = await stockResp.json();
        break;

      case "get_orders":
        const ordersResp = await fetch(
          `${baseUrl}/b1s/v1/Orders?$select=DocEntry,DocNum,CardCode,DocTotal,DocDate&$orderby=DocDate desc&$top=${data?.limit || 50}`,
          { headers }
        );
        result = await ordersResp.json();
        break;

      case "create_order":
        if (!data?.card_code || !data?.lines) {
          throw new Error("card_code e lines são obrigatórios");
        }
        const orderResp = await fetch(`${baseUrl}/b1s/v1/Orders`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            CardCode: data.card_code,
            DocumentLines: data.lines,
          }),
        });
        result = await orderResp.json();
        break;

      case "get_business_partners":
        const bpResp = await fetch(
          `${baseUrl}/b1s/v1/BusinessPartners?$select=CardCode,CardName,CardType,Phone1,EmailAddress&$top=${data?.limit || 100}`,
          { headers }
        );
        result = await bpResp.json();
        break;

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    await supabase.from("integration_logs").insert({
      integration: "sap_b1",
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
