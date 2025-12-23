import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { warehouseId, zone } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let query = supabase.from("locations").select("*, location_stock(quantity, products(name, sku))");
    if (warehouseId) query = query.eq("warehouse_id", warehouseId);
    if (zone) query = query.eq("zone", zone);
    const { data: locations } = await query;
    const utilization = (locations || []).map(loc => {
      const totalCapacity = loc.max_capacity || 100;
      const currentOccupancy = loc.location_stock?.reduce((sum: number, s: any) => sum + s.quantity, 0) || 0;
      return { locationId: loc.id, code: loc.code, zone: loc.zone, aisle: loc.aisle, level: loc.level, capacity: totalCapacity, occupied: currentOccupancy, utilizationPercent: Math.round((currentOccupancy / totalCapacity) * 100), status: loc.status, items: loc.location_stock?.map((s: any) => ({ product: s.products?.name, quantity: s.quantity })) };
    });
    return new Response(JSON.stringify({ locations: utilization, summary: { total: utilization.length, avgUtilization: Math.round(utilization.reduce((sum, l) => sum + l.utilizationPercent, 0) / utilization.length), empty: utilization.filter(l => l.occupied === 0).length, full: utilization.filter(l => l.utilizationPercent >= 90).length } }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
