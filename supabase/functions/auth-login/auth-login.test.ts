import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { LoginSchema, validateInput } from "../_shared/schemas.ts";

Deno.test("LoginSchema validation - Valid inputs", () => {
  const valid = {
    email: "test@example.com",
    password: "password123",
  };

  assertEquals(validateInput(LoginSchema, valid).success, true);
});

Deno.test("LoginSchema validation - Invalid inputs", () => {
  const invalidEmail = {
    email: "invalid-email",
    password: "password123",
  };

  const shortPassword = {
    email: "test@example.com",
    password: "123",
  };

  assertEquals(validateInput(LoginSchema, invalidEmail).success, false);
  assertEquals(validateInput(LoginSchema, shortPassword).success, false);
});
