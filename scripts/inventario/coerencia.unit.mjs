// Coerencia repo x banco real (scripts/inventario/coerencia.mjs).
// Duas classes de buraco silencioso: migration que nunca foi aplicada (o objeto que ela cria nao
// existe no banco) e codigo vivo chamando tabela/RPC inexistente (PostgREST devolve PGRST205 e a
// tela mostra erro). O que ja e codigo morto fica com motivo, para nao virar alerta permanente.

import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  MIGRATIONS_OBSOLETAS,
  CODIGO_MORTO,
  objetosCriados,
  migrationsOrfas,
  citadosNoCodigo,
  citadosSemBanco,
} from "./coerencia.mjs";

const repo = () => {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), "coerencia-"));
  fs.mkdirSync(path.join(raiz, "supabase/migrations"), { recursive: true });
  fs.mkdirSync(path.join(raiz, "src"), { recursive: true });
  return raiz;
};
const escrever = (raiz, rel, texto) => {
  const alvo = path.join(raiz, rel);
  fs.mkdirSync(path.dirname(alvo), { recursive: true });
  fs.writeFileSync(alvo, texto);
};

test("objetosCriados le tabela com e sem schema, funcao com or replace e sinaliza view", () => {
  const sql = [
    "CREATE TABLE IF NOT EXISTS public.entity_versions (id uuid);",
    'CREATE TABLE "contratos" (id uuid);',
    "create or replace function public.get_history(p_id uuid) returns void as $$ begin end $$;",
    "CREATE MATERIALIZED VIEW mv_teste AS SELECT 1;",
  ].join("\n");
  const criados = objetosCriados(sql);
  assert.deepEqual(criados.tabelas, ["contratos", "entity_versions"]);
  assert.deepEqual(criados.funcoes, ["get_history"]);
  assert.equal(criados.views, 1);
});

test("migration cujo objeto nao existe no banco aparece como orfa", () => {
  const raiz = repo();
  escrever(raiz, "supabase/migrations/20260101000000_esquecida.sql", "CREATE TABLE esquecida (id uuid);");
  const orfas = migrationsOrfas(raiz, { tabelas: [{ nome: "produtos" }], funcoes: [] });
  assert.deepEqual(orfas, [{ arquivo: "20260101000000_esquecida.sql", objetos: ["esquecida"], motivo: null }]);
});

test("migration com qualquer objeto presente conta como aplicada", () => {
  const raiz = repo();
  escrever(raiz, "supabase/migrations/20260101000000_parcial.sql", "CREATE TABLE produtos (id uuid);\nCREATE TABLE outra (id uuid);");
  assert.deepEqual(migrationsOrfas(raiz, { tabelas: ["produtos"], funcoes: [] }), []);
});

test("migration so de view fica de fora: o inventario nao guarda nome de view", () => {
  const raiz = repo();
  escrever(raiz, "supabase/migrations/20260101000000_view.sql", "CREATE VIEW v_produtos AS SELECT 1 AS id;");
  assert.deepEqual(migrationsOrfas(raiz, { tabelas: [], funcoes: [] }), []);
});

test("migration conhecida como obsoleta sai com motivo em vez de alerta", () => {
  const raiz = repo();
  const arquivo = Object.keys(MIGRATIONS_OBSOLETAS)[0];
  escrever(raiz, `supabase/migrations/${arquivo}`, "CREATE TABLE tabela_morta (id uuid);");
  const [orfa] = migrationsOrfas(raiz, { tabelas: [], funcoes: [] });
  assert.equal(orfa.arquivo, arquivo);
  assert.equal(orfa.motivo, MIGRATIONS_OBSOLETAS[arquivo]);
});

test("citadosNoCodigo ignora .from() de storage e pega .rpc()", () => {
  const raiz = repo();
  escrever(raiz, "src/services/backup.ts", [
    'await supabase.storage.from("backups").list();',
    "await supabase.storage",
    '  .from("backups")',
    "  .upload(\"x\", blob);",
    'await supabase.from("produtos").select("*");',
    'await supabase.rpc("iniciar_tarefa_picking", { p_tarefa: id });',
  ].join("\n"));
  const citados = citadosNoCodigo(raiz);
  assert.deepEqual(citados.map((c) => `${c.tipo}:${c.nome}`), ["rpc:iniciar_tarefa_picking", "tabela:produtos"]);
});

test("edge nao publicada nao entra na varredura: codigo morto nao vira alerta", () => {
  const raiz = repo();
  escrever(raiz, "supabase/functions/edge-morta/index.ts", 'await supabase.from("sales_orders").insert({});');
  escrever(raiz, "supabase/functions/edge-viva/index.ts", 'await supabase.from("produtos").insert({});');
  assert.deepEqual(citadosNoCodigo(raiz, ["edge-viva"]).map((c) => c.nome), ["produtos"]);
});

test("tabela citada no codigo vivo sem existir no banco sai sem motivo (alerta)", () => {
  const raiz = repo();
  escrever(raiz, "src/pages/Estoque.tsx", 'await supabase.from("tabela_nova").select("*");');
  const [achado] = citadosSemBanco(raiz, { tabelas: ["produtos"], funcoes: [] });
  assert.equal(achado.nome, "tabela_nova");
  assert.equal(achado.motivo, null);
});

test("codigo morto conhecido sai com motivo e nao vira alerta", () => {
  const raiz = repo();
  const tabela = Object.keys(CODIGO_MORTO)[0];
  escrever(raiz, "src/hooks/morto.ts", `await supabase.from("${tabela}").select("*");`);
  const [achado] = citadosSemBanco(raiz, { tabelas: [], funcoes: [] });
  assert.equal(achado.nome, tabela);
  assert.equal(achado.motivo, CODIGO_MORTO[tabela]);
});