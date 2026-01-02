import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { table, data, mode = "insert", unique_key } = await req.json();

    if (!table || !data || !Array.isArray(data)) throw new Error("table e data[] são obrigatórios");

    const results = { inserted: 0, updated: 0, errors: 0, details: [] as any[] };
    const batchSize = 100;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      try {
        if (mode === "upsert" && unique_key) {
          const { error } = await supabase.from(table).upsert(batch, { onConflict: unique_key });
          if (!error) results.updated += batch.length;
        } else {
          const { error } = await supabase.from(table).insert(batch);
          if (!error) results.inserted += batch.length;
        }
      } catch (e) {
        results.errors += batch.length;
      }
    }

    return new Response(JSON.stringify({ success: true, ...results }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
  }
});
