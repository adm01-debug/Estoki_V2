import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

Deno.test("Contract: inventory-transfer - valid payload", async () => {
  const { InventoryTransferSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(InventoryTransferSchema, {
    produto_id: VALID_UUID,
    origem_id: VALID_UUID,
    destino_id: VALID_UUID,
    quantidade: 10,
  });
  assertEquals(v.success, true);
});

Deno.test("Contract: inventory-transfer - negative quantity", async () => {
  const { InventoryTransferSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(InventoryTransferSchema, {
    produto_id: VALID_UUID,
    origem_id: VALID_UUID,
    destino_id: VALID_UUID,
    quantidade: -3,
  });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.quantidade, undefined);
});

Deno.test("Contract: inventory-transfer - invalid UUIDs", async () => {
  const { InventoryTransferSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(InventoryTransferSchema, {
    produto_id: "x",
    origem_id: "y",
    destino_id: "z",
    quantidade: 1,
  });
  assertEquals(v.success, false);
});

Deno.test("Contract: inventory-transfer - optional lote_id UUID", async () => {
  const { InventoryTransferSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(InventoryTransferSchema, {
    produto_id: VALID_UUID,
    origem_id: VALID_UUID,
    destino_id: VALID_UUID,
    quantidade: 1,
    lote_id: "invalid",
  });
  assertEquals(v.success, false);
});