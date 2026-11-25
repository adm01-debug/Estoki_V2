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

q "Funcoes que chamam as candidatas (nome, secdef, anon_exec)" "select n.nspname||'.'||p.proname||' definer='||p.prosecdef||' anon='||has_function_privilege('anon', p.oid, 'EXECUTE') as f from pg_proc p join pg_namespace n on n.oid=p.pronamespace where p.prokind='f' and p.prosrc ~* 'iniciar_tarefa_picking|concluir_tarefa_picking|move_stock|aplicar_ajuste_estoque|log_audit_event|registrar_checkin_diario|collect_challenge_reward|adicionar_xp|descontar_pontos|get_current_user_permissions|get_dashboard_metrics|refresh_dashboard_materialized_views|incrementar_metrica_dashboard|attach_user_to_default_tenant|get_user_role|has_role_v2|get_min_stock_threshold|get_reorder_point' and n.nspname not in ('pg_catalog','information_schema') order by 1"

q "Privilegio de authenticated nas candidatas (deve ser true)" "select count(*) filter (where has_function_privilege('authenticated', p.oid, 'EXECUTE')) as ok_auth, count(*) filter (where has_function_privilege('anon', p.oid, 'EXECUTE')) as ok_anon, count(*) as total from pg_proc p join pg_namespace n on n.oid=p.pronamespace where n.nspname='public' and p.proname ~* '^(iniciar_tarefa_picking|concluir_tarefa_picking|move_stock|aplicar_ajuste_estoque|log_audit_event|registrar_checkin_diario|collect_challenge_reward|adicionar_xp|descontar_pontos|get_current_user_permissions|get_dashboard_metrics|refresh_dashboard_materialized_views|incrementar_metrica_dashboard|attach_user_to_default_tenant|get_user_role|has_role_v2|get_min_stock_threshold|get_reorder_point)\$'"