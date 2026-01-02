import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { table, columns = "*", filters = {}, format = "json", limit = 10000 } = await req.json();

    if (!table) throw new Error("table é obrigatório");

    let query = supabase.from(table).select(columns).limit(limit);
    Object.entries(filters).forEach(([key, value]) => { query = query.eq(key, value); });

    const { data, error } = await query;
    if (error) throw error;

    if (format === "csv") {
      if (!data || data.length === 0) return new Response("", { headers: { ...corsHeaders, "Content-Type": "text/csv" } });
      const headers = Object.keys(data[0]).join(",");
      const rows = data.map(row => Object.values(row).map(v => `"${String(v).replace(/"/g, '""')}"`).join(","));
      return new Response([headers, ...rows].join("\n"), {
        headers: { ...corsHeaders, "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${table}.csv"` },
      });
    }

    return new Response(JSON.stringify({ success: true, count: data?.length || 0, data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
});
