#!/usr/bin/env bash
# Consulta read-only no Postgres de producao via Management API.
set +e

TOKEN="${SUPABASE_ACCESS_TOKEN:?}"
SB_URL="${SB_URL:?}"
REF="${SB_URL#https://}"
REF="${REF%%.supabase.co*}"
echo "== projeto: $REF =="

q() {
  local label="$1" sql="$2" body
  echo "===== $label ====="
  body=$(jq -nc --arg q "$sql" '{query:$q}')
  curl -s -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
    --data-binary "$body" | head -c 4000
  echo
}

q "Funcoes de picking no catalogo" "select p.proname, pg_get_function_identity_arguments(p.oid) as args, p.prosecdef as secdef from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname in ('iniciar_tarefa_picking','concluir_tarefa_picking') order by 1"

q "EXECUTE por role nas RPCs de picking" "select has_function_privilege('anon','public.iniciar_tarefa_picking(uuid)','EXECUTE') as anon_iniciar, has_function_privilege('authenticated','public.iniciar_tarefa_picking(uuid)','EXECUTE') as auth_iniciar, has_function_privilege('anon','public.concluir_tarefa_picking(uuid,numeric,text)','EXECUTE') as anon_concluir, has_function_privilege('authenticated','public.concluir_tarefa_picking(uuid,numeric,text)','EXECUTE') as auth_concluir"

q "Superficie anon: funcoes publicas executaveis pela chave publica" "select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prokind='f' and has_function_privilege('anon', p.oid, 'EXECUTE') order by 1"

q "Tabelas chave: existe, RLS, policies" "select c.relname, c.relrowsecurity as rls, (select count(*) from pg_policies pol where pol.schemaname='public' and pol.tablename=c.relname) as policies from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relname in ('tarefas','system_settings','produtos','user_roles','estoque_posicoes') order by 1"

q "SELECT concedido a anon nas tabelas chave" "select c.relname, has_table_privilege('anon', c.oid, 'SELECT') as anon_select from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relname in ('tarefas','system_settings','produtos','user_roles','estoque_posicoes') order by 1"

q "Volumes" "select (select count(*) from public.system_settings) as system_settings, (select count(*) from public.tarefas) as tarefas, (select count(*) from public.user_roles where role='admin') as admins"

q "Migrations registradas no banco" "select count(*) as aplicadas from supabase_migrations.schema_migrations"

q "Ultimas migrations aplicadas" "select version from supabase_migrations.schema_migrations order by version desc limit 8"

q "Guardas internas das funcoes expostas a anon" "select p.proname, p.prosecdef as definer, (pg_get_functiondef(p.oid) like '%auth.uid()%') as checa_auth_uid from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prokind='f' and has_function_privilege('anon', p.oid, 'EXECUTE') order by 1"

q "Funcoes citadas em policies de RLS" "select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and exists (select 1 from pg_policies pol where pol.schemaname='public' and ((coalesce(pol.qual,'') like '%'||p.proname||'%') or (coalesce(pol.with_check,'') like '%'||p.proname||'%'))) order by 1"

q "Policies das tabelas chave" "select tablename, policyname, cmd, coalesce(qual,'') as usando, coalesce(with_check,'') as com_check from pg_policies where schemaname='public' and tablename in ('tarefas','produtos','system_settings','user_roles') order by 1,2"
q "Policies (todos os schemas) que citam as funcoes candidatas" "select schemaname||'.'||tablename||' :: '||policyname as pol from pg_policies where coalesce(qual,'')||' '||coalesce(with_check,'') ~* 'iniciar_tarefa_picking|concluir_tarefa_picking|move_stock|aplicar_ajuste_estoque|log_audit_event|registrar_checkin_diario|collect_challenge_reward|adicionar_xp|descontar_pontos|get_current_user_permissions|get_dashboard_metrics|refresh_dashboard_materialized_views|incrementar_metrica_dashboard|attach_user_to_default_tenant|get_user_role|has_role_v2|get_min_stock_threshold|get_reorder_point'"

