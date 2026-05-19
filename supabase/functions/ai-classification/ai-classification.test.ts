import { assertEquals } from "https://deno.land/std@0.203.0/assert/mod.ts";
import { AiClassificationSchema, validateInput } from "../_shared/schemas.ts";

Deno.test("AiClassificationSchema validation - Valid inputs", () => {
  const valid = {
    text: "Preciso de um novo celular",
    categories: ["eletronicos", "vestuario"],
    model: "simple"
  };

  assertEquals(validateInput(AiClassificationSchema, valid).success, true);
});

Deno.test("AiClassificationSchema validation - Invalid inputs", () => {
  const missingText = {
    categories: ["eletronicos"]
  };
  
  const emptyCategories = {
    text: "teste",
    categories: []
  };

  assertEquals(validateInput(AiClassificationSchema, missingText).success, false);
  assertEquals(validateInput(AiClassificationSchema, emptyCategories).success, false);
});
