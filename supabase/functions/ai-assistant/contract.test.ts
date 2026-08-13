import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { AiAssistantSchema, validateInput } from "../_shared/schemas.ts";

Deno.test("ai-assistant: aceita mensagem válida", () => {
  const v = validateInput(AiAssistantSchema, { message: "Olá" });
  assertEquals(v.success, true);
});

Deno.test("ai-assistant: rejeita mensagem vazia", () => {
  const v = validateInput(AiAssistantSchema, { message: "" });
  assertEquals(v.success, false);
});

Deno.test("ai-assistant: rejeita mensagem gigante (>8k)", () => {
  const v = validateInput(AiAssistantSchema, { message: "a".repeat(8001) });
  assertEquals(v.success, false);
});