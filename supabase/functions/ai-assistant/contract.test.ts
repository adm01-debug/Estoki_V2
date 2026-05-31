import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";

/**
 * Testes de Contrato para o AI Assistant
 */

const AISchema = z.object({
  prompt: z.string().min(1).max(2000),
  context: z.record(z.unknown()).optional(),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string(),
      })
    )
    .optional(),
});

const mockAIProcess = (input: unknown) => {
  const result = AISchema.safeParse(input);
  if (!result.success) {
    return {
      status: 400,
      body: { error: "Invalid request", details: result.error.flatten().fieldErrors },
    };
  }
  return { status: 200, body: { response: "AI simulated response", thread_id: "test-thread" } };
};

Deno.test("AI Contract: Valid Prompt", () => {
  const payload = { prompt: "Como está o estoque de SKUs A?" };
  const response = mockAIProcess(payload);
  assertEquals(response.status, 200);
});

Deno.test("AI Contract: Valid History", () => {
  const payload = {
    prompt: "E agora?",
    history: [
      { role: "user", content: "Oi" },
      { role: "assistant", content: "Olá" },
    ],
  };
  const response = mockAIProcess(payload);
  assertEquals(response.status, 200);
});

Deno.test("AI Contract: Invalid Role in History", () => {
  const payload = {
    prompt: "E agora?",
    history: [{ role: "system", content: "Not allowed role" }],
  };
  const response = mockAIProcess(payload);
  assertEquals(response.status, 400);
});
