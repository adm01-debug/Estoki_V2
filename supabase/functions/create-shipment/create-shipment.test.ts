import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { CreateShipmentSchema, validateInput } from "../_shared/schemas.ts";

Deno.test("CreateShipmentSchema validation - Valid inputs", () => {
  const valid = {
    orderId: "550e8400-e29b-41d4-a716-446655440000",
    carrier: "correios",
    trackingNumber: "BR123456789",
  };

  assertEquals(validateInput(CreateShipmentSchema, valid).success, true);
});

Deno.test("CreateShipmentSchema validation - Invalid inputs", () => {
  const invalidId = {
    orderId: "not-a-uuid",
    carrier: "correios",
    trackingNumber: "BR123456789",
  };

  const missingCarrier = {
    orderId: "550e8400-e29b-41d4-a716-446655440000",
    trackingNumber: "BR123456789",
  };

  assertEquals(validateInput(CreateShipmentSchema, invalidId).success, false);
  assertEquals(validateInput(CreateShipmentSchema, missingCarrier).success, false);
});
