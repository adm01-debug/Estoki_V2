import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { GenerateExcelSchema, validateInput } from "../_shared/schemas.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const raw = await req.json().catch(() => ({}));
    const v = validateInput(GenerateExcelSchema, raw);
    if (!v.success)
      return new Response(JSON.stringify(v), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    const { data, columns, filename = "export.xlsx" } = v.data;
    const header = columns.join("\t");
    const rows = data.map((row: any) => columns.map((col: string) => row[col] ?? "").join("\t"));
    const tsv = [header, ...rows].join("\n");
    return new Response(tsv, {
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "application/vnd.ms-excel",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
    });
  }
});
