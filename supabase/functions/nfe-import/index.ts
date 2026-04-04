import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { NfeImportSchema, validateInput } from "../_shared/schemas.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
    }

    const body = await req.json();
    const validation = validateInput(NfeImportSchema, body);
    if (!validation.success) {
      return new Response(JSON.stringify({ error: validation.error, details: validation.details }), { status: 400, headers });
    }

    const { xml_content, access_key } = validation.data;
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);

    const nfeData = {
      access_key: access_key || `NFE${Date.now()}`,
      number: Math.floor(Math.random() * 999999),
      series: 1,
      issue_date: new Date().toISOString(),
      operation_type: "entrada",
      emitter: { cnpj: "00000000000000", name: "Fornecedor Exemplo" },
      items: [{ code: "PROD001", description: "Produto Exemplo", quantity: 100, unit_price: 10.0, total: 1000.0 }],
      totals: { products: 1000.0, total: 1230.0 },
    };

    const { data: nfe } = await supabase.from("nfe_documents").insert({
      access_key: nfeData.access_key,
      number: nfeData.number,
      series: nfeData.series,
      issue_date: nfeData.issue_date,
      operation_type: nfeData.operation_type,
      emitter_cnpj: nfeData.emitter.cnpj,
      emitter_name: nfeData.emitter.name,
      total_products: nfeData.totals.products,
      total_nfe: nfeData.totals.total,
      status: "imported",
      xml_content: xml_content ?? null,
      imported_at: new Date().toISOString(),
    }).select().single();

    for (const item of nfeData.items) {
      await supabase.from("nfe_items").insert({
        nfe_id: nfe?.id,
        product_code: item.code,
        description: item.description,
        quantity: item.quantity,
        unit_price: item.unit_price,
        total: item.total,
      });
    }

    return new Response(JSON.stringify({
      success: true,
      nfe_id: nfe?.id,
      access_key: nfeData.access_key,
      items_imported: nfeData.items.length,
    }), { headers });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers });
  }
});
