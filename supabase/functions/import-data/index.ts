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
];

const ImportSchema = z.object({
  table: z.string().min(1).max(100),
  data: z.array(z.record(z.unknown())).min(1).max(10000),
  mode: z.enum(["insert", "upsert"]).default("insert"),
  unique_key: z.string().max(100).optional(),
});

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: getCorsHeaders(req) });
  if (req.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const parsed = ImportSchema.safeParse(await req.json());
    if (!parsed.success) {
      return jsonResponse({ error: "Validation failed", details: parsed.error.flatten().fieldErrors }, 400);
    }

    const { table, data, mode, unique_key } = parsed.data;

    if (!ALLOWED_TABLES.includes(table)) {
      return jsonResponse({ error: `Table '${table}' is not allowed for import` }, 403);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const results = { inserted: 0, updated: 0, errors: 0, errorDetails: [] as string[] };
    const batchSize = 100;

    for (let i = 0; i < data.length; i += batchSize) {
      const batch = data.slice(i, i + batchSize);
      try {
        if (mode === "upsert" && unique_key) {
          const { error } = await supabase.from(table).upsert(batch as any[], { onConflict: unique_key });
          if (error) { results.errors += batch.length; results.errorDetails.push(error.message); }
          else results.updated += batch.length;
        } else {
          const { error } = await supabase.from(table).insert(batch as any[]);
          if (error) { results.errors += batch.length; results.errorDetails.push(error.message); }
          else results.inserted += batch.length;
        }
      } catch (e) {
        results.errors += batch.length;
        results.errorDetails.push(String(e));
      }
    }

    return jsonResponse({ success: true, ...results });
  } catch (error) {
    console.error("import-data error:", error);
    return jsonResponse({ error: "Internal server error" }, 500);
  }
});
