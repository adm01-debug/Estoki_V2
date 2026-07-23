import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

Deno.test("Contract: auth-refresh-token - valid token", async () => {
  const { RefreshTokenSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(RefreshTokenSchema, { refresh_token: "a".repeat(64) });
  assertEquals(v.success, true);
});

Deno.test("Contract: auth-refresh-token - too short", async () => {
  const { RefreshTokenSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(RefreshTokenSchema, { refresh_token: "abc" });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.refresh_token, undefined);
});

Deno.test("Contract: auth-refresh-token - too long (>4096)", async () => {
  const { RefreshTokenSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(RefreshTokenSchema, { refresh_token: "a".repeat(4097) });
  assertEquals(v.success, false);
});

Deno.test("Contract: auth-refresh-token - missing field", async () => {
  const { RefreshTokenSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(RefreshTokenSchema, {});
  assertEquals(v.success, false);
});