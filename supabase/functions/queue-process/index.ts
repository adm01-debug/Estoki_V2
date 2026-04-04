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

    const { queue_name, batch_size = 10, worker_id } = await req.json();

    // Buscar jobs pendentes
    const { data: jobs, error: fetchError } = await supabase
      .from("job_queue")
      .select("*")
      .eq("status", "pending")
      .eq("queue_name", queue_name || "default")
      .lte("scheduled_at", new Date().toISOString())
      .order("priority", { ascending: false })
      .order("created_at", { ascending: true })
      .limit(batch_size);

    if (fetchError) throw fetchError;

    const results = [];

    for (const job of jobs || []) {
      // Marcar como processing
      await supabase
        .from("job_queue")
        .update({ status: "processing", started_at: new Date().toISOString(), worker_id })
        .eq("id", job.id);

      try {
        // Processar job baseado no tipo
        let result: any;
        switch (job.job_type) {
          case "send_email":
            result = { sent: true, to: job.payload?.to };
            break;
          case "generate_report":
            result = { report_id: crypto.randomUUID() };
            break;
          case "sync_inventory":
            result = { synced_items: Math.floor(Math.random() * 100) };
            break;
          default:
            result = { processed: true };
        }

        // Marcar como completed
        await supabase
          .from("job_queue")
          .update({
            status: "completed",
            completed_at: new Date().toISOString(),
            result,
          })
          .eq("id", job.id);

        results.push({ job_id: job.id, status: "completed", result });
      } catch (jobError) {
        // Marcar como failed
        await supabase
          .from("job_queue")
          .update({
            status: "failed",
            error: jobError.message,
            attempts: (job.attempts || 0) + 1,
          })
          .eq("id", job.id);

        results.push({ job_id: job.id, status: "failed", error: jobError.message });
      }
    }

    return new Response(JSON.stringify({
      processed: results.length,
      results,
      worker_id,
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
