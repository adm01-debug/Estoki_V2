import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { z } from "https://deno.land/x/zod@v3.22.4/mod.ts";
import { NfeImportSchema, validateInput } from "../_shared/schemas.ts";

Deno.test("NfeImportSchema validation - Valid inputs", () => {
  const validWithXml = {
    xml_content: "<nfeProc>...</nfeProc>",
    access_key: "12345678901234567890123456789012345678901234",
  };
  
  const validOnlyAccessKey = {
    access_key: "12345678901234567890123456789012345678901234",
  };

  const validOnlyXml = {
    xml_content: "<nfeProc>...</nfeProc>",
  };

  assertEquals(validateInput(NfeImportSchema, validWithXml).success, true);
  assertEquals(validateInput(NfeImportSchema, validOnlyAccessKey).success, true);
  assertEquals(validateInput(NfeImportSchema, validOnlyXml).success, true);
});

Deno.test("NfeImportSchema validation - Invalid inputs", () => {
  const missingBoth = {};
  
  const invalidAccessKey = {
    access_key: "123", // Too short
  };

  const invalidAccessKeyChars = {
    access_key: "1234567890123456789012345678901234567890123A", // Non-numeric
  };

  assertEquals(validateInput(NfeImportSchema, missingBoth).success, false);
  assertEquals(validateInput(NfeImportSchema, invalidAccessKey).success, false);
  assertEquals(validateInput(NfeImportSchema, invalidAccessKeyChars).success, false);
});
