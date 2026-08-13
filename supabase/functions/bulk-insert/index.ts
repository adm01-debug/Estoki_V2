import { createBulkHandler } from "../_shared/bulk.ts";
import { BulkInsertSchema } from "../_shared/schemas.ts";

Deno.serve(
  createBulkHandler(BulkInsertSchema, async ({ table, records }, supabase) => {
    const { data, error } = await supabase.from(table).insert(records).select();
    if (error) throw error;
    return { inserted: data.length, data };
  })
);
