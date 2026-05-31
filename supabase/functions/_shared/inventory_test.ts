import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import {
  InventoryTransferSchema,
  InventoryAdjustSchema,
  validateInput,
} from "../_shared/schemas.ts";

Deno.test("InventoryTransferSchema validation - Valid inputs", () => {
  const valid = {
    produto_id: "550e8400-e29b-41d4-a716-446655440000",
    origem_id: "550e8400-e29b-41d4-a716-446655440001",
    destino_id: "550e8400-e29b-41d4-a716-446655440002",
    quantidade: 50,
  };
  assertEquals(validateInput(InventoryTransferSchema, valid).success, true);
});

Deno.test("InventoryTransferSchema validation - Invalid inputs", () => {
  const missingDest = {
    produto_id: "550e8400-e29b-41d4-a716-446655440000",
    origem_id: "550e8400-e29b-41d4-a716-446655440001",
    quantidade: 50,
  };
  assertEquals(validateInput(InventoryTransferSchema, missingDest).success, false);
});

Deno.test("InventoryAdjustSchema validation - Valid inputs", () => {
  const valid = {
    produto_id: "550e8400-e29b-41d4-a716-446655440000",
    posicao_id: "550e8400-e29b-41d4-a716-446655440001",
    quantidade_nova: 100,
    motivo: "Correção de inventário",
  };
  assertEquals(validateInput(InventoryAdjustSchema, valid).success, true);
});
