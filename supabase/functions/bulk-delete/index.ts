import { createBulkHandler } from "../_shared/bulk.ts";
import { BulkDeleteSchema } from "../_shared/schemas.ts";

Deno.serve(
  createBulkHandler(BulkDeleteSchema, async ({ table, ids }, supabase) => {
    // `count: exact` devolve o número real de linhas removidas (antes vinha null).
    const { error, count } = await supabase
      .from(table)
      .delete({ count: "exact" })
      .in("id", ids);
    if (error) throw error;
    return { deleted: count };
  })
);
