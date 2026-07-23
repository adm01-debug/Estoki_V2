// Contract tests para o cliente ERP compartilhado (retries + circuit breaker).
// Executa via `deno test supabase/functions/_shared/erp_test.ts`.

import { assertEquals, assertRejects } from "https://deno.land/std@0.168.0/testing/asserts.ts";
import { erpFetch, ErpCircuitOpenError, sapHeaders, totvsHeaders } from "./erp.ts";

function mockFetchSequence(responses: Array<() => Response | Promise<Response>>) {
  let i = 0;
  const originalFetch = globalThis.fetch;
  globalThis.fetch = ((_input: string | URL, _init?: RequestInit) => {
    const r = responses[Math.min(i, responses.length - 1)];
    i++;
    return Promise.resolve(r());
  }) as typeof fetch;
  return () => { globalThis.fetch = originalFetch; };
}

Deno.test("erpFetch: retenta em 503 e conclui em 200", async () => {
  const restore = mockFetchSequence([
    () => new Response("busy", { status: 503 }),
    () => new Response(JSON.stringify({ ok: true }), { status: 200 }),
  ]);
  try {
    const res = await erpFetch("https://sap.example.com/b1s/v1/Login", {
      method: "POST", retries: 3, timeoutMs: 500,
    });
    assertEquals(res.status, 200);
  } finally { restore(); }
});

Deno.test("erpFetch: abre circuito após falhas consecutivas", async () => {
  const restore = mockFetchSequence([
    () => new Response("boom", { status: 500 }),
  ]);
  try {
    // 5 chamadas com retries desabilitados para acumular falhas rapidamente
    for (let i = 0; i < 5; i++) {
      await erpFetch("https://breaker-host.example.com/x", { retries: 0, timeoutMs: 500 });
    }
    await assertRejects(
      () => erpFetch("https://breaker-host.example.com/x", { retries: 0, timeoutMs: 500 }),
      ErpCircuitOpenError,
    );
  } finally { restore(); }
});

Deno.test("sapHeaders/totvsHeaders montam credenciais corretas", () => {
  const sh = sapHeaders("abc123") as Record<string, string>;
  assertEquals(sh.Cookie, "B1SESSION=abc123");
  const th = totvsHeaders("tkn") as Record<string, string>;
  assertEquals(th.Authorization, "Bearer tkn");
});