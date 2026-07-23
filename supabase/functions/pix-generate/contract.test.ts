import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

Deno.test("Contract: pix-generate - valid payload", async () => {
  const { PixGenerateSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(PixGenerateSchema, {
    amount: 199.9,
    description: "Pedido #123",
    payer_name: "João",
    expiration_minutes: 60,
  });
  assertEquals(v.success, true);
});

Deno.test("Contract: pix-generate - amount zero", async () => {
  const { PixGenerateSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(PixGenerateSchema, { amount: 0 });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.amount, undefined);
});

Deno.test("Contract: pix-generate - amount above cap", async () => {
  const { PixGenerateSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(PixGenerateSchema, { amount: 2_000_000 });
  assertEquals(v.success, false);
});

Deno.test("Contract: pix-generate - expiration out of range", async () => {
  const { PixGenerateSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(PixGenerateSchema, { amount: 10, expiration_minutes: 5000 });
  assertEquals(v.success, false);
});