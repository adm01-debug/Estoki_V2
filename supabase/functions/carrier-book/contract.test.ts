import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

Deno.test("Contract: carrier-book - valid payload", async () => {
  const { CarrierBookSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CarrierBookSchema, {
    order_id: VALID_UUID,
    carrier: "correios",
    service: "PAC",
    weight_kg: 2.5,
    destination_zip: "01310100",
  });
  assertEquals(v.success, true);
});

Deno.test("Contract: carrier-book - missing carrier", async () => {
  const { CarrierBookSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CarrierBookSchema, { order_id: VALID_UUID, carrier: "" });
  assertEquals(v.success, false);
});

Deno.test("Contract: carrier-book - weight above limit", async () => {
  const { CarrierBookSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CarrierBookSchema, { carrier: "jadlog", weight_kg: 2000 });
  assertEquals(v.success, false);
});

Deno.test("Contract: carrier-book - invalid shipment_id", async () => {
  const { CarrierBookSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CarrierBookSchema, { shipment_id: "not-uuid", carrier: "correios" });
  assertEquals(v.success, false);
});