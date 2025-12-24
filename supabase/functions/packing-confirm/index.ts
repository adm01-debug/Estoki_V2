import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
    const { packing_id, packages, packer_id } = await req.json();
    if (!packing_id || !packages?.length) return new Response(JSON.stringify({ error: "packing_id and packages required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    let totalWeight = 0, totalVolume = 0;
    for (const pkg of packages) {
      const { data: savedPkg } = await supabase.from("packing_packages").insert({
        packing_id, package_number: `PKG-${Date.now()}-${Math.random().toString(36).substr(2, 3)}`,
        weight: pkg.weight, length: pkg.length, width: pkg.width, height: pkg.height,
        volume: (pkg.length * pkg.width * pkg.height) / 1000000, items: pkg.items
      }).select().single();
      totalWeight += pkg.weight || 0;
      totalVolume += savedPkg?.volume || 0;
    }

    await supabase.from("packings").update({ status: "completed", completed_at: new Date().toISOString(), total_packages: packages.length, total_weight: totalWeight, total_volume: totalVolume }).eq("id", packing_id);
    const { data: packing } = await supabase.from("packings").select("order_id").eq("id", packing_id).single();
    if (packing?.order_id) await supabase.from("orders").update({ status: "ready_for_shipping" }).eq("id", packing.order_id);

    return new Response(JSON.stringify({ success: true, packages_created: packages.length, total_weight: totalWeight }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
