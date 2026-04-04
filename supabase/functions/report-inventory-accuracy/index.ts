import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { start_date, end_date, warehouse_id } = await req.json();
    const startDt = start_date || new Date(Date.now() - 30*24*60*60*1000).toISOString();
    const endDt = end_date || new Date().toISOString();
    
    // Dados do relatório específico
    const reportData = { report_type: "report-inventory-accuracy", period: { start: startDt, end: endDt }, warehouse_id, generated_at: new Date().toISOString() };
    
    // Salvar relatório
    const { data: report } = await supabase.from("reports").insert({
      type: "report-inventory-accuracy", parameters: { start_date: startDt, end_date: endDt, warehouse_id },
      data: reportData, status: "completed", generated_at: new Date().toISOString()
    }).select().single();

    return new Response(JSON.stringify({ success: true, report_id: report?.id, ...reportData }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
