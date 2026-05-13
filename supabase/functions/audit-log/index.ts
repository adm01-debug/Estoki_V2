import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  
  const supabase = createClient(Deno.env.get("SUPABASE_URL") ?? "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "");
  
  try {
    const { action, data } = await req.json();
    
    switch (action) {
      case "log": {
        const { user_id, action: auditAction, entity_type, entity_id, changes, metadata, ip_address } = data;
        const { data: log, error } = await supabase.from("audit_log").insert({ user_id, action: auditAction, entity_type, entity_id, changes, metadata, ip_address }).select().single();
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, log }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
      }
      case "query": {
        const { user_id, entity_type, entity_id, action: filterAction, start_date, end_date, limit = 100 } = data;
        let query = supabase.from("audit_log").select("*, user:profiles(full_name, email)").order("created_at", { ascending: false }).limit(limit);
        if (user_id) query = query.eq("user_id", user_id);
        if (entity_type) query = query.eq("entity_type", entity_type);
        if (entity_id) query = query.eq("entity_id", entity_id);
        if (filterAction) query = query.eq("action", filterAction);
        if (start_date) query = query.gte("created_at", start_date);
        if (end_date) query = query.lte("created_at", end_date);
        const { data: logs, error } = await query;
        if (error) throw error;
        return new Response(JSON.stringify({ success: true, logs }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
      }
      default: throw new Error("Unknown action");
    }
  } catch (error) {
    return new Response(JSON.stringify({ success: false, error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
