import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

const VALID_UUID = "550e8400-e29b-41d4-a716-446655440000";

Deno.test("Contract: create-shipment - valid payload", async () => {
  const { CreateShipmentSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CreateShipmentSchema, {
    orderId: VALID_UUID,
    carrier: "correios",
    trackingNumber: "BR123456789BR",
  });
  assertEquals(v.success, true);
});

Deno.test("Contract: create-shipment - invalid orderId", async () => {
  const { CreateShipmentSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CreateShipmentSchema, {
    orderId: "invalid",
    carrier: "correios",
    trackingNumber: "X1",
  });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.orderId, undefined);
});

Deno.test("Contract: create-shipment - missing carrier", async () => {
  const { CreateShipmentSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CreateShipmentSchema, {
    orderId: VALID_UUID,
    carrier: "",
    trackingNumber: "X1",
  });
  assertEquals(v.success, false);
});

Deno.test("Contract: create-shipment - missing trackingNumber", async () => {
  const { CreateShipmentSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CreateShipmentSchema, {
    orderId: VALID_UUID,
    carrier: "correios",
    trackingNumber: "",
  });
  assertEquals(v.success, false);
});