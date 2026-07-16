import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

Deno.test("auth-register: valid payload", async () => {
  const { RegisterSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(RegisterSchema, {
    email: "novo@estoki.com",
    password: "senhaForte1",
    nome: "Novo Usuário",
  });
  assertEquals(v.success, true);
});

Deno.test("auth-register: password < 8 chars rejected", async () => {
  const { RegisterSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(RegisterSchema, { email: "a@b.com", password: "1234567" });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.password, undefined);
});

Deno.test("auth-register: nome opcional", async () => {
  const { RegisterSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(RegisterSchema, { email: "a@b.com", password: "12345678" });
  assertEquals(v.success, true);
});