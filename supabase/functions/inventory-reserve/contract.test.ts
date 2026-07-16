import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

Deno.test("inventory-reserve: reserva válida", async () => {
  const { InventoryReserveSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(InventoryReserveSchema, { produto_id: UUID, quantidade: 3 });
  assertEquals(v.success, true);
  if (v.success) assertEquals(v.data.prioridade, "media");
});

Deno.test("inventory-reserve: rejeita quantidade 0", async () => {
  const { InventoryReserveSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(InventoryReserveSchema, { produto_id: UUID, quantidade: 0 });
  assertEquals(v.success, false);
});

Deno.test("inventory-reserve: aceita prioridade alta", async () => {
  const { InventoryReserveSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(InventoryReserveSchema, {
    produto_id: UUID,
    quantidade: 5,
    prioridade: "alta",
  });
  assertEquals(v.success, true);
});