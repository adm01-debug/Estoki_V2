import { assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { CarrierQuoteSchema } from "../_shared/schemas.ts";

Deno.test("carrier-quote-correios: rejects missing weight", () => {
  const r = CarrierQuoteSchema.safeParse({ origin_zip: "01001-000", destination_zip: "20040-002" });
  assertEquals(r.success, false);
});

Deno.test("carrier-quote-correios: rejects invalid CEP", () => {
  const r = CarrierQuoteSchema.safeParse({ origin_zip: "abc", destination_zip: "20040-002", weight: 1 });
  assertEquals(r.success, false);
});

Deno.test("carrier-quote-correios: accepts valid payload", () => {
  const r = CarrierQuoteSchema.safeParse({
    origin_zip: "01001000",
    destination_zip: "20040-002",
    weight: 2.5,
    length: 20,
    width: 15,
    height: 10,
  });
  assertEquals(r.success, true);
});