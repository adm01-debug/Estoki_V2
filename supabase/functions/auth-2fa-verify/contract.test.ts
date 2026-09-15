import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

Deno.test("Contract: auth-2fa-verify - valid TOTP code", async () => {
  const { TwoFactorVerifySchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(TwoFactorVerifySchema, {
    factorId: "abc123",
    code: "123456",
    action: "verify-login",
  });
  assertEquals(v.success, true);
});

Deno.test("Contract: auth-2fa-verify - non-numeric code", async () => {
  const { TwoFactorVerifySchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(TwoFactorVerifySchema, { factorId: "abc", code: "abcdef" });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.code, undefined);
});

Deno.test("Contract: auth-2fa-verify - code with wrong length", async () => {
  const { TwoFactorVerifySchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(TwoFactorVerifySchema, { factorId: "abc", code: "12345" });
  assertEquals(v.success, false);
});

Deno.test("Contract: auth-2fa-verify - missing factorId", async () => {
  const { TwoFactorVerifySchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(TwoFactorVerifySchema, { factorId: "", code: "123456" });
  assertEquals(v.success, false);
});

Deno.test("Contract: auth-2fa-verify - invalid action enum", async () => {
  const { TwoFactorVerifySchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(TwoFactorVerifySchema, {
    factorId: "abc",
    code: "123456",
    action: "hack",
  });
  assertEquals(v.success, false);
});