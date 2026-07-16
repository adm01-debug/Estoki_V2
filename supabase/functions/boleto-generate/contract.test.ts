import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

const validPayload = {
  amount: 150.75,
  due_date: "2026-12-31",
  payer: { name: "João Silva", document: "12345678901" },
  description: "Fatura #1",
};

Deno.test("boleto-generate: payload válido", async () => {
  const { BoletoGenerateSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(BoletoGenerateSchema, validPayload);
  assertEquals(v.success, true);
});

Deno.test("boleto-generate: rejeita amount <= 0", async () => {
  const { BoletoGenerateSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(BoletoGenerateSchema, { ...validPayload, amount: 0 });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.amount, undefined);
});

Deno.test("boleto-generate: rejeita documento curto", async () => {
  const { BoletoGenerateSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(BoletoGenerateSchema, {
    ...validPayload,
    payer: { name: "X", document: "123" },
  });
  assertEquals(v.success, false);
});