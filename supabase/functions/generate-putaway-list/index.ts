import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders } from "../_shared/cors.ts";
import { GeneratePutawayListSchema, validateInput } from "../_shared/schemas.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  const headers = { ...getCorsHeaders(req), "Content-Type": "application/json" };
  try {
    const raw = await req.json().catch(() => ({}));
    const v = validateInput(GeneratePutawayListSchema, raw);
    if (!v.success) return new Response(JSON.stringify(v), { status: 400, headers });
    const { receivingId, items } = v.data;
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const putawayList = [];
    for (const item of items) {
      const { data: location } = await supabase
        .from("locations")
        .select("*")
        .eq("zone", item.preferredZone || "A")
        .eq("status", "available")
        .order("occupancy")
        .limit(1)
        .single();
      if (!location) {
        const { data: anyLoc } = await supabase
          .from("locations")
          .select("*")
          .eq("status", "available")
          .order("occupancy")
          .limit(1)
          .single();
        if (anyLoc) putawayList.push({ ...item, locationId: anyLoc.id, locationCode: anyLoc.code });
      } else {
        putawayList.push({ ...item, locationId: location.id, locationCode: location.code });
      }
    }
    const { data: putaway, error } = await supabase
      .from("putaway_orders")
      .insert({ receiving_id: receivingId, items: putawayList, status: "pending" })
      .select()
      .single();
    if (error) throw error;
    return new Response(JSON.stringify({ putawayOrder: putaway, items: putawayList }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
