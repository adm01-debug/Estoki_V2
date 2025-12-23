import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { data, columns, filename = "export.xlsx" } = await req.json();
    const header = columns.join("\t");
    const rows = data.map((row: any) => columns.map((col: string) => row[col] ?? "").join("\t"));
    const tsv = [header, ...rows].join("\n");
    return new Response(tsv, { headers: { ...corsHeaders, "Content-Type": "application/vnd.ms-excel", "Content-Disposition": `attachment; filename="${filename}"` } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
