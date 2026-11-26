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
// `public` fora da allowlist (e fora de extensao/trigger) pode continuar executavel
// por `anon`, que herda EXECUTE de PUBLIC.
const ANON_PUBLICO = [
  "has_role",
  "is_tenant_admin",
  "is_tenant_member",
  "effective_tenant_id",
  "default_tenant_id",
  "current_tenant_id",
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

// Mesma regra da migration 20261126170000_SEC_ultima_palavra_privilegios.sql. Precisa ser PENDENCIA
// propria porque 20261124120000 concede EXECUTE a `authenticated` por catalogo e desfaz
// 20261125120000 a cada aplicacao: sem uma prova separada, o estado regride em silencio.
const INTERNAS_SERVICE_ONLY =
  "not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace " +
  "where n.nspname = 'public' " +
  "and p.proname in ('check_login_lockout', 'record_failed_login', 'reset_login_attempts', " +
  "'adicionar_xp', 'incrementar_metrica_dashboard', 'get_user_role') " +
  "and (has_function_privilege('anon', p.oid, 'EXECUTE') " +
  "or has_function_privilege('authenticated', p.oid, 'EXECUTE')))";

// As 6 migrations de 2026-11-26 ficaram fora deste array e por isso nunca foram aplicadas pela
// automacao. As provas abaixo seguem a mesma regra: o efeito observavel no banco, nunca o ledger.

// 20261126090000 e 20261126120000 escrevem os MESMOS 3 jobs de cron; a segunda troca o header
// `Authorization: Bearer` por `x-cron-secret`. Provar pelo efeito final evita reaplicar a primeira
// depois da segunda e regredir o header.
const CRON_JOBS_COM_HEADER =
  "not exists (select 1 from (values ('reorder-check-daily'),('stock-alert-daily'),('alert-expiration-daily')) " +
  "as j(nome) where not exists (select 1 from cron.job c " +
  "where c.jobname = j.nome and c.command like '%x-cron-secret%' and c.command like '%cron_secret%'))";

// 20261126130000 cria a tabela de cursor e o cron do catalogo mestre.
const CATALOGO_SYNC_LIGADO =
  "to_regclass('public.produtos_sync_estado') is not null and exists " +
  "(select 1 from cron.job where jobname = 'produtos-sync-catalogo')";

// 20261126140000 tira as 3 RPCs de lockout do alcance de anon/authenticated e mantem service_role.
const LOCKOUT_RPC_SO_SERVICE_ROLE =
  "not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace " +
  "where n.nspname = 'public' " +
  "and p.proname in ('check_login_lockout', 'record_failed_login', 'reset_login_attempts') " +
  "and (has_function_privilege('anon', p.oid, 'EXECUTE') " +
  "or has_function_privilege('authenticated', p.oid, 'EXECUTE'))) " +
  "and exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace " +
  "where n.nspname = 'public' " +
  "and p.proname in ('check_login_lockout', 'record_failed_login', 'reset_login_attempts') " +
  "and has_function_privilege('service_role', p.oid, 'EXECUTE'))";

// 20261126150000 cria os 7 indices de FK. Prova identica a auto-prova da migration.
const FKS_COM_INDICE =
  "not exists (select 1 from pg_constraint c " +
  "where c.contype = 'f' and c.connamespace = 'public'::regnamespace " +
  "and not exists (select 1 from pg_index i where i.indrelid = c.conrelid " +
  "and i.indisvalid and i.indpred is null " +
  "and (i.indkey::smallint[])[0:array_length(c.conkey, 1) - 1] = c.conkey))";

// 20261126160000 derruba 6 indices duplicados. Prova negativa: nenhum deles pode voltar a existir.
const INDICES_DUPLICADOS_FORA =
  "to_regclass('public.idx_estoque_posicao') is null " +
  "and to_regclass('public.idx_estoque_posicao_posicao_id') is null " +
  "and to_regclass('public.idx_estoque_posicao_produto_id') is null " +
  "and to_regclass('public.idx_estoque_posicao_lote_id') is null " +
  "and to_regclass('public.idx_login_attempts_email') is null " +
  "and to_regclass('public.idx_posicoes_estoque_codigo') is null";

// 20261126180000 revoga DML de anon em todas as tabelas de public.
// Prova: nenhuma tabela de public pode manter INSERT/UPDATE/DELETE para anon.
const ANON_SEM_ESCRITA =
  "not exists (select 1 from pg_class c join pg_namespace n on n.oid = c.relnamespace " +
  "where n.nspname = 'public' and c.relkind in ('r','p','f') " +
  "and (has_table_privilege('anon', c.oid, 'INSERT') " +
  "or has_table_privilege('anon', c.oid, 'UPDATE') " +
  "or has_table_privilege('anon', c.oid, 'DELETE')))";

// 20261127090000_SEC_tenant_isolation_endurecer.sql -- (1) tenant_id vira NOT NULL com
// DEFAULT effective_tenant_id() onde existe a policy tenant_isolation; (2) o predicado da
// restritiva perde o "tenant_id is null", que deixava qualquer linha orfa visivel para
// todos; (3) as policies PERMISSIVE de predicado true so saem quando redundantes, isto e,
// quando cada comando que elas cobrem continua coberto por outra permissiva real.
// A prova abaixo cobra exatamente isso. A versao anterior exigia ZERO permissivas true
// fora de anon/public, o que e' impossivel por desenho: as tabelas cujo unico caminho e'
// a permissiva true (gamificacao_loja, integration_logs, reorder_suggestions, shipments,
// stock_alerts, suppliers) precisam mante-la, senao ficam sem acesso nenhum. Medido no
// run 45754257195: a migration aplicou (TEN 9 nullable 73 -> 0, RLS 7 63 -> 40) e o job
// falhou mesmo assim com "continua pendente depois de aplicar".
const TENANT_NOT_NULL =
  "not exists (select 1 from information_schema.columns c " +
  "where c.table_schema = 'public' and c.column_name = 'tenant_id' and c.is_nullable = 'YES' " +
  "and exists (select 1 from pg_policies t where t.schemaname = 'public' " +
  "and t.tablename = c.table_name and t.policyname = 'tenant_isolation')) " +
  "and not exists (select 1 from pg_policies p where p.schemaname = 'public' " +
  "and p.policyname = 'tenant_isolation' and coalesce(p.qual, '') like '%is null%') " +
  "and not exists (select 1 from pg_policies p where p.schemaname = 'public' " +
  "and p.permissive = 'PERMISSIVE' " +
  "and (btrim(coalesce(p.qual, '')) = 'true' or btrim(coalesce(p.with_check, '')) = 'true') " +
  "and not ('anon' = any(p.roles) or 'public' = any(p.roles)) " +
  "and not exists (select 1 " +
  "from unnest(case p.cmd when 'ALL' then array['SELECT','INSERT','UPDATE','DELETE'] else array[p.cmd] end) as cmd_alvo " +
  "where not exists (select 1 from pg_policies o where o.schemaname = 'public' " +
  "and o.tablename = p.tablename and o.policyname <> p.policyname and o.permissive = 'PERMISSIVE' " +
  "and o.cmd in (cmd_alvo, 'ALL') " +
  "and not (btrim(coalesce(o.qual, '')) = 'true' or btrim(coalesce(o.with_check, '')) = 'true'))))";

// 20261127230000 nao cria objeto nenhum: troca o ROLE das policies permissivas de
// `{anon,public}` para `authenticated`. A prova e a mesma da migration -- nao pode sobrar
// permissiva de anon/public fora da negacao explicita (login_attempts) e do filtro por unidade
// (tenant_isolation, que e RESTRICTIVE), e a policy de insert de entity_versions exige sessao.
const POLICIES_SO_AUTHENTICATED =
  "not exists (select 1 from pg_policies p where p.schemaname = 'public' " +
  "and p.permissive = 'PERMISSIVE' " +
  "and p.policyname not in ('login_attempts_deny_anon_all', 'tenant_isolation') " +
  "and exists (select 1 from unnest(p.roles) r where r::text in ('anon', 'public'))) " +
  "and exists (select 1 from pg_policies p where p.schemaname = 'public' " +
  "and p.tablename = 'entity_versions' and p.policyname = 'entity_versions_insercao' " +
  "and exists (select 1 from unnest(p.roles) r where r::text = 'authenticated'))";

// 20261128100000 troca a UNIQUE de estoque_posicao por NULLS NOT DISTINCT: e a forma que
// `on conflict (posicao_id, produto_id, lote_id)` aceita quando o lote vem nulo. Sem ela o
// Postgres responde 42P10 (nenhum indice arbiter) ou grava saldo duplicado.
const ESTOQUE_CHAVE_UPSERT =
  "exists (select 1 from pg_index i join pg_class c on c.oid = i.indexrelid " +
  "where i.indrelid = 'public.estoque_posicao'::regclass and i.indisunique " +
  "and i.indnullsnotdistinct " +
  "and pg_get_indexdef(i.indexrelid) like '%(posicao_id, produto_id, lote_id)%')";

// Toda migration com versao a partir daqui nasce depois que esta automacao virou a via de
// aplicacao em producao: se ela nao tiver entrada em PENDENCIAS, o script nao le nem aplica, e
// ainda imprime "nada pendente" com DDL faltando no banco. Foi o que aconteceu com as 6
// migrations de 2026-11-26 (ver comentario em PENDENCIAS). Agora isso falha em vez de passar.
// 20261129100000 fecha o que a 20261124120000 deixou de fora de proposito: as funcoes de trigger.
// Medicao de producao em 2026-11-26 (run 45791932357) mostrou 7 funcoes ainda executaveis por `anon`,
// entre elas aplicar_ajuste_estoque (altera saldo) e attach_user_to_default_tenant. Prova negativa:
// ninguem de `public` fora da allowlist publica executa como anon.
const SEC_ANON_TODAS_FUNCOES =
  "not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace " +
  "where n.nspname = 'public' " +
  "and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e') " +
  "and p.proname <> all (array['has_role','is_tenant_admin','is_tenant_member'," +
  "'effective_tenant_id','default_tenant_id','current_tenant_id','check_login_lockout'," +
  "'record_failed_login','reset_login_attempts','get_backend_health']) " +
  "and has_function_privilege('anon', p.oid, 'EXECUTE'))";

// 20261129150000 corrige a 20261129100000: revoga anon/PUBLIC sem reabrir `authenticated`.
// A prova exige tres coisas ao mesmo tempo: (a) ninguem executa como anon fora da allowlist,
// (b) as internas adicionar_xp e get_user_role continuam fechadas para authenticated,
// (c) descontar_pontos continua aberta para authenticated (a loja de pontos chama com JWT).
const SEC_ANON_PRESERVA_AUTH =
  "(not exists (select 1 from pg_proc p join pg_namespace n on n.oid = p.pronamespace " +
  "where n.nspname = 'public' " +
  "and not exists (select 1 from pg_depend d where d.objid = p.oid and d.deptype = 'e') " +
  "and p.proname <> all (array['has_role','is_tenant_admin','is_tenant_member'," +
  "'effective_tenant_id','default_tenant_id','current_tenant_id','check_login_lockout'," +
  "'record_failed_login','reset_login_attempts','get_backend_health']) " +
  "and has_function_privilege('anon', p.oid, 'EXECUTE')) " +
  "and not has_function_privilege('authenticated', " +
  "to_regprocedure('public.adicionar_xp(uuid, integer, text, text, uuid)'), 'EXECUTE') " +
  "and not has_function_privilege('authenticated', " +
  "to_regprocedure('public.get_user_role(uuid)'), 'EXECUTE') " +
  "and has_function_privilege('authenticated', " +
  "to_regprocedure('public.descontar_pontos(uuid, integer)'), 'EXECUTE'))";

// Toda migration com timestamp >= este corte precisa de entrada em PENDENCIAS, senao o job falha.
// 20261127 escondia a 20261126194000 (refresh das matviews do dashboard), criada fora de ordem.
const CORTE_COBERTURA = "20261126";

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
  {
    arquivo: "20261126090000_SEC_edges-cron-com-credencial.sql",
    nome: "edges_cron_credencial",
    // Substituida por 20261126120000 (mesmos jobs, header melhor): a prova e o estado final.
    aplicado: CRON_JOBS_COM_HEADER,
    dependencias: [],
  },
  {
    arquivo: "20261126120000_SEC_cron-header-x-cron-secret.sql",
    nome: "cron_header_x_cron_secret",
    aplicado: CRON_JOBS_COM_HEADER,
    // vault.secrets.cron_secret e gravado por .github/workflows/edges-guarda-cron.yml.
    dependencias: [
      ["vault.secrets.cron_secret", "exists (select 1 from vault.secrets where name = 'cron_secret')"],
    ],
  },
  {
    arquivo: "20261126130000_CAT_produtos-sync.sql",
    nome: "produtos_sync_catalogo",
    aplicado: CATALOGO_SYNC_LIGADO,
    dependencias: [
      ["vault.secrets.cron_secret", "exists (select 1 from vault.secrets where name = 'cron_secret')"],
    ],
  },
  {
    arquivo: "20261126140000_SEC_login_rpc_service_role.sql",
    nome: "login_rpc_service_role",
    aplicado: LOCKOUT_RPC_SO_SERVICE_ROLE,
    dependencias: [],
  },
  {
    arquivo: "20261126150000_PERF_indices_fk.sql",
    nome: "indices_fk",
    aplicado: FKS_COM_INDICE,
    dependencias: [],
  },
  {
    arquivo: "20261126160000_PERF_dedup_indices.sql",
    nome: "dedup_indices",
    aplicado: INDICES_DUPLICADOS_FORA,
    dependencias: [],
  },
  {
    // 20261126170000 e a "ultima palavra": revoga os 6 nomes internos de uma vez. Vem depois das
    // outras porque 20261124120000 concede por catalogo e so ela fecha o conjunto todo.
    arquivo: "20261126170000_SEC_ultima_palavra_privilegios.sql",
    nome: "privilegios_finais",
    aplicado: `${INTERNAS_SERVICE_ONLY} and ${DESCONTAR_PONTOS_GUARDADA}`,
    dependencias: [["public.has_role", EXISTE_HAS_ROLE]],
  },
  {
    arquivo: "20261126180000_SEC_revoke_anon_dml.sql",
    nome: "anon_sem_escrita",
    aplicado: ANON_SEM_ESCRITA,
    dependencias: [],
  },
  {
    // 20261126190000 reagenda os 4 crons de edge com timeout de 120s. A prova exige os 4 agendados,
    // ativos e com o timeout explicito: sem ele o pg_net volta aos 5s padrao, que estouraram em 4
    // das 12 execucoes do cron do catalogo (diag alvo=db, run 45756104163).
    arquivo: "20261126190000_PERF_cron_timeout_pgnet.sql",
    nome: "cron_timeout_pgnet",
    aplicado:
      "(select count(*) from cron.job where jobname in ('produtos-sync-catalogo','reorder-check-daily','stock-alert-daily','alert-expiration-daily')) = 4 " +
      "and not exists (select 1 from cron.job where jobname in ('produtos-sync-catalogo','reorder-check-daily','stock-alert-daily','alert-expiration-daily') and (not active or command not like '%timeout_milliseconds := 120000%'))",
    dependencias: [
      ["vault.secrets.cron_secret", "exists (select 1 from vault.secrets where name = 'cron_secret')"],
    ],
  },
  {
    arquivo: "20261127090000_SEC_tenant_isolation_endurecer.sql",
    nome: "tenant_not_null",
    aplicado: TENANT_NOT_NULL,
    dependencias: [],
  },
  {
    // 20261127200000 entrega o historico de versoes (entity_versions) que o front ja tinha pronto
    // (src/hooks/useEntityVersions.ts + src/components/versioning/VersionHistory.tsx) e o banco nunca
    // criou: tabela, trigger em produtos e RPC de restauracao real. Sem esta entry a migration
    // mergeada nunca roda.
    arquivo: "20261127200000_WMS_entity_versions.sql",
    nome: "entity_versions",
    aplicado:
      "to_regclass('public.entity_versions') is not null " +
      "and exists (select 1 from pg_class c where c.oid = to_regclass('public.entity_versions') and c.relrowsecurity) " +
      "and exists (select 1 from pg_trigger where tgname = 'trg_versao_produtos' and not tgisinternal and tgrelid = 'public.produtos'::regclass) " +
      "and to_regprocedure('public.restore_entity_version(text,uuid,integer)') is not null",
    dependencias: [
      ["public.effective_tenant_id", "to_regproc('public.effective_tenant_id') is not null"],
      ["public.produtos", "to_regclass('public.produtos') is not null"],
    ],
  },
  {
    // 20261127200000 criou a FK entity_versions.changed_by sem indice no lado filho: o probe
    // "FKs de public sem indice de suporte" passou a acusar 1 e a pendencia indices_fk voltou a
    // ficar pendente depois de aplicar, derrubando o job com exit 1.
    arquivo: "20261127210000_PERF_entity_versions_indice_fk.sql",
    nome: "entity_versions_indice_fk",
    aplicado: "to_regclass('public.idx_entity_versions_changed_by') is not null",
    dependencias: [["public.entity_versions", "to_regclass('public.entity_versions') is not null"]],
  },
  {
    // 20261127230000 nao cria objeto: ela tira as policies de identidade de `{anon,public}`.
    // Sem entrada aqui ela nunca rodaria, e a chave publica do site continuaria coberta por
    // policy que nao exige sessao.
    arquivo: "20261127230000_SEC_policies_so_authenticated.sql",
    nome: "policies_so_authenticated",
    aplicado: POLICIES_SO_AUTHENTICATED,
    dependencias: [["public.entity_versions", "to_regclass('public.entity_versions') is not null"]],
  },
  {
    // 20261128100000 entrega a chave de upsert que o app usa (posicao_id, produto_id, lote_id)
    // na forma NULLS NOT DISTINCT. Sem esta entrada a migration mergeada nunca rodaria e o
    // upsert de estoque sem lote continuaria estourando 42P10 em producao.
    arquivo: "20261128100000_WMS_estoque_posicao_chave_upsert.sql",
    nome: "estoque_posicao_chave_upsert",
    aplicado: ESTOQUE_CHAVE_UPSERT,
    dependencias: [["public.estoque_posicao", "to_regclass('public.estoque_posicao') is not null"]],
  },
  {
    // 20261129100000 nao cria objeto: fecha EXECUTE de anon/PUBLIC nas funcoes de trigger e nas duas
    // RPC de escrita que a revogacao anterior deixou abertas.
    arquivo: "20261129100000_SEC_revoke_anon_todas_funcoes.sql",
    nome: "sec_anon_todas_funcoes",
    aplicado: SEC_ANON_TODAS_FUNCOES,
    dependencias: [["public.has_role", EXISTE_HAS_ROLE]],
  },
  {
    // 20261129150000 fecha o que a 20261129100000 deixou aberto em `authenticated` (as 6 internas
    // voltaram a ser executaveis por qualquer usuario logado) sem perder as RPCs do app.
    arquivo: "20261129150000_SEC_anon_preserva_privilegio_authenticated.sql",
    nome: "sec_anon_preserva_authenticated",
    aplicado: SEC_ANON_PRESERVA_AUTH,
    dependencias: [["public.has_role", EXISTE_HAS_ROLE]],
  },
  {
    // 20261126194000 agenda o refresh diario das 3 matviews do dashboard. Nenhum dos crons
    // anteriores atualiza as matviews, entao sem este job a tela de Observabilidade exibe o
    // retrato congelado de 2026-07-23.
    arquivo: "20261126194000_OBS_refresh_mv_dashboard_cron.sql",
    nome: "obs_refresh_mv_dashboard_cron",
    aplicado: "exists (select 1 from cron.job where jobname = 'dashboard-mv-refresh')",
    dependencias: [],
  },
  {
    // 20261126201000 libera UPDATE(status) para os botoes Aprovar/Ignorar da tela de Automacoes.
    // A policy permissiva FOR ALL ja existia; o unico grant a `authenticated` era SELECT.
    arquivo: "20261126201000_AUT_reorder_status_grant.sql",
    nome: "aut_reorder_status_grant",
    aplicado:
      "has_column_privilege('authenticated','public.reorder_suggestions','status','UPDATE')",
    dependencias: [],
  },
  {
    // 20261126220000 cria get_automacoes_saude(), que alimenta o card "Saude da sincronizacao"
    // da tela de Automacoes. Sem ela a tela nao tem como saber se o cron do catalogo esta vivo,
    // porque produtos_sync_estado e fechado para anon/authenticated.
    arquivo: "20261126220000_AUT_saude_crons.sql",
    nome: "aut_saude_crons",
    aplicado: "to_regprocedure('public.get_automacoes_saude()') is not null",
    dependencias: [["public.has_role", EXISTE_HAS_ROLE]],
  },
  {
    // 20261130095000 fecha a superficie anon de funcoes de forma permanente. A varredura por
    // catalogo pega get_automacoes_saude, criada depois das revogacoes de 24/11, e o event
    // trigger impede que a proxima funcao criada em `public` nasca executavel pela chave
    // publica. Sem o event trigger a prova de ANON_SEM_EXECUTE volta a reprovar na proxima
    // funcao criada.
    arquivo: "20261130095000_SEC_anon_autoprotecao_funcoes.sql",
    nome: "sec_anon_autoprotecao_funcoes",
    aplicado:
      ANON_SEM_EXECUTE +
      " and exists (select 1 from pg_event_trigger " +
      "where evtname = 'fechar_execute_anon_funcao_nova')",
    dependencias: [["public.has_role", EXISTE_HAS_ROLE]],
  },
  {
    // 20261130090000 cria `feature_flags`: a tabela que src/lib/featureFlags.ts lia desde
    // sempre e que nunca existiu (HTTP 404 PGRST205 medido em producao em 26/11/2026).
    arquivo: "20261130090000_FLAGS_feature_flags.sql",
    nome: "feature_flags",
    aplicado:
      "to_regclass('public.feature_flags') is not null and " +
      "coalesce((select relrowsecurity from pg_class where oid = to_regclass('public.feature_flags')), false) " +
      "and (select count(*) from pg_policies where schemaname = 'public' and tablename = 'feature_flags') = 4",
    dependencias: [["public.has_role", EXISTE_HAS_ROLE]],
  },  {
    // 20261130096000 cria o indice de suporte da FK feature_flags.updated_by. Sem ele a prova
    // global de `indices_fk` (nenhuma FK de public sem indice de suporte) reprova: a lista da
    // 20261126150000 e fechada e nao cobria a FK da tabela nova.
    arquivo: "20261130096000_PERF_feature_flags_indice_fk.sql",
    nome: "feature_flags_indice_fk",
    aplicado: FKS_COM_INDICE,
    dependencias: [],
  },
  {
    // 20261130100000 libera SELECT em produtos_sync_estado para a tela de integracoes: a tabela
    // nasceu com RLS e nenhuma policy, entao a edge escrevia o cursor e ninguem lia.
    arquivo: "20261130100000_UI_produtos_sync_estado_leitura.sql",
    nome: "produtos_sync_estado_leitura",
    aplicado:
      "has_table_privilege('authenticated', 'public.produtos_sync_estado', 'SELECT') " +
      "and not has_table_privilege('anon', 'public.produtos_sync_estado', 'SELECT') " +
      "and exists (select 1 from pg_policies where schemaname = 'public' " +
      "and tablename = 'produtos_sync_estado' and cmd = 'SELECT')",
    dependencias: [
      ["public.produtos_sync_estado", "to_regclass('public.produtos_sync_estado') is not null"],
    ],
  },
  {
    // 20261130110000 garante a linha unica de `inventario_config` e o INSERT do admin.
    // A aba Configuracoes do inventario exibia constantes e nao gravava nada; a tabela estava
    // vazia em producao, entao o UPDATE autorizado atingia 0 linhas em silencio.
    arquivo: "20261130110000_UI_inventario_config_edicao.sql",
    nome: "inventario_config",
    aplicado:
      "to_regclass('public.inventario_config') is not null and " +
      "exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'inventario_config' " +
      "and policyname = 'Admins can insert config')",
    dependencias: [["public.has_role", EXISTE_HAS_ROLE]],
  },
  {
    // 20261130120000 popula as 8 regras de `alertas_config`: a tela Alertas > Configuracoes
    // exibia "nenhuma configuracao encontrada" e nao tinha o que ligar/desligar por tipo.
    arquivo: "20261130120000_UI_alertas_config_edicao.sql",
    nome: "alertas_config",
    aplicado:
      "to_regclass('public.alertas_config') is not null " +
      "and (select count(*) from public.alertas_config) = 8",
    dependencias: [],
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

/** Migrations do repo que nenhuma entrada de PENDENCIAS cobre: seriam ignoradas em silencio. */
function migrationsSemEntrada() {
  return fs
    .readdirSync(path.join(RAIZ, "supabase/migrations"))
    .filter((f) => f.endsWith(".sql") && f.slice(0, 8) >= CORTE_COBERTURA)
    .filter((f) => !PENDENCIAS.some((p) => p.arquivo === f))
    .sort();
}

async function main() {
  if (!TOKEN) throw new Error("sem SUPABASE_ACCESS_TOKEN: nada foi lido nem aplicado");

  // Falha ruidosa antes de tocar no banco: cobertura incompleta = DDL mergeada que nunca sobe.
  const semEntrada = migrationsSemEntrada();
  if (semEntrada.length) {
    throw new Error(
      `migration sem entrada em PENDENCIAS (nunca seria lida nem aplicada): ${semEntrada.join(", ")}`,
    );
  }

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
