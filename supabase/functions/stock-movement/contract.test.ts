import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

const UUID = "550e8400-e29b-41d4-a716-446655440000";

Deno.test("stock-movement: entrada válida", async () => {
  const { StockMovementSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(StockMovementSchema, {
    produto_id: UUID,
    quantidade: 10,
    tipo: "entrada",
  });
  assertEquals(v.success, true);
});

Deno.test("stock-movement: rejeita quantidade negativa", async () => {
  const { StockMovementSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(StockMovementSchema, {
    produto_id: UUID,
    quantidade: -5,
    tipo: "saida",
  });
  assertEquals(v.success, false);
});

Deno.test("stock-movement: rejeita tipo inválido", async () => {
  const { StockMovementSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(StockMovementSchema, {
    produto_id: UUID,
    quantidade: 1,
    tipo: "explosao",
  });
  assertEquals(v.success, false);
});