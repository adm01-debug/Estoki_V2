import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { getCorsHeaders } from "../_shared/cors.ts";
import { GenerateCsvSchema, validateInput } from "../_shared/schemas.ts";
serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  try {
    const raw = await req.json().catch(() => ({}));
    const v = validateInput(GenerateCsvSchema, raw);
    if (!v.success)
      return new Response(JSON.stringify(v), {
        status: 400,
        headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
      });
    const { data, columns, separator = ",", filename = "export.csv" } = v.data;
    const header = columns.join(separator);
    const rows = data.map((row: any) =>
      columns
        .map((col: string) => {
          const val = row[col] ?? "";
          return val.toString().includes(separator) ? `"${val}"` : val;
        })
        .join(separator)
    );
    const csv = [header, ...rows].join("\n");
    return new Response(csv, {
      headers: {
        ...getCorsHeaders(req),
        "Content-Type": "text/csv",
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
