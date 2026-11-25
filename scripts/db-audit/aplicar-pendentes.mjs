#!/usr/bin/env node
/**
 * Aplica em producao as migrations de `supabase/migrations/` que ainda nao existem no banco.
 *
 * A pendencia e reconhecida pela EXISTENCIA do objeto no banco (tabela/funcao), nunca pelo
 * ledger `supabase_migrations.schema_migrations`: o ledger carimba segundos diferentes do nome
 * do arquivo, entao comparar versao por versao acusa migration aplicada como pendente.
 *
 * Antes de aplicar, valida estaticamente as dependencias (funcoes e colunas usadas pelo SQL).
 * Falhar aqui e melhor que criar funcao apontando para coluna que nao existe.
 *
 *   SUPABASE_ACCESS_TOKEN=... node scripts/db-audit/aplicar-pendentes.mjs          # so le
 *   SUPABASE_ACCESS_TOKEN=... MODO=aplicar node scripts/db-audit/aplicar-pendentes.mjs
 *
 * Exit: 0 = estado esperado (nada pendente, ou tudo aplicado); 1 = dependency faltando,
 * SQL que nao rodou, ou objeto continuando ausente depois de aplicar.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const RAIZ = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..");
const PROJETO = "ookjbflsnoefnsixrspc";
const API = `${(process.env.SUPABASE_API_URL || "https://api.supabase.com").replace(/\/$/, "")}/v1/projects/${PROJETO}`;
const MODO = (process.env.MODO || "ler").trim();
const TOKEN = process.env.SUPABASE_ACCESS_TOKEN?.trim();

// Colunas que o SQL das migrations pendentes usa. Sem todas, aplicar criaria funcao quebrada.
const COLUNAS = {
  tarefas: ["id", "status", "produto_id", "posicao_origem_id", "quantidade", "operador_id", "data_inicio", "data_conclusao", "quantidade_executada", "updated_at"],
  estoque_posicao: ["id", "posicao_id", "produto_id", "lote_id", "quantidade", "created_at", "updated_at"],
  posicoes_estoque: ["id", "codigo", "status", "updated_at"],
  lotes: ["id", "data_validade", "quantidade_atual", "updated_at"],
  eventos_picking: ["tarefa_id", "operador_id", "produto_id", "posicao_id", "quantidade_solicitada", "quantidade_separada", "correto", "data_inicio", "data_fim", "observacoes"],
  rastreamento_historico: ["tipo_evento", "produto_id", "lote_id", "quantidade", "localizacao", "descricao", "operador_id", "data_evento", "created_at"],
};

// `has_role` recebe o enum `app_role`, nao `text`: procurar por assinatura exata
// (`to_regprocedure('public.has_role(uuid,text)')`) da falso negativo e bloqueia a
// aplicacao. A checagem por nome/schema em pg_proc continua provando que a funcao existe.
const EXISTE_HAS_ROLE =
  "exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace " +
  "where n.nspname = 'public' and p.proname = 'has_role')";

// Mesma regra da migration 20261124120000_SEC_revoke_anon_execute.sql. Essa migration nao cria
// objeto nenhum: ela revoga EXECUTE, entao a prova de aplicacao e negativa -- nenhuma funcao de
// `public` fora do fluxo publico pre-login (e fora de extensao/trigger) pode continuar executavel
// por `anon`, que herda EXECUTE de PUBLIC.
const ANON_PUBLICO = [
  "has_role",
  "is_tenant_admin",
  "is_tenant_member",
  "effective_tenant_id",
  "default_tenant_id",
  "current_tenant_id",
  "check_login_lockout",
  "record_failed_login",
  "reset_login_attempts",
  "get_backend_health",
];

const ANON_SEM_EXECUTE =
  "not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace " +
  "where n.nspname = 'public' and p.prorettype <> 'pg_catalog.trigger'::regtype " +
  "and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e') " +
  "and has_function_privilege('anon', p.oid, 'EXECUTE') " +
  `and p.proname <> all (array[${ANON_PUBLICO.map((nome) => `'${nome}'`).join(",")}]))`;

// Mesma regra da migration 20261124130000_SEC_mv_revoke_anon.sql. Materialized view nao aceita
// `security_invoker` nem RLS: com SELECT concedido ela roda como o dono e ignora o filtro por
// tenant (comprovado em 2026-11-24: GET /rest/v1/mv_alertas_severidade com a chave publica
// respondeu 200 com linhas). VIEW comum so e problema para `anon` -- view com
// `security_invoker=true` concedida a `authenticated` e uso legitimo.
const VIEWS_SEM_SELECT_PUBLICO =
  "not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace " +
  "where n.nspname = 'public' and c.relkind in ('v', 'm') " +
  "and (has_table_privilege('anon', c.oid, 'SELECT') " +
  "or (c.relkind = 'm' and has_table_privilege('authenticated', c.oid, 'SELECT'))))";

// Mesma regra da migration 20261125120000_SEC_guarda_xp_pontos.sql, em duas provas: as tres funcoes
// internas nao podem ser executaveis por anon/authenticated (20261124120000 tinha concedido em massa)
// e descontar_pontos precisa carregar a guarda no proprio corpo -- ela continua liberada para
// `authenticated` porque a loja de pontos chama o RPC, entao a prova nao pode ser de privilegio.
const XP_PONTOS_FECHADO =
  "not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace " +
  "where n.nspname = 'public' " +
  "and p.proname in ('adicionar_xp', 'incrementar_metrica_dashboard', 'get_user_role') " +
  "and (has_function_privilege('anon', p.oid, 'EXECUTE') " +
  "or has_function_privilege('authenticated', p.oid, 'EXECUTE')))";

const DESCONTAR_PONTOS_GUARDADA =
  "exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace " +
  "where n.nspname = 'public' and p.proname = 'descontar_pontos' " +
  "and p.prosecdef and pg_get_functiondef(p.oid) like '%auth.uid()%')";

const PENDENCIAS = [
  {
    arquivo: "20261123080000_WMS_system_settings.sql",
    nome: "system_settings",
    // Objeto que prova a migration aplicada.
    aplicado: "to_regclass('public.system_settings') is not null",
    // Dependencias que precisam existir ANTES (funcoes usadas nas policies).
    dependencias: [
      ["public.effective_tenant_id()", "to_regprocedure('public.effective_tenant_id()') is not null"],
      ["public.has_role", EXISTE_HAS_ROLE],
    ],
  },
  {
    arquivo: "20261123100000_WMS_picking_rpc.sql",
    nome: "picking_rpc",
    aplicado:
      "to_regprocedure('public.iniciar_tarefa_picking(uuid)') is not null and " +
      "to_regprocedure('public.concluir_tarefa_picking(uuid,numeric,text)') is not null",
    dependencias: [["public.has_role", EXISTE_HAS_ROLE]],
  },
  {
    arquivo: "20261124120000_SEC_revoke_anon_execute.sql",
    nome: "revoke_anon_execute",
    aplicado: ANON_SEM_EXECUTE,
    dependencias: [],
  },
  {
    arquivo: "20261124130000_SEC_mv_revoke_anon.sql",
    nome: "mv_revoke_anon",
    aplicado: VIEWS_SEM_SELECT_PUBLICO,
    dependencias: [],
  },
  {
    arquivo: "20261125120000_SEC_guarda_xp_pontos.sql",
    nome: "guarda_xp_pontos",
    aplicado: `${XP_PONTOS_FECHADO} and ${DESCONTAR_PONTOS_GUARDADA}`,
    dependencias: [["public.has_role", EXISTE_HAS_ROLE]],
  },
];

function sqlEstado() {
  const pares = Object.entries(COLUNAS)
    .flatMap(([tabela, cols]) => cols.map((col) => `('${tabela}','${col}')`))
    .join(",");
  const pendencias = PENDENCIAS.map((p) => `'${p.nome}', ${p.aplicado}`).join(",");
  const deps = PENDENCIAS.flatMap((p) => p.dependencias)
    .map(([rotulo, expr]) => `'${rotulo}', ${expr}`)
    .join(",");
  return `select json_build_object(
  'aplicado', json_build_object(${pendencias}),
  'dependencias', json_build_object(${deps}),
  'colunas_faltando', coalesce((
    select json_agg(t.tabela || '.' || t.coluna)
    from (values ${pares}) as t(tabela, coluna)
    where not exists (
      select 1 from information_schema.columns c
      where c.table_schema = 'public' and c.table_name = t.tabela and c.column_name = t.coluna
    )
  ), '[]'::json)
) as estado`;
}

async function chamarApi(caminho, init) {
  const res = await fetch(`${API}${caminho}`, {
    ...init,
    headers: { Authorization: `Bearer ${TOKEN}`, "Content-Type": "application/json" },
    signal: AbortSignal.timeout(180_000),
  });
  const texto = await res.text();
  if (!res.ok) {
    // O corpo do erro e o unico diagnostico util quando o SQL falha; credencial nunca aparece nele.
    const limpo = texto.replace(/Bearer\s+[A-Za-z0-9._-]{20,}|eyJ[A-Za-z0-9_-]{20,}\.[\w-]+\.|sb_secret_\w+/g, "<credencial>");
    throw new Error(`Management API ${caminho} respondeu HTTP ${res.status}: ${limpo.slice(0, 900)}`);
  }
  return texto ? JSON.parse(texto) : null;
}

function linhas(resposta) {
  if (Array.isArray(resposta)) return resposta;
  if (Array.isArray(resposta?.rows)) return resposta.rows;
  if (Array.isArray(resposta?.result)) return resposta.result;
  return [];
}

async function lerEstado() {
  const resposta = await chamarApi("/database/query/read-only", { method: "POST", body: JSON.stringify({ query: sqlEstado() }) });
  const estado = linhas(resposta)[0]?.estado ?? linhas(resposta)[0];
  if (!estado?.aplicado || !estado?.dependencias) throw new Error("resposta sem o objeto esperado: nada foi aplicado");
  return estado;
}

function imprimir(estado) {
  for (const p of PENDENCIAS) console.log(`${estado.aplicado[p.nome] ? "aplicado " : "PENDENTE "} ${p.arquivo}`);
  const depsFaltando = Object.entries(estado.dependencias).filter(([, ok]) => !ok).map(([d]) => d);
  if (depsFaltando.length) console.log(`dependencias faltando: ${depsFaltando.join(", ")}`);
  const colunas = estado.colunas_faltando ?? [];
  if (colunas.length) console.log(`colunas faltando (${colunas.length}): ${colunas.join(", ")}`);
}

/** Registra a versao no ledger para o Supabase CLI nao tentar reaplicar (best-effort). */
async function registrarLedger(versao, nome) {
  const tentativas = [
    `insert into supabase_migrations.schema_migrations (version, name) values ('${versao}', '${nome}') on conflict do nothing`,
    `insert into supabase_migrations.schema_migrations (version) values ('${versao}') on conflict do nothing`,
  ];
  for (const query of tentativas) {
    try {
      await chamarApi("/database/query", { method: "POST", body: JSON.stringify({ query }) });
      return true;
    } catch {
      // coluna inexistente em schema_migrations: tenta a proxima forma
    }
  }
  return false;
}

async function main() {
  if (!TOKEN) throw new Error("sem SUPABASE_ACCESS_TOKEN: nada foi lido nem aplicado");

  const antes = await lerEstado();
  imprimir(antes);

  const aplicar = MODO === "aplicar";
  const faltando = PENDENCIAS.filter((p) => !antes.aplicado[p.nome]);
  if (!faltando.length) {
    console.log("nada pendente: banco ja tem os objetos das migrations do repo");
    return;
  }
  if (!aplicar) {
    console.log(`${faltando.length} migration(oes) pendente(s); rode com MODO=aplicar para aplicar`);
    return;
  }

  const depsFaltando = Object.entries(antes.dependencias).filter(([, ok]) => !ok);
  const colunasFaltando = antes.colunas_faltando ?? [];
  if (depsFaltando.length || colunasFaltando.length) {
    throw new Error("dependencias ausentes no banco: aplicar criaria objeto quebrado (nada foi aplicado)");
  }

  for (const p of faltando) {
    const sql = fs.readFileSync(path.join(RAIZ, "supabase/migrations", p.arquivo), "utf8");
    // BEGIN/COMMIT explicitos: a migration inteira entra ou nao entra, inclusive as policies.
    await chamarApi("/database/query", { method: "POST", body: JSON.stringify({ query: `BEGIN;\n${sql}\nCOMMIT;` }) });
    const [versao] = p.arquivo.split("_");
    const registrado = await registrarLedger(versao, p.nome);
    console.log(`aplicado ${p.arquivo}${registrado ? "" : " (ledger nao registrado)"}`);
  }

  const depois = await lerEstado();
  imprimir(depois);
  const restou = PENDENCIAS.filter((p) => !depois.aplicado[p.nome]);
  if (restou.length) throw new Error(`continua pendente depois de aplicar: ${restou.map((p) => p.arquivo).join(", ")}`);
  console.log("banco de producao sincronizado com supabase/migrations");
}

main().catch((erro) => {
  console.error(`❌ ${erro.message}`);
  process.exit(1);
});
