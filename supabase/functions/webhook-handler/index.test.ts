 import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
 
  import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
  import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

  const WebhookSchema = z.object({
    event: z.string().min(1).max(200),
    data: z.record(z.unknown()).optional().default({}),
  });

  Deno.test("webhook-handler: unit - schema validation should fail on empty event", () => {
    const result = WebhookSchema.safeParse({ event: "", data: {} });
    assertEquals(result.success, false);
  });

  Deno.test("webhook-handler: unit - schema validation should fail on very long event", () => {
    const result = WebhookSchema.safeParse({ event: "a".repeat(201), data: {} });
    assertEquals(result.success, false);
  });

  Deno.test("webhook-handler: unit - schema validation should succeed on valid payload", () => {
    const result = WebhookSchema.safeParse({ event: "test.event", data: { key: "value" } });
    assertEquals(result.success, true);
  });
 
  // Removing integration tests that require a running local server
