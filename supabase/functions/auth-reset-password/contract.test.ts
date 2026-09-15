import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

Deno.test("auth-reset-password: valid email", async () => {
  const { ResetPasswordSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(ResetPasswordSchema, { email: "reset@estoki.com" });
  assertEquals(v.success, true);
});

Deno.test("auth-reset-password: rejeita email inválido", async () => {
  const { ResetPasswordSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(ResetPasswordSchema, { email: "sem-arroba" });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.email, undefined);
});