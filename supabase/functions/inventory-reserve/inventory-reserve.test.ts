import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { InventoryReserveSchema, validateInput } from "../_shared/schemas.ts";

Deno.test("InventoryReserveSchema validation - Valid inputs", () => {
  const valid = {
    produto_id: "550e8400-e29b-41d4-a716-446655440000",
    quantidade: 10,
    prioridade: "alta",
  };

  assertEquals(validateInput(InventoryReserveSchema, valid).success, true);
});

Deno.test("InventoryReserveSchema validation - Invalid inputs", () => {
  const invalidId = {
    produto_id: "not-a-uuid",
    quantidade: 10,
  };

  const negativeQty = {
    produto_id: "550e8400-e29b-41d4-a716-446655440000",
    quantidade: -1,
  };

  assertEquals(validateInput(InventoryReserveSchema, invalidId).success, false);
  assertEquals(validateInput(InventoryReserveSchema, negativeQty).success, false);
});
