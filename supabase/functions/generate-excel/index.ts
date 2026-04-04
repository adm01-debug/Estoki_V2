import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders, handleCors } from "../_shared/cors.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const { data, columns, filename = "export.xlsx" } = await req.json();
    const header = columns.join("\t");
    const rows = data.map((row: any) => columns.map((col: string) => row[col] ?? "").join("\t"));
    const tsv = [header, ...rows].join("\n");
    return new Response(tsv, { headers: { ...getCorsHeaders(req), "Content-Type": "application/vnd.ms-excel", "Content-Disposition": `attachment; filename="${filename}"` } });
  } catch (error) { return new Response(JSON.stringify({ error: error.message }), { status: 400, headers: { ...getCorsHeaders(req), "Content-Type": "application/json" } }); }
});
