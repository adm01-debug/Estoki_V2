import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

Deno.test("nfe-import: aceita access_key de 44 dígitos", async () => {
  const { NfeImportSchema, validateInput } = await import("../_shared/schemas.ts");
  const key = "1".repeat(44);
  const v = validateInput(NfeImportSchema, { access_key: key });
  assertEquals(v.success, true);
});

Deno.test("nfe-import: rejeita access_key inválida", async () => {
  const { NfeImportSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(NfeImportSchema, { access_key: "abc" });
  assertEquals(v.success, false);
});

Deno.test("nfe-import: exige xml_content OU access_key", async () => {
  const { NfeImportSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(NfeImportSchema, {});
  assertEquals(v.success, false);
});

Deno.test("nfe-import: aceita xml_content", async () => {
  const { NfeImportSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(NfeImportSchema, { xml_content: "<nfe/>" });
  assertEquals(v.success, true);
});