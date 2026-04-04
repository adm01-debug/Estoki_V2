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

    const tasks = [];
    const startTime = Date.now();

    // 1. Relatório semanal de estoque
    const { data: lowStock } = await supabase
      .from("products")
      .select("id, name, stock_quantity, min_stock")
      .lt("stock_quantity", supabase.raw("min_stock"))
      .limit(100);

    tasks.push({ task: "low_stock_report", items: lowStock?.length || 0 });

    // 2. Limpar logs antigos (> 30 dias)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    const { count: deletedLogs } = await supabase
      .from("activity_logs")
      .delete()
      .lt("created_at", thirtyDaysAgo);

    tasks.push({ task: "cleanup_logs", deleted: deletedLogs || 0 });

    // 3. Recalcular estatísticas
    const { data: stats } = await supabase.rpc("recalculate_weekly_stats");
    tasks.push({ task: "recalculate_stats", result: stats });

    // 4. Enviar resumo semanal
    const { data: activeUsers } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("weekly_digest", true);

    tasks.push({ task: "weekly_digest", recipients: activeUsers?.length || 0 });

    // Registrar execução
    await supabase.from("cron_logs").insert({
      job_name: "cron-weekly",
      executed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      tasks_completed: tasks.length,
      details: tasks,
    });

    return new Response(JSON.stringify({
      success: true,
      executed_at: new Date().toISOString(),
      duration_ms: Date.now() - startTime,
      tasks,
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
