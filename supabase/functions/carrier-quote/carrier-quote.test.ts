import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { CarrierQuoteRequestSchema, validateInput } from "../_shared/schemas.ts";

Deno.test("CarrierQuoteRequestSchema validation - Valid inputs", () => {
  const valid = {
    origin_cep: "01234567",
    destination_cep: "87654321",
    weight: 2.5,
    dimensions: { width: 10, height: 20, length: 30 },
    carriers: ["correios"]
  };

  assertEquals(validateInput(CarrierQuoteRequestSchema, valid).success, true);
});

Deno.test("CarrierQuoteRequestSchema validation - Invalid inputs", () => {
  const invalidCep = {
    origin_cep: "123",
    destination_cep: "87654321",
    weight: 2.5,
    dimensions: { width: 10, height: 20, length: 30 }
  };
  
  const missingDimensions = {
    origin_cep: "01234567",
    destination_cep: "87654321",
    weight: 2.5
  };

  assertEquals(validateInput(CarrierQuoteRequestSchema, invalidCep).success, false);
  assertEquals(validateInput(CarrierQuoteRequestSchema, missingDimensions).success, false);
});
