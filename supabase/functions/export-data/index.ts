import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

import { getCorsHeaders, handleCors } from "../_shared/cors.ts";

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...getCorsHeaders(req), "Content-Type": "application/json" },
  });

const ALLOWED_TABLES = [
  "produtos", "lotes", "posicoes_estoque", "estoque_posicao",
  "fornecedor_scores", "alertas_config", "metas_kpi",
  "metricas_operacionais", "inventario_ciclos",
];

const ExportSchema = z.object({
  table: z.string().min(1).max(100),
  columns: z.string().max(500).default("*"),
  filters: z.record(z.unknown()).default({}),
  format: z.enum(["json", "csv"]).default("json"),
  limit: z.number().int().min(1).max(10000).default(10000),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const parsed = ExportSchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, 400);
    }

    const { table, columns, filters, format, limit } = parsed.data;

    if (!ALLOWED_TABLES.includes(table)) {
      return jsonResponse({ error: `Table '${table}' is not allowed for export` }, 403);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    let query = supabase.from(table).select(columns).limit(limit);
    Object.entries(filters).forEach(([key, value]) => {
      query = query.eq(key, value as string);
    });

    const { data, error } = await query;
    if (error) throw error;

    if (format === "csv") {
      if (!data || data.length === 0) {
        return new Response("", { headers: { ...getCorsHeaders(req), "Content-Type": "text/csv" } });
      }
      const headerRow = Object.keys(data[0]).join(",");
      const rows = data.map((row) =>
        Object.values(row).map((v) => `"${String(v ?? "").replace(/"/g, '""')}"`).join(",")
      );
      return new Response([headerRow, ...rows].join("\n"), {
        headers: {
          ...getCorsHeaders(req),
          "Content-Type": "text/csv",
          "Content-Disposition": `attachment; filename="${table}.csv"`,
        },
      });
    }

    return jsonResponse({ success: true, count: data?.length || 0, data });
  } catch (error) {
    console.error("export-data error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
