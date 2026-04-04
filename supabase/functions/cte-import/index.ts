import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { xml_content, access_key } = await req.json();
    if (!xml_content && !access_key) return new Response(JSON.stringify({ error: "xml_content or access_key required" }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });

    const cteData = {
      access_key: access_key || `CTE${Date.now()}`, number: Math.floor(Math.random() * 999999), series: 1,
      issue_date: new Date().toISOString(), modal: "rodoviario",
      emitter: { cnpj: "22222222222222", name: "Transportadora Exemplo", ie: "987654321" },
      sender: { cnpj: "00000000000000", name: "Remetente" },
      recipient: { cnpj: "11111111111111", name: "ESTOKI WMS" },
      cargo: { description: "Mercadorias", quantity: 10, weight: 500, value: 5000.00 },
      totals: { freight: 350.00, icms: 42.00, total: 392.00 }
    };

    const { data: cte } = await supabase.from("cte_documents").insert({
      access_key: cteData.access_key, number: cteData.number, series: cteData.series,
      issue_date: cteData.issue_date, modal: cteData.modal,
      emitter_cnpj: cteData.emitter.cnpj, emitter_name: cteData.emitter.name,
      sender_cnpj: cteData.sender.cnpj, sender_name: cteData.sender.name,
      recipient_cnpj: cteData.recipient.cnpj, recipient_name: cteData.recipient.name,
      cargo_description: cteData.cargo.description, cargo_weight: cteData.cargo.weight, cargo_value: cteData.cargo.value,
      freight_value: cteData.totals.freight, total_cte: cteData.totals.total,
      status: "imported", xml_content, imported_at: new Date().toISOString()
    }).select().single();

    return new Response(JSON.stringify({ success: true, cte_id: cte?.id, access_key: cteData.access_key }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
