#!/usr/bin/env bash
# Dry-run de migration: aplica, confere privilegios e faz ROLLBACK (nada e persistido).
set +e

TOKEN="${SUPABASE_ACCESS_TOKEN:?}"
SB_URL="${SB_URL:?}"
REF="${SB_URL#https://}"
REF="${REF%%.supabase.co*}"
MIG="$1"
[ -n "$MIG" ] || { echo "uso: dryrun-migration.sh supabase/migrations/<arquivo>.sql"; exit 2; }
case "$MIG" in
  supabase/migrations/*.sql|./supabase/migrations/*.sql) ;;
  *) echo "recusa: $MIG precisa estar em supabase/migrations/"; exit 2 ;;
esac
[ -f "$MIG" ] || { echo "recusa: arquivo $MIG nao existe"; exit 2; }
if grep -qiE '^[[:space:]]*(commit|end|rollback|start[[:space:]]+transaction)[[:space:]]*;|^[[:space:]]*\\(c|i|copy|connect)[[:space:]]' "$MIG"; then
  echo "recusa: $MIG tem COMMIT/ROLLBACK/END ou meta-comando psql, o que anularia o ROLLBACK"; exit 2
fi
echo "== projeto: $REF | migration: $MIG =="

NAMES="iniciar_tarefa_picking,concluir_tarefa_picking,move_stock,aplicar_ajuste_estoque,log_audit_event,registrar_checkin_diario,collect_challenge_reward,adicionar_xp,descontar_pontos,get_current_user_permissions,get_dashboard_metrics,refresh_dashboard_materialized_views,incrementar_metrica_dashboard,attach_user_to_default_tenant,get_user_role,has_role_v2,get_min_stock_threshold,get_reorder_point,handle_new_user,log_posicao_status_change,audit_sensitive_row_change,check_db_alert_thresholds,set_system_settings_updated_at,increment_version"
REGEX=$(printf '%s' "$NAMES" | tr ',' '|')

run() {
  local label="$1" sql="$2"
  echo "===== $label ====="
  jq -nc --arg q "$sql" '{query:$q}' | curl -s -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary @- | head -c 3000
  echo
}

run "Pre-check: policies que citam as 24" "select schemaname||'.'||tablename||' :: '||policyname from pg_policies where coalesce(qual,'')||' '||coalesce(with_check,'') ~* '$REGEX'"
run "Pre-check: views que citam as 24" "select schemaname||'.'||viewname from pg_views where definition ~* '$REGEX'"

VERIFY="select json_agg(json_build_object('fn', p.proname, 'anon', has_function_privilege('anon', p.oid, 'EXECUTE'), 'auth', has_function_privilege('authenticated', p.oid, 'EXECUTE')) order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.prokind='f' and p.proname = any(string_to_array('$NAMES', ','))"
KEEPERS="select json_agg(json_build_object('fn', p.proname, 'anon', has_function_privilege('anon', p.oid, 'EXECUTE')) order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.prokind='f' and p.proname in ('has_role','is_tenant_admin','is_tenant_member','effective_tenant_id','default_tenant_id','current_tenant_id','check_login_lockout','record_failed_login','reset_login_attempts','get_backend_health')"

run "Dry-run (aplica + confere + ROLLBACK)" "begin; $(cat "$MIG") $KEEPERS; $VERIFY; rollback;"
run "Pos-rollback: anon ainda executa (deve ser true)" "select json_agg(json_build_object('fn', p.proname, 'anon', has_function_privilege('anon', p.oid, 'EXECUTE')) order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.proname in ('iniciar_tarefa_picking','concluir_tarefa_picking','move_stock','aplicar_ajuste_estoque')"