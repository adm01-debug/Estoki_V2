import { createBulkHandler } from "../_shared/bulk.ts";
import { BatchProcessorSchema } from "../_shared/schemas.ts";

Deno.serve(
  createBulkHandler(BatchProcessorSchema, (body) => ({
    success: true,
    function: "batch-processor",
    timestamp: new Date().toISOString(),
    ...body,
  }))
);
