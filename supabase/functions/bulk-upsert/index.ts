import { createBulkHandler } from "../_shared/bulk.ts";
import { BulkUpsertSchema } from "../_shared/schemas.ts";

Deno.serve(
  createBulkHandler(BulkUpsertSchema, async ({ table, records, conflictColumns }, supabase) => {
    const { data, error } = await supabase
      .from(table)
      .upsert(records, { onConflict: conflictColumns.join(",") })
      .select();
    if (error) throw error;
    return { upserted: data.length, data };
  })
);
