import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { data, columns, separator = ",", filename = "export.csv" } = await req.json();
    const header = columns.join(separator);
    const rows = data.map((row: any) => columns.map((col: string) => { const val = row[col] ?? ""; return val.toString().includes(separator) ? `"${val}"` : val; }).join(separator));
    const csv = [header, ...rows].join("\n");
    return new Response(csv, { headers: { ...getCorsHeaders(req), "Content-Type": "text/csv", "Content-Disposition": `attachment; filename="${filename}"` } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
