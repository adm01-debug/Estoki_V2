// Prova que o CORS nao reflete origem arbitraria e que APP_ORIGINS manda na lista.
// Sem isso, o site em producao recebia a origem do Lovable e o navegador bloqueava a resposta.

import { assert, assertEquals } from "https://deno.land/std@0.224.0/assert/mod.ts";
import { getCorsHeaders, origensPermitidas } from "./cors.ts";

function comAppOrigins(valor: string | null): void {
  if (valor === null) Deno.env.delete("APP_ORIGINS");
  else Deno.env.set("APP_ORIGINS", valor);
}

function pedido(origin?: string): Request {
  return new Request("https://edge.test", origin ? { headers: { Origin: origin } } : {});
}

Deno.test("cors: origem conhecida e refletida", () => {
  comAppOrigins(null);
  assertEquals(getCorsHeaders(pedido("https://estoki.app"))["Access-Control-Allow-Origin"], "https://estoki.app");
  assertEquals(
    getCorsHeaders(pedido("https://estoki-v2.vercel.app"))["Access-Control-Allow-Origin"],
    "https://estoki-v2.vercel.app",
  );
});

Deno.test("cors: origem desconhecida nao e refletida", () => {
  comAppOrigins(null);
  const h = getCorsHeaders(pedido("https://atacante.test"));
  assert(h["Access-Control-Allow-Origin"] !== "https://atacante.test");
  assertEquals(h["Access-Control-Allow-Origin"], origensPermitidas()[0]);
});

Deno.test("cors: sem Origin nao vaza origem arbitraria", () => {
  comAppOrigins(null);
  assertEquals(getCorsHeaders(pedido())["Access-Control-Allow-Origin"], origensPermitidas()[0]);
});

Deno.test("cors: APP_ORIGINS sobrescreve a lista padrao", () => {
  comAppOrigins("https://novo.test, https://outro.test");
  try {
    assertEquals(origensPermitidas(), ["https://novo.test", "https://outro.test"]);
    assertEquals(getCorsHeaders(pedido("https://outro.test"))["Access-Control-Allow-Origin"], "https://outro.test");
    assert(getCorsHeaders(pedido("https://estoki.app"))["Access-Control-Allow-Origin"] !== "https://estoki.app");
  } finally {
    comAppOrigins(null);
  }
});
