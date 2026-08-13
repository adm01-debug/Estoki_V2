import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

Deno.test("Contract: create-sales-order - valid payload", async () => {
  const { CreateSalesOrderSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CreateSalesOrderSchema, {
    customerId: VALID_UUID,
    items: [{ productId: VALID_UUID, quantity: 2, unitPrice: 10.5 }],
  });
  assertEquals(v.success, true);
});

Deno.test("Contract: create-sales-order - empty items", async () => {
  const { CreateSalesOrderSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CreateSalesOrderSchema, { customerId: VALID_UUID, items: [] });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.items, undefined);
});

Deno.test("Contract: create-sales-order - invalid customerId", async () => {
  const { CreateSalesOrderSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CreateSalesOrderSchema, {
    customerId: "not-uuid",
    items: [{ quantity: 1, unitPrice: 1 }],
  });
  assertEquals(v.success, false);
});

Deno.test("Contract: create-sales-order - negative quantity", async () => {
  const { CreateSalesOrderSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CreateSalesOrderSchema, {
    customerId: VALID_UUID,
    items: [{ quantity: -1, unitPrice: 5 }],
  });
  assertEquals(v.success, false);
});

Deno.test("Contract: create-sales-order - too many items (>500)", async () => {
  const { CreateSalesOrderSchema, validateInput } = await import("../_shared/schemas.ts");
  const items = Array.from({ length: 501 }, () => ({ quantity: 1, unitPrice: 1 }));
  const v = validateInput(CreateSalesOrderSchema, { customerId: VALID_UUID, items });
  assertEquals(v.success, false);
});