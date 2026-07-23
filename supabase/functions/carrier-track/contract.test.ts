import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

Deno.test("Contract: carrier-track - valid payload", async () => {
  const { CarrierTrackSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CarrierTrackSchema, {
    tracking_number: "BR123456789BR",
    carrier: "correios",
  });
  assertEquals(v.success, true);
  if (v.success) assertEquals(v.data.carrier, "correios");
});

Deno.test("Contract: carrier-track - default carrier=auto", async () => {
  const { CarrierTrackSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CarrierTrackSchema, { tracking_number: "BR1" });
  assertEquals(v.success, true);
  if (v.success) assertEquals(v.data.carrier, "auto");
});

Deno.test("Contract: carrier-track - missing tracking_number", async () => {
  const { CarrierTrackSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CarrierTrackSchema, { tracking_number: "" });
  assertEquals(v.success, false);
  if (!v.success) assertNotEquals(v.details.tracking_number, undefined);
});