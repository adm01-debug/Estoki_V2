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

    const { action, config, data } = await req.json();

    if (!action || !config?.base_url || !config?.token) {
      throw new Error("action, config.base_url e config.token são obrigatórios");
    }

    const headers = {
      "Authorization": `Bearer ${config.token}`,
      "Content-Type": "application/json",
    };

    let result: any;
    const baseUrl = config.base_url.replace(/\/$/, "");

    switch (action) {
      case "get_products":
        const productsResp = await fetch(
          `${baseUrl}/api/v1/products?page=${data?.page || 1}&pageSize=${data?.pageSize || 100}`,
          { headers }
        );
        result = await productsResp.json();
        break;

      case "get_product":
        if (!data?.product_id) throw new Error("product_id é obrigatório");
        const productResp = await fetch(
          `${baseUrl}/api/v1/products/${data.product_id}`,
          { headers }
        );
        result = await productResp.json();
        break;

      case "update_stock":
        if (!data?.product_id || !data?.warehouse_id || data?.quantity === undefined) {
          throw new Error("product_id, warehouse_id e quantity são obrigatórios");
        }
        const stockResp = await fetch(`${baseUrl}/api/v1/stock/movements`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            productId: data.product_id,
            warehouseId: data.warehouse_id,
            quantity: data.quantity,
            movementType: data.quantity > 0 ? "IN" : "OUT",
            documentNumber: data.document_number,
          }),
        });
        result = await stockResp.json();
        break;

      case "get_orders":
        const ordersResp = await fetch(
          `${baseUrl}/api/v1/orders?status=${data?.status || "all"}&page=${data?.page || 1}`,
          { headers }
        );
        result = await ordersResp.json();
        break;

      case "create_order":
        if (!data?.customer_id || !data?.items) {
          throw new Error("customer_id e items são obrigatórios");
        }
        const orderResp = await fetch(`${baseUrl}/api/v1/orders`, {
          method: "POST",
          headers,
          body: JSON.stringify({
            customerId: data.customer_id,
            items: data.items,
            paymentCondition: data.payment_condition,
            notes: data.notes,
          }),
        });
        result = await orderResp.json();
        break;

      case "get_customers":
        const customersResp = await fetch(
          `${baseUrl}/api/v1/customers?page=${data?.page || 1}&pageSize=${data?.pageSize || 100}`,
          { headers }
        );
        result = await customersResp.json();
        break;

      case "sync_inventory":
        // Sincronizar inventário com TOTVS
        const { data: localProducts } = await supabase
          .from("products")
          .select("id, sku, totvs_product_id, stock_quantity")
          .not("totvs_product_id", "is", null);

        const syncResults = [];
        for (const product of localProducts || []) {
          if (product.totvs_product_id) {
            const syncResp = await fetch(`${baseUrl}/api/v1/stock/sync`, {
              method: "POST",
              headers,
              body: JSON.stringify({
                productId: product.totvs_product_id,
                quantity: product.stock_quantity,
              }),
            });
            syncResults.push({
              sku: product.sku,
              totvs_id: product.totvs_product_id,
              synced: syncResp.ok,
            });
          }
        }
        result = { synced: syncResults.length, details: syncResults };
        break;

      default:
        throw new Error(`Ação desconhecida: ${action}`);
    }

    await supabase.from("integration_logs").insert({
      integration: "totvs_protheus",
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
