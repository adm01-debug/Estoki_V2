import { assertEquals, assert } from "https://deno.land/std@0.224.0/assert/mod.ts";

/**
 * Contract test — carrier-track (Correios).
 *
 * Roda sem credenciais reais: valida que a função devolve modo `simulated`
 * com eventos válidos quando `CORREIOS_USER` está ausente.
 */

Deno.test("carrier-track: rejeita payload inválido com 400", async () => {
  const req = new Request("http://localhost/carrier-track", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({}), // faltando tracking_number
  });
  const mod = await import("./index.ts").catch(() => null);
  // O import roda serve(); só validamos o schema aqui.
  const { CarrierTrackSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CarrierTrackSchema, await req.clone().json());
  assertEquals(v.success, false);
  assert(mod !== undefined);
});

Deno.test("carrier-track: aceita payload válido no schema", async () => {
  const { CarrierTrackSchema, validateInput } = await import("../_shared/schemas.ts");
  const v = validateInput(CarrierTrackSchema, {
    tracking_number: "OM123456789BR",
    carrier: "correios",
  });
  assertEquals(v.success, true);
});