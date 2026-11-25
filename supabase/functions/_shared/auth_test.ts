// Guarda de sessao das Edge Functions (supabase/functions/_shared/auth.ts).
// A chave publica do site (`sb_publishable_*`) chega como Bearer sem usuario:
// por isso a unica prova de "pode seguir" e uma sessao real ou o service role.
// Estes testes fixam a leitura do header, que e o que separa as duas coisas.
import test from "node:test";
import assert from "node:assert/strict";
import { exigirSessao, tokenDoBearer, veioDoInterno } from "./auth.ts";

const req = (headers: Record<string, string> = {}) => new Request("https://x/f", { headers });

const comAmbiente = async (valor: string | undefined, fn: () => Promise<void>) => {
  const antes = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  const antesUrl = Deno.env.get("SUPABASE_URL");
  // URL que nunca resolve: a checagem de sessao falha sem tocar no Supabase real.
  Deno.env.set("SUPABASE_URL", "https://endereco.invalid");
  if (valor === undefined) Deno.env.delete("SUPABASE_SERVICE_ROLE_KEY");
  else Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", valor);
  try {
    await fn();
  } finally {
    if (antes === undefined) Deno.env.delete("SUPABASE_SERVICE_ROLE_KEY");
    else Deno.env.set("SUPABASE_SERVICE_ROLE_KEY", antes);
    if (antesUrl === undefined) Deno.env.delete("SUPABASE_URL");
    else Deno.env.set("SUPABASE_URL", antesUrl);
  }
};

test("sem header Authorization nao ha token", () => {
  assert.equal(tokenDoBearer(req()), null);
  assert.equal(veioDoInterno(req()), false);
});

test("Bearer com espaco extra e case variado ainda e lido", () => {
  assert.equal(tokenDoBearer(req({ authorization: "bearer  abc.def  " })), "abc.def");
});

test("outro esquema (Basic) nao vira token", () => {
  assert.equal(tokenDoBearer(req({ Authorization: "Basic YWJj" })), null);
});

test("token igual ao service role e chamada interna", async () => {
  await comAmbiente("segredo-interno", async () => {
    assert.equal(veioDoInterno(req({ Authorization: "Bearer segredo-interno" })), true);
    assert.equal(veioDoInterno(req({ Authorization: "Bearer outro" })), false);
  });
});

test("sem service role no ambiente nada e chamada interna", async () => {
  await comAmbiente(undefined, async () => {
    assert.equal(veioDoInterno(req({ Authorization: "Bearer qualquer" })), false);
  });
});

test("chave publica do site (nao e JWT) nao passa pela guarda", async () => {
  await comAmbiente("segredo-interno", async () => {
    const recusa = await exigirSessao(
      req({ Authorization: "Bearer sb_publishable_lBoxcGwOv0lccSjiahKbng" })
    );
    assert.notEqual(recusa, null);
    assert.equal(recusa?.status, 401);
    assert.deepEqual(await recusa?.json(), { error: "sessao obrigatoria" });
  });
});

test("sem Authorization nenhum, a guarda recusa com 401", async () => {
  const recusa = await exigirSessao(req());
  assert.equal(recusa?.status, 401);
});