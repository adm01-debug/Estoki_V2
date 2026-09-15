import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
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

Deno.test("webhook-handler: unit - fuzzing - should handle nested invalid data", () => {
  const payload = {
    event: "nested.test",
    data: {
      nested: {
        array: [1, 2, "3"],
        active: true,
      },
    },
  };
  const result = WebhookSchema.safeParse(payload);
  assertEquals(result.success, true);
});