q "Views que citam as funcoes candidatas" "select schemaname||'.'||viewname as v from pg_views where definition ~* 'iniciar_tarefa_picking|concluir_tarefa_picking|move_stock|aplicar_ajuste_estoque|log_audit_event|registrar_checkin_diario|collect_challenge_reward|adicionar_xp|descontar_pontos|get_current_user_permissions|get_dashboard_metrics|refresh_dashboard_materialized_views|incrementar_metrica_dashboard|attach_user_to_default_tenant|get_user_role|has_role_v2|get_min_stock_threshold|get_reorder_point'"

q "Integridade: FKs de public sem indice de suporte" "select c.conrelid::regclass::text as tabela, c.conname, pg_get_constraintdef(c.oid) as definicao from pg_constraint c where c.contype='f' and c.connamespace='public'::regnamespace and not exists (select 1 from pg_index i where i.indrelid=c.conrelid and i.indisvalid and i.indpred is null and (i.indkey::smallint[])[0:array_length(c.conkey,1)-1] = c.conkey) order by 1,2"

q "Integridade: constraints de public nao validadas" "select conrelid::regclass::text as tabela, conname, contype, convalidated from pg_constraint where connamespace='public'::regnamespace and not convalidated order by 1,2"

q "Integridade: indices invalidos ou nao prontos" "select c.relname as tabela, i.indexrelid::regclass::text as indice, i.indisvalid, i.indisready from pg_index i join pg_class c on c.oid=i.indrelid where c.relnamespace='public'::regnamespace and (not i.indisvalid or not i.indisready) order by 1"

q "Integridade: indices duplicados (mesma tabela, colunas e operadores)" "select i.indrelid::regclass::text as tabela, string_agg(i.indexrelid::regclass::text || case when exists (select 1 from pg_constraint k where k.conindid = i.indexrelid) then ' [constraint]' else '' end || case when i.indisunique then ' [unique]' else '' end || ' scan=' || coalesce((select s.idx_scan from pg_stat_user_indexes s where s.indexrelid = i.indexrelid), 0) || ' ' || pg_size_pretty(pg_relation_size(i.indexrelid)), ' | ' order by i.indexrelid::regclass::text) as indices_sem_duplicata from pg_index i where i.indisvalid and i.indrelid in (select oid from pg_class where relnamespace='public'::regnamespace and relkind='r') group by i.indrelid, i.indkey, i.indclass, i.indoption, i.indpred having count(*) > 1 order by 1"

q "Integridade: tabelas de public sem PK" "select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not exists (select 1 from pg_constraint k where k.conrelid=c.oid and k.contype='p') order by 1"

q "Integridade: sequences acima de 50% do limite" "select schemaname||'.'||sequencename as seq, last_value, max_value, round(100.0*last_value/max_value,1) as pct from pg_sequences where max_value>0 and last_value is not null and last_value::numeric/max_value > 0.5 order by 4 desc limit 10"

q "Funcoes que chamam as candidatas (nome, secdef, anon_exec)" "select n.nspname||'.'||p.proname||' definer='||p.prosecdef||' anon='||has_function_privilege('anon', p.oid, 'EXECUTE') as f from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.prokind='f' and p.prosrc ~* 'iniciar_tarefa_picking|concluir_tarefa_picking|move_stock|aplicar_ajuste_estoque|log_audit_event|registrar_checkin_diario|collect_challenge_reward|adicionar_xp|descontar_pontos|get_current_user_permissions|get_dashboard_metrics|refresh_dashboard_materialized_views|incrementar_metrica_dashboard|attach_user_to_default_tenant|get_user_role|has_role_v2|get_min_stock_threshold|get_reorder_point' and n.nspname not in ('pg_catalog','information_schema') order by 1"

