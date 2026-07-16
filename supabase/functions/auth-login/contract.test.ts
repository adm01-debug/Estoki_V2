import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

Deno.test("auth-login: valid payload passes", async () => {
  const { LoginSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(LoginSchema, { email: "user@estoki.com", password: "senha123" });
  assertEquals(v.success, true);
});

Deno.test("auth-login: invalid email rejected", async () => {
  const { LoginSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(LoginSchema, { email: "not-an-email", password: "senha123" });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.email, undefined);
});

Deno.test("auth-login: short password rejected", async () => {
  const { LoginSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(LoginSchema, { email: "user@estoki.com", password: "123" });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.password, undefined);
});