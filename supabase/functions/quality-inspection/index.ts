import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { productId, inspectionType, results, userId } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const passed = results.every((r: any) => r.passed);
    const { data: inspection, error } = await supabase.from("quality_inspections").insert({ product_id: productId, inspection_type: inspectionType, results, passed, inspector_id: userId, status: passed ? "approved" : "rejected" }).select().single();
    if (error) throw error;
    if (!passed) { await supabase.from("products").update({ quality_status: "hold" }).eq("id", productId); }
    return new Response(JSON.stringify({ inspection, passed }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