q "Privilegio de authenticated nas candidatas (deve ser true)" "select count(*) filter (where has_function_privilege('authenticated', p.oid, 'EXECUTE')) as ok_auth, count(*) filter (where has_function_privilege('anon', p.oid, 'EXECUTE')) as ok_anon, count(*) as total from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname ~* '^(iniciar_tarefa_picking|concluir_tarefa_picking|move_stock|aplicar_ajuste_estoque|log_audit_event|registrar_checkin_diario|collect_challenge_reward|adicionar_xp|descontar_pontos|get_current_user_permissions|get_dashboard_metrics|refresh_dashboard_materialized_views|incrementar_metrica_dashboard|attach_user_to_default_tenant|get_user_role|has_role_v2|get_min_stock_threshold|get_reorder_point)\$'"
q "RLS 1: tabelas de public com RLS DESABILITADO" "select count(*) as total, string_agg(relname, ', ' order by relname) as nomes from (select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and not c.relrowsecurity) t"

q "RLS 2: tabelas com RLS ligado e ZERO policies" "select count(*) as total, string_agg(relname, ', ' order by relname) as nomes from (select c.relname from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='r' and c.relrowsecurity and not exists (select 1 from pg_policies pol where pol.schemaname='public' and pol.tablename=c.relname)) t"

q "RLS 3: policies que liberam anon com USING true" "select count(*) as total, string_agg(tablename||' :: '||policyname||' ['||cmd||']', ' ;; ' order by tablename, policyname) as lista from (select tablename, policyname, cmd from pg_policies where schemaname='public' and 'anon'=any(roles) and (qual is null or btrim(lower(qual)) in ('true','(true)'))) t"

q "RLS 4: grants de ESCRITA para anon" "select count(*) as total, string_agg(relname||' -> '||privs, ' ;; ' order by relname) as lista from (select c.relname, string_agg(v.g, ',' order by v.g) as privs from pg_class c join pg_namespace n on n.oid=c.relnamespace cross join lateral (values ('INSERT'),('UPDATE'),('DELETE')) v(g) where n.nspname='public' and c.relkind='r' and has_table_privilege('anon', c.oid, v.g) group by 1) t"

q "RLS 5: views e matviews de public (security_invoker)" "select count(*) as total, string_agg(relname||'['||relkind::text||']'||case when inv=1 then ':invoker' else ':DONO' end, ' ;; ' order by relname) as lista from (select c.relname, c.relkind, case when coalesce(array_to_string(c.reloptions,','),'') like '%security_invoker=%true%' then 1 else 0 end as inv from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind in ('v','m')) t(relname,relkind,inv)"

q "RLS 6: policies FOR ALL com roles public" "select count(*) as total, string_agg(tablename||' :: '||policyname, ' ;; ' order by tablename) as lista from (select tablename, policyname from pg_policies where schemaname='public' and 'public'=any(roles) and cmd='ALL') t"

q "MV 1: definicao das matviews (coluna tenant? tamanho?)" "select c.relname, length(pg_get_viewdef(c.oid,true)) as bytes, (pg_get_viewdef(c.oid,true) ~* 'tenant') as cita_tenant, (select count(*) from pg_attribute a where a.attrelid=c.oid and a.attname='tenant_id' and a.attnum>0 and not a.attisdropped) as col_tenant from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='m' order by 1"

q "MV 2: SELECT por role nas matviews" "select c.relname, has_table_privilege('anon',c.oid,'SELECT') as anon, has_table_privilege('authenticated',c.oid,'SELECT') as auth, has_table_privilege('service_role',c.oid,'SELECT') as svc from pg_class c join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and c.relkind='m' order by 1"

q "Funcoes SECURITY DEFINER sem search_path fixo" "select count(*) as total, string_agg(proname, ', ' order by proname) as nomes from (select p.proname from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.prosecdef and (p.proconfig is null or not exists (select 1 from unnest(p.proconfig) c where c like 'search_path=%'))) t"

q "Triggers desabilitados ou em estado parcial" "select count(*) as total, string_agg(relname||'.'||tgname||' ['||tgenabled::text||']', ', ' order by relname) as lista from (select c.relname, t.tgname, t.tgenabled from pg_trigger t join pg_class c on c.oid=t.tgrelid join pg_namespace n on n.oid=c.relnamespace where n.nspname='public' and not t.tgisinternal and t.tgenabled <> 'O') t"
