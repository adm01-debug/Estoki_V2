// Inventario do banco (scripts/inventario/gerar-banco.mjs) - alerta de funcao executavel por `anon`.
// O Postgres concede EXECUTE a PUBLIC por padrao e `anon` herda: `REVOKE ... FROM PUBLIC` sozinho nao
// bloqueia (foi o furo das RPCs de picking, corrigido em 20261124120000_SEC_revoke_anon_execute.sql).
// Estes testes fixam as duas metades da regra: o fluxo pre-login nao vira ruido permanente e qualquer
// outra funcao executavel pela chave publica vira alerta nomeado.

import test from "node:test";
import assert from "node:assert/strict";
import { ANON_PRE_LOGIN, montarInventario } from "./gerar-banco.mjs";

const base = (funcoesAnon) => ({
  medido_em: "2026-11-24T00:00:00Z",
  tabelas: [],
  funcoes: [],
  funcoes_executaveis_anon: funcoesAnon,
  cron: { jobs: [], horas_paradas_7d: [], historico: { mais_de_7_dias: 0 } },
});

const alertasDe = (funcoesAnon) => montarInventario(base(funcoesAnon), {}).alertas;

test("funcao fora do fluxo pre-login executavel por anon vira alerta nomeado", () => {
  const alertas = alertasDe(["get_backend_health", "iniciar_tarefa_picking", "concluir_tarefa_picking"]);
  assert.deepEqual(alertas.filter((a) => a.tipo === "funcao_anon_executavel"), [
    {
      tipo: "funcao_anon_executavel",
      detalhe: ["iniciar_tarefa_picking", "concluir_tarefa_picking"],
    },
  ]);
});

test("so o fluxo pre-login executavel por anon nao gera alerta", () => {
  assert.deepEqual(alertasDe([...ANON_PRE_LOGIN]).filter((a) => a.tipo === "funcao_anon_executavel"), []);
});

test("inventario antigo sem a chave nova nao quebra nem inventa alerta", () => {
  const dado = base(undefined);
  delete dado.funcoes_executaveis_anon;
  assert.deepEqual(montarInventario(dado, {}).alertas, []);
});

test("security definer sem search_path fixado vira alerta nomeado", () => {
  const dado = { ...base([]), funcoes_security_definer_sem_search_path: ["move_stock(uuid, integer)"] };
  assert.deepEqual(montarInventario(dado, {}).alertas, [
    {
      tipo: "funcao_security_definer_sem_search_path",
      detalhe: ["move_stock(uuid, integer)"],
    },
  ]);
});

test("nenhum security definer frouxo (ou chave ausente) nao gera alerta", () => {
  assert.deepEqual(alertasDe([]), []);
  assert.deepEqual(
    montarInventario({ ...base([]), funcoes_security_definer_sem_search_path: [] }, {}).alertas,
    []
  );
});