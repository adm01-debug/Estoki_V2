import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

Deno.test("Contract Test: adjust-inventory - Valid Payload", async () => {
  const payload = {
    produto_id: VALID_UUID,
    posicao_id: VALID_UUID,
    quantidade_nova: 50,
    motivo: "Ajuste de inventário anual",
  };

  const { InventoryAdjustSchema, validateInput } = await import("../_shared/schemas.ts");
  const validation = validateInput(InventoryAdjustSchema, payload);

  assertEquals(validation.success, true);
  if (validation.success) {
    assertEquals(validation.data.quantidade_nova, 50);
    assertEquals(validation.data.motivo, "Ajuste de inventário anual");
  }
});

Deno.test("Contract Test: adjust-inventory - Invalid UUIDs", async () => {
  const payload = {
    produto_id: "invalid-uuid",
    posicao_id: VALID_UUID,
    quantidade_nova: 10,
    motivo: "Teste",
  };

  const { InventoryAdjustSchema, validateInput } = await import("../_shared/schemas.ts");
  const validation = validateInput(InventoryAdjustSchema, payload);

  assertEquals(validation.success, false);
  if (!validation.success) {
    assertNotEquals(validation.details.produto_id, undefined);
  }
});

Deno.test("Contract Test: adjust-inventory - Negative Quantity", async () => {
  const payload = {
    produto_id: VALID_UUID,
    posicao_id: VALID_UUID,
    quantidade_nova: -5,
    motivo: "Erro proposital",
  };

  const { InventoryAdjustSchema, validateInput } = await import("../_shared/schemas.ts");
  const validation = validateInput(InventoryAdjustSchema, payload);

  assertEquals(validation.success, false);
  if (!validation.success) {
    assertNotEquals(validation.details.quantidade_nova, undefined);
  }
});

Deno.test("Contract Test: adjust-inventory - Missing Motivo", async () => {
  const payload = {
    produto_id: VALID_UUID,
    posicao_id: VALID_UUID,
    quantidade_nova: 100,
  };

  const { InventoryAdjustSchema, validateInput } = await import("../_shared/schemas.ts");
  const validation = validateInput(InventoryAdjustSchema, payload);

  assertEquals(validation.success, false);
  if (!validation.success) {
    assertNotEquals(validation.details.motivo, undefined);
  }
});
