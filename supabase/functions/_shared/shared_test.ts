import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { CarrierTrackSchema, WebhookEventSchema, validateInput } from "../_shared/schemas.ts";

Deno.test("CarrierTrackSchema validation - Valid inputs", () => {
  const valid = {
    tracking_number: "BR123456789",
    carrier: "correios"
  };
  assertEquals(validateInput(CarrierTrackSchema, valid).success, true);
});

Deno.test("CarrierTrackSchema validation - Invalid inputs", () => {
  const missingTracking = {
    carrier: "correios"
  };
  assertEquals(validateInput(CarrierTrackSchema, missingTracking).success, false);
});

Deno.test("WebhookEventSchema validation - Valid inputs", () => {
  const valid = {
    event: "order.created",
    data: { id: "123" }
  };
  assertEquals(validateInput(WebhookEventSchema, valid).success, true);
});

Deno.test("WebhookEventSchema validation - Invalid inputs", () => {
  const missingEvent = {
    data: {}
  };
  assertEquals(validateInput(WebhookEventSchema, missingEvent).success, false);
});
