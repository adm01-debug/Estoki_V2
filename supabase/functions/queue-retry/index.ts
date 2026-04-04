import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: getCorsHeaders(req) });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { job_id, max_retries = 3, backoff_minutes = 5 } = await req.json();

    let query = supabase
      .from("job_queue")
      .select("*")
      .eq("status", "failed");

    if (job_id) {
      query = query.eq("id", job_id);
    } else {
      query = query.lt("attempts", max_retries);
    }

    const { data: failedJobs, error: fetchError } = await query;
    if (fetchError) throw fetchError;

    const retried = [];

    for (const job of failedJobs || []) {
      if (job.attempts >= max_retries) continue;

      const nextAttempt = new Date(Date.now() + backoff_minutes * 60 * 1000 * Math.pow(2, job.attempts));

      const { error: updateError } = await supabase
        .from("job_queue")
        .update({
          status: "pending",
          scheduled_at: nextAttempt.toISOString(),
          error: null,
          retry_count: (job.retry_count || 0) + 1,
        })
        .eq("id", job.id);

      if (!updateError) {
        retried.push({
          job_id: job.id,
          attempt: job.attempts + 1,
          scheduled_for: nextAttempt.toISOString(),
        });
      }
    }

    return new Response(JSON.stringify({
      success: true,
      retried_count: retried.length,
      jobs: retried,
    }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      status: 400,
    });
  }
});
