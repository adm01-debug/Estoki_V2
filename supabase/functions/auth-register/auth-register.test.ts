import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { RegisterSchema, validateInput } from "../_shared/schemas.ts";

Deno.test("RegisterSchema validation - Valid inputs", () => {
  const valid = {
    email: "test@example.com",
    password: "password123",
    nome: "Test User",
  };

  const validNoName = {
    email: "test@example.com",
    password: "password123",
  };

  assertEquals(validateInput(RegisterSchema, valid).success, true);
  assertEquals(validateInput(RegisterSchema, validNoName).success, true);
});

Deno.test("RegisterSchema validation - Invalid inputs", () => {
  const invalidEmail = {
    email: "invalid-email",
    password: "password123",
  };

  const shortPassword = {
    email: "test@example.com",
    password: "1234567", // Schema requires 8
  };

  assertEquals(validateInput(RegisterSchema, invalidEmail).success, false);
  assertEquals(validateInput(RegisterSchema, shortPassword).success, false);
});
