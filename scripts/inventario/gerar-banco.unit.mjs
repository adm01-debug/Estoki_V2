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

test("view legivel por anon sem security_invoker vira alerta nomeado", () => {
  const dado = { ...base([]), views_sem_security_invoker: ["vw_produtos (v)"] };
  assert.deepEqual(montarInventario(dado, {}).alertas, [
    { tipo: "view_sem_security_invoker", detalhe: ["vw_produtos (v)"] },
  ]);
});

test("nenhuma view sem security_invoker nao gera alerta", () => {
  assert.deepEqual(
    montarInventario({ ...base([]), views_sem_security_invoker: [] }, {}).alertas,
    []
  );
});
test("tabela sem PK, trigger desligado e constraint nao validada viram alerta nomeado", () => {
  const dado = {
    ...base([]),
    tabelas_sem_pk: ["log_eventos"],
    triggers_desabilitados: [{ tabela: "estoque", trigger: "baixa_estoque", estado: "D" }],
    constraints_nao_validadas: [{ tabela: "pedidos", constraint: "fk_cliente", tipo: "f" }],
  };
  assert.deepEqual(montarInventario(dado, {}).alertas, [
    { tipo: "tabela_sem_pk", detalhe: ["log_eventos"] },
    { tipo: "trigger_desabilitado", detalhe: ["estoque.baixa_estoque (D)"] },
    { tipo: "constraint_nao_validada", detalhe: ["pedidos.fk_cliente (f)"] },
  ]);
});

test("estado integro (tres listas vazias ou ausentes) nao gera alerta", () => {
  assert.deepEqual(montarInventario(base([]), {}).alertas, []);
  assert.deepEqual(
    montarInventario(
      { ...base([]), tabelas_sem_pk: [], triggers_desabilitados: [], constraints_nao_validadas: [] },
      {}
    ).alertas,
    []
  );
});

test("policy que vale para anon e libera tudo vira alerta nomeado", () => {
  const dado = {
    ...base([]),
    policies_anon_permissivas: [
      { tabela: "produtos", cmd: "SELECT", policy: "leitura_publica", roles: ["anon", "authenticated"] },
    ],
  };
  assert.deepEqual(montarInventario(dado, {}).alertas, [
    { tipo: "policy_anon_permissiva", detalhe: ["produtos.SELECT.leitura_publica (anon,authenticated)"] },
  ]);
});

test("sem policy permissiva para anon nao ha alerta", () => {
  assert.deepEqual(montarInventario(base([]), {}).alertas, []);
  assert.deepEqual(
    montarInventario({ ...base([]), policies_anon_permissivas: [] }, {}).alertas,
    []
  );
});

test("security definer alcancavel sem guarda no corpo vira alerta nomeado", () => {
  const dado = {
    ...base([]),
    funcoes_definer_sem_guarda: [
      { nome: "descontar_pontos", args: "uuid, integer", anon: true, authenticated: true, chamada_por: [] },
      { nome: "adicionar_xp", args: "uuid, integer", anon: false, authenticated: true, chamada_por: [] },
    ],
  };
  assert.deepEqual(montarInventario(dado, {}).alertas, [
    {
      tipo: "funcao_definer_sem_guarda",
      detalhe: ["descontar_pontos(uuid, integer)", "adicionar_xp(uuid, integer)"],
    },
  ]);
});

test("so funcao do fluxo pre-login sem guarda nao gera alerta", () => {
  const dado = {
    ...base([]),
    funcoes_definer_sem_guarda: [
      { nome: "is_tenant_admin", args: "uuid, uuid", anon: true, authenticated: true, chamada_por: [] },
      { nome: "has_role", args: "uuid, text", anon: true, authenticated: true, chamada_por: [] },
    ],
  };
  assert.deepEqual(montarInventario(dado, {}).alertas, []);
});

test("inventario sem a chave de definer sem guarda nao quebra nem inventa alerta", () => {
  assert.deepEqual(montarInventario({ ...base([]), funcoes_definer_sem_guarda: [] }, {}).alertas, []);
  assert.deepEqual(montarInventario(base([]), {}).alertas, []);
});
