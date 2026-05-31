import { assertEquals, assertNotEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";

Deno.test("Contract Test: calculate-shipping - Valid Request", async () => {
  const payload = {
    carrier: "correios",
    originZip: "01001000",
    destZip: "20040000",
    weight: 2.5,
    dimensions: {
      width: 20,
      height: 10,
      length: 30,
    },
  };

  const { ShippingQuoteSchema, validateInput } = await import("../_shared/schemas.ts");
  const validation = validateInput(ShippingQuoteSchema, payload);

  assertEquals(validation.success, true);
  if (validation.success) {
    assertEquals(validation.data.carrier, "correios");
    assertEquals(validation.data.weight, 2.5);
  }
});

Deno.test("Contract Test: calculate-shipping - Invalid Carrier", async () => {
  const payload = {
    carrier: "invalid-carrier",
    originZip: "01001000",
    destZip: "20040000",
    weight: 2.5,
  };

  const { ShippingQuoteSchema, validateInput } = await import("../_shared/schemas.ts");
  const validation = validateInput(ShippingQuoteSchema, payload);

  assertEquals(validation.success, false);
  if (!validation.success) {
    assertNotEquals(validation.details.carrier, undefined);
  }
});

Deno.test("Contract Test: calculate-shipping - Invalid Zip Code", async () => {
  const payload = {
    carrier: "azul",
    originZip: "123", // Inválido
    destZip: "20040000",
    weight: 1,
  };

  const { ShippingQuoteSchema, validateInput } = await import("../_shared/schemas.ts");
  const validation = validateInput(ShippingQuoteSchema, payload);

  assertEquals(validation.success, false);
  if (!validation.success) {
    assertNotEquals(validation.details.originZip, undefined);
  }
});

Deno.test("Contract Test: calculate-shipping - Missing Fields", async () => {
  const payload = {
    carrier: "jadlog",
  };

  const { ShippingQuoteSchema, validateInput } = await import("../_shared/schemas.ts");
  const validation = validateInput(ShippingQuoteSchema, payload);

  assertEquals(validation.success, false);
  if (!validation.success) {
    assertNotEquals(validation.details.originZip, undefined);
    assertNotEquals(validation.details.destZip, undefined);
    assertNotEquals(validation.details.weight, undefined);
  }
});
