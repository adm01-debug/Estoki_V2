import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { xml_content, access_key } = await req.json();
    if (!xml_content && !access_key) return new Response(JSON.stringify({ error: "xml_content or access_key required" }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });

    // Simular parsing de XML da NF-e (em produção usaria biblioteca XML)
    const nfeData = {
      access_key: access_key || `NFE${Date.now()}`, number: Math.floor(Math.random() * 999999),
      series: 1, issue_date: new Date().toISOString(), operation_type: "entrada",
      emitter: { cnpj: "00000000000000", name: "Fornecedor Exemplo", ie: "123456789" },
      recipient: { cnpj: "11111111111111", name: "ESTOKI WMS" },
      items: [{ code: "PROD001", description: "Produto Exemplo", quantity: 100, unit_price: 10.00, total: 1000.00 }],
      totals: { products: 1000.00, icms: 180.00, ipi: 50.00, total: 1230.00 }
    };

    const { data: nfe } = await supabase.from("nfe_documents").insert({
      access_key: nfeData.access_key, number: nfeData.number, series: nfeData.series,
      issue_date: nfeData.issue_date, operation_type: nfeData.operation_type,
      emitter_cnpj: nfeData.emitter.cnpj, emitter_name: nfeData.emitter.name,
      total_products: nfeData.totals.products, total_nfe: nfeData.totals.total,
      status: "imported", xml_content, imported_at: new Date().toISOString()
    }).select().single();

    for (const item of nfeData.items) {
      await supabase.from("nfe_items").insert({ nfe_id: nfe?.id, product_code: item.code, description: item.description, quantity: item.quantity, unit_price: item.unit_price, total: item.total });
    }

    return new Response(JSON.stringify({ success: true, nfe_id: nfe?.id, access_key: nfeData.access_key, items_imported: nfeData.items.length }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
