import { createBulkHandler, mapWithConcurrency } from "../_shared/bulk.ts";
import { BulkUpdateSchema } from "../_shared/schemas.ts";

/** Concorrência limitada: paraleliza sem saturar o pool de conexões do Postgres. */
const CONCURRENCY = 10;

Deno.serve(
  createBulkHandler(BulkUpdateSchema, async ({ table, records, matchColumns }, supabase) => {
    const outcomes = await mapWithConcurrency(records, CONCURRENCY, async (record) => {
      const match: Record<string, unknown> = {};
      for (const col of matchColumns) match[col] = (record as Record<string, unknown>)[col];
      const { error } = await supabase.from(table).update(record).match(match);
      return !error;
    });
    return { updated: outcomes.filter(Boolean).length };
  })
);
