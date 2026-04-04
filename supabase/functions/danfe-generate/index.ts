import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { nfe_id, format = "pdf" } = await req.json();
    if (!nfe_id) return new Response(JSON.stringify({ error: "nfe_id required" }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });

    const { data: nfe } = await supabase.from("nfe_documents").select("*, items:nfe_items(*)").eq("id", nfe_id).single();
    if (!nfe) return new Response(JSON.stringify({ error: "NF-e not found" }), { status: 404, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });

    // Gerar estrutura DANFE (em produção geraria PDF real)
    const danfe = {
      header: { access_key: nfe.access_key, number: nfe.number, series: nfe.series, issue_date: nfe.issue_date, operation: "ENTRADA" },
      emitter: { cnpj: nfe.emitter_cnpj, name: nfe.emitter_name, ie: nfe.emitter_ie, address: nfe.emitter_address },
      recipient: { cnpj: nfe.recipient_cnpj, name: nfe.recipient_name, address: nfe.recipient_address },
      items: nfe.items?.map((i: any, idx: number) => ({ item: idx + 1, code: i.product_code, description: i.description, ncm: i.ncm, cfop: i.cfop, unit: i.unit, quantity: i.quantity, unit_price: i.unit_price, total: i.total })),
      totals: { products: nfe.total_products, icms_base: nfe.icms_base, icms_value: nfe.icms_value, total: nfe.total_nfe },
      transport: { carrier: nfe.carrier_name, vehicle: nfe.vehicle_plate, volumes: nfe.volumes, weight: nfe.total_weight },
      additional_info: nfe.additional_info,
      barcode: nfe.access_key
    };

    const fileName = `DANFE_${nfe.number}_${nfe.series}.${format}`;
    await supabase.from("nfe_documents").update({ danfe_generated: true, danfe_file: fileName }).eq("id", nfe_id);

    return new Response(JSON.stringify({ success: true, danfe, file_name: fileName, format }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
