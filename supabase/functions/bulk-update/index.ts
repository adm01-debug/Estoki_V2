import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: getCorsHeaders(req) });
  try {
    const { table, records, matchColumns } = await req.json();
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    let updated = 0;
    for (const record of records) {
      const match = matchColumns.reduce((acc: any, col: string) => ({ ...acc, [col]: record[col] }), {});
      const { error } = await supabase.from(table).update(record).match(match);
      if (!error) updated++;
    }
    return new Response(JSON.stringify({ updated }), { headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } });
  }
});
