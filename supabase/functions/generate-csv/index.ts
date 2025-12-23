import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
const corsHeaders = { "Access-Control-Allow-Origin": "*", "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type" };
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const { data, columns, separator = ",", filename = "export.csv" } = await req.json();
    const header = columns.join(separator);
    const rows = data.map((row: any) => columns.map((col: string) => { const val = row[col] ?? ""; return val.toString().includes(separator) ? `"${val}"` : val; }).join(separator));
    const csv = [header, ...rows].join("\n");
    return new Response(csv, { headers: { ...corsHeaders, "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${filename}"` } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }); }
});
