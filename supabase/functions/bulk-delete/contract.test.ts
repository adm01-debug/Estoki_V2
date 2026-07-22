import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { BulkDeleteSchema, validateInput } from "../_shared/schemas.ts";

Deno.test("bulk-delete: aceita tabela permitida com uuids", () => {
  const v = validateInput(BulkDeleteSchema, {
    table: "notificacoes",
    ids: ["550e8400-e29b-41d4-a716-446655440000"],
  });
  assertEquals(v.success, true);
});

Deno.test("bulk-delete: rejeita tabela fora da whitelist (ex: user_roles)", () => {
  const v = validateInput(BulkDeleteSchema, {
    table: "user_roles",
    ids: ["550e8400-e29b-41d4-a716-446655440000"],
  });
  assertEquals(v.success, false);
});

Deno.test("bulk-delete: rejeita id não-uuid", () => {
  const v = validateInput(BulkDeleteSchema, { table: "lotes", ids: ["abc"] });
  assertEquals(v.success, false);
});

Deno.test("bulk-delete: rejeita lote acima de 500 ids", () => {
  const ids = Array.from({ length: 501 }, () => "550e8400-e29b-41d4-a716-446655440000");
  const v = validateInput(BulkDeleteSchema, { table: "lotes", ids });
  assertEquals(v.success, false);
});