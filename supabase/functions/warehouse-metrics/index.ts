import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { warehouseId } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: locations } = await supabase.from("locations").select("*").eq("warehouse_id", warehouseId);
    const { data: todayMovements } = await supabase.from("stock_movements").select("*").gte("created_at", new Date().toISOString().split("T")[0]);
    const { data: pendingPicks } = await supabase.from("pick_orders").select("*").eq("status", "pending");
    const { data: pendingPutaway } = await supabase.from("putaway_orders").select("*").eq("status", "pending");
    const totalLocations = locations?.length || 0;
    const occupiedLocations = locations?.filter(l => l.status === "occupied").length || 0;
    return new Response(JSON.stringify({
      utilization: totalLocations > 0 ? Math.round((occupiedLocations / totalLocations) * 100) : 0,
      totalLocations, occupiedLocations, availableLocations: totalLocations - occupiedLocations,
      todayMovements: todayMovements?.length || 0,
      pendingPicks: pendingPicks?.length || 0,
      pendingPutaway: pendingPutaway?.length || 0,
      zones: [...new Set(locations?.map(l => l.zone))].map(zone => ({ zone, count: locations?.filter(l => l.zone === zone).length || 0, occupied: locations?.filter(l => l.zone === zone && l.status === "occupied").length || 0 }))
    }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
