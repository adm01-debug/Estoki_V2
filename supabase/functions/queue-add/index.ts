import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { queue_name, payload, priority = 5, delay_seconds = 0, max_retries = 3 } = await req.json();

    if (!queue_name || !payload) throw new Error("queue_name e payload são obrigatórios");

    const scheduledAt = new Date(Date.now() + delay_seconds * 1000);

    const { data: job, error } = await supabase.from("job_queue").insert({
      queue_name, payload, priority, max_retries, retry_count: 0,
      status: delay_seconds > 0 ? "scheduled" : "pending",
      scheduled_at: scheduledAt.toISOString(),
    }).select().single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, job_id: job.id, status: job.status, scheduled_at: job.scheduled_at }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 400 });
  }
});
