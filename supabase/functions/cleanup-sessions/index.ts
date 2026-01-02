import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const { max_age_hours = 24, dry_run = false } = await req.json() || {};

    const cutoffDate = new Date(Date.now() - max_age_hours * 60 * 60 * 1000).toISOString();
    const results: any = { cleaned: {} };

    // 1. Limpar sessões expiradas
    if (!dry_run) {
      const { count: sessions } = await supabase
        .from("user_sessions")
        .delete()
        .lt("expires_at", new Date().toISOString());
      results.cleaned.sessions = sessions || 0;
    } else {
      const { count } = await supabase
        .from("user_sessions")
        .select("*", { count: "exact", head: true })
        .lt("expires_at", new Date().toISOString());
      results.cleaned.sessions = count || 0;
    }

    // 2. Limpar tokens temporários
    if (!dry_run) {
      const { count: tokens } = await supabase
        .from("temp_tokens")
        .delete()
        .lt("created_at", cutoffDate);
      results.cleaned.tokens = tokens || 0;
    }

    // 3. Limpar arquivos temporários
    if (!dry_run) {
      const { count: tempFiles } = await supabase
        .from("temp_files")
        .delete()
        .lt("created_at", cutoffDate);
      results.cleaned.temp_files = tempFiles || 0;
    }

    // 4. Limpar cache expirado
    if (!dry_run) {
      const { count: cache } = await supabase
        .from("cache_entries")
        .delete()
        .lt("expires_at", new Date().toISOString());
      results.cleaned.cache = cache || 0;
    }

    // Registrar execução
    if (!dry_run) {
      await supabase.from("cron_logs").insert({
        job_name: "cleanup-sessions",
        executed_at: new Date().toISOString(),
        details: results,
      });
    }

    const totalCleaned = Object.values(results.cleaned).reduce((a: number, b: any) => a + (b || 0), 0);

    return new Response(JSON.stringify({
      success: true,
      dry_run,
      cutoff_date: cutoffDate,
      total_cleaned: totalCleaned,
      details: results.cleaned,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
