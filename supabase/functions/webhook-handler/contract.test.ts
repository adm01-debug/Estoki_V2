import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Testes de Contrato para o Webhook Handler
 * Garante que a estrutura de entrada e saída permaneça consistente.
 */

const WebhookSchema = z.object({
  event: z.string().min(1).max(200),
  data: z.record(z.unknown()).optional().default({}),
});

type WebhookInput = z.infer<typeof WebhookSchema>;

const mockProcess = (input: unknown) => {
  const result = WebhookSchema.safeParse(input);
  if (!result.success) {
    return {
      status: 400,
      body: { error: "Validation failed", details: result.error.flatten().fieldErrors },
    };
  }
  return { status: 200, body: { success: true, event: result.data.event } };
};

Deno.test("Contract: Valid Webhook Payload", () => {
  const validPayload: WebhookInput = {
    event: "order.created",
    data: { id: "ORD-123", amount: 100.5 },
  };

  const response = mockProcess(validPayload);
  assertEquals(response.status, 200);
  assertEquals(response.body.success, true);
  assertEquals(response.body.event, "order.created");
});

Deno.test("Contract: Missing Event field", () => {
  const invalidPayload = {
    data: { some: "info" },
  };

  const response = mockProcess(invalidPayload);
  assertEquals(response.status, 400);
  assertEquals(response.body.error, "Validation failed");
});

Deno.test("Contract: Event name too long (>200 chars)", () => {
  const invalidPayload = {
    event: "a".repeat(201),
    data: {},
  };

  const response = mockProcess(invalidPayload);
  assertEquals(response.status, 400);
});

Deno.test("Contract: Empty event name", () => {
  const invalidPayload = {
    event: "",
    data: {},
  };

  const response = mockProcess(invalidPayload);
  assertEquals(response.status, 400);
});

Deno.test("Contract: Data field must be an object", () => {
  const invalidPayload = {
    event: "test",
    data: "should_be_object",
  };

  const response = mockProcess(invalidPayload);
  assertEquals(response.status, 400);
});
