import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { limit = 10 } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { data: jobs, error } = await supabase.from("job_queue").select("*").eq("status", "pending").lte("scheduled_for", new Date().toISOString()).order("priority", { ascending: false }).order("created_at").limit(limit);
    if (error) throw error;
    for (const job of jobs || []) {
      await supabase.from("job_queue").update({ status: "processing", started_at: new Date().toISOString() }).eq("id", job.id);
    }
    return new Response(JSON.stringify({ jobs: jobs || [] }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
