import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const tasks = { completed: [] as string[], failed: [] as string[] };

    // 1. Limpar sessões expiradas
    try {
      await supabase.from("sessions").delete().lt("expires_at", new Date().toISOString());
      tasks.completed.push("cleanup_sessions");
    } catch (e) { tasks.failed.push("cleanup_sessions"); }

    // 2. Verificar estoques baixos
    try {
      await supabase.functions.invoke("stock-alert");
      tasks.completed.push("stock_alerts");
    } catch (e) { tasks.failed.push("stock_alerts"); }

    // 3. Verificar vencimentos
    try {
      await supabase.functions.invoke("expiration-check", { body: { days_ahead: 30 } });
      tasks.completed.push("expiration_check");
    } catch (e) { tasks.failed.push("expiration_check"); }

    // 4. Processar fila de jobs
    try {
      await supabase.functions.invoke("queue-process", { body: { batch_size: 50 } });
      tasks.completed.push("queue_process");
    } catch (e) { tasks.failed.push("queue_process"); }

    // Log do cron
    await supabase.from("cron_logs").insert({
      cron_name: "daily", executed_at: new Date().toISOString(),
      tasks_completed: tasks.completed.length, tasks_failed: tasks.failed.length, details: tasks,
    });

    return new Response(JSON.stringify({ success: true, ...tasks }), {
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" }, status: 400 });
  }
});
