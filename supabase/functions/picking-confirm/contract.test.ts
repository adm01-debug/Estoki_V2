import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

Deno.test("Contract Test: picking-confirm - Valid Payload", async () => {
  const payload = {
    pick_list_id: VALID_UUID,
    picker_id: VALID_UUID,
    items: [
      {
        pick_item_id: VALID_UUID,
        picked_quantity: 10,
      },
    ],
  };

  const { PickingConfirmSchema, validateInput } = await import("../_shared/schemas.ts");
  const validation = validateInput(PickingConfirmSchema, payload);

  assertEquals(validation.success, true);
});

Deno.test("Contract Test: picking-confirm - Negative Quantity", async () => {
  const payload = {
    pick_list_id: VALID_UUID,
    picker_id: VALID_UUID,
    items: [
      {
        pick_item_id: VALID_UUID,
        picked_quantity: -1,
      },
    ],
  };

  const { PickingConfirmSchema, validateInput } = await import("../_shared/schemas.ts");
  const validation = validateInput(PickingConfirmSchema, payload);

  assertEquals(validation.success, false);
});

Deno.test("Contract Test: picking-confirm - Empty items", async () => {
  const payload = {
    pick_list_id: VALID_UUID,
    picker_id: VALID_UUID,
    items: [],
  };

  const { PickingConfirmSchema, validateInput } = await import("../_shared/schemas.ts");
  const validation = validateInput(PickingConfirmSchema, payload);

  assertEquals(validation.success, false);
});
