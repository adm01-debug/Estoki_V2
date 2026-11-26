#!/usr/bin/env bash
# Dry-run de migration: aplica o arquivo, confere privilegios e faz ROLLBACK (nada e persistido).
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

# `end;` tambem termina o `case` de PL/pgSQL, que fica dentro de um bloco
# `do $tag$ ... $tag$` e e UMA statement: nao anula o ROLLBACK. So conta o que esta FORA
# de bloco dollar-quoted.
fora_dollar() {
  awk '
  {
    line = $0
    while (match(line, /\$[A-Za-z_][A-Za-z_0-9]*\$|\$\$/)) {
      tok = substr(line, RSTART, RLENGTH)
      if (d == "") d = tok; else if (d == tok) d = ""
      line = substr(line, RSTART + RLENGTH)
    }
    if (d == "") print $0
  }' "$1"
}
if fora_dollar "$MIG" | grep -qiE '^[[:space:]]*(commit|end|rollback|start[[:space:]]+transaction)[[:space:]]*;|^[[:space:]]*\\(c|i|copy|connect)[[:space:]]'; then
  echo "recusa: $MIG tem COMMIT/ROLLBACK/END ou meta-comando psql, o que anularia o ROLLBACK"; exit 2
fi
echo "== projeto: $REF | migration: $MIG =="

NAMES="iniciar_tarefa_picking,concluir_tarefa_picking,move_stock,aplicar_ajuste_estoque,log_audit_event,registrar_checkin_diario,collect_challenge_reward,adicionar_xp,descontar_pontos,get_current_user_permissions,get_dashboard_metrics,refresh_dashboard_materialized_views,incrementar_metrica_dashboard,attach_user_to_default_tenant,get_user_role,has_role_v2,get_min_stock_threshold,get_reorder_point,handle_new_user,log_posicao_status_change,audit_sensitive_row_change,check_db_alert_thresholds,set_system_settings_updated_at,increment_version"
REGEX=$(printf '%s' "$NAMES" | tr ',' '|')

FAIL=0
run() {
  local label="$1" sql="$2" body code falha=0
  echo "===== $label ====="
  body=$(jq -nc --arg q "$sql" '{query:$q}' | curl -sS -w '\n%{http_code}' -X POST "https://api.supabase.com/v1/projects/$REF/database/query" \
    -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary @-)
  code=$(printf '%s' "$body" | tail -n1)
  body=$(printf '%s' "$body" | sed '$d')
  printf '%s\n' "$body" | head -c 3000
  echo
  echo "-- http $code"
  # A Management API responde 201 em sucesso (nao 200) e devolve {"message":"...","code":"..."}
  # quando o SQL falha; erro de rede volta corpo vazio. Antes este script imprimia a resposta e
  # seguia com sucesso mesmo quando ela vinha vazia ou com erro, entao um dry-run quebrado
  # passava por verde.
  case "$code" in 200|201) ;; *) falha=1 ;; esac
  if [ "$falha" = "1" ] || [ -z "$body" ] || printf '%s' "$body" | grep -q '"message"'; then
    echo "FALHA: o dry-run de '$label' nao concluiu (http $code)"
    FAIL=1
  fi
}

run "Pre-check: policies que citam as 24" "select schemaname||'.'||tablename||' :: '||policyname from pg_policies where coalesce(qual,'')||' '||coalesce(with_check,'') ~* '$REGEX'"
run "Pre-check: views que citam as 24" "select schemaname||'.'||viewname from pg_views where definition ~* '$REGEX'"

VERIFY="select json_agg(json_build_object('fn', p.proname, 'anon', has_function_privilege('anon', p.oid, 'EXECUTE'), 'auth', has_function_privilege('authenticated', p.oid, 'EXECUTE')) order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.prokind='f' and p.proname = any(string_to_array('$NAMES', ','))"
KEEPERS="select json_agg(json_build_object('fn', p.proname, 'anon', has_function_privilege('anon', p.oid, 'EXECUTE')) order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.prokind='f' and p.proname in ('has_role','is_tenant_admin','is_tenant_member','effective_tenant_id','default_tenant_id','current_tenant_id','get_backend_health')"
# As 3 RPCs de lockout de login sao alvo de revogacao desde 20261126140000
# (20261124120000_SEC_login_rpc_service_role.sql): ficam fora de KEEPERS para nao parecer
# que precisam continuar executaveis por anon. Esta consulta mede antes/depois na mesma transacao.
LOGINPROOF="select json_agg(json_build_object('fn', p.proname, 'anon', has_function_privilege('anon', p.oid, 'EXECUTE'), 'auth', has_function_privilege('authenticated', p.oid, 'EXECUTE'), 'svc', has_function_privilege('service_role', p.oid, 'EXECUTE')) order by p.proname) from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname='public' and p.prokind='f' and p.proname in ('check_login_lockout','record_failed_login','reset_login_attempts')"

run "Dry-run: aplica $MIG + privilegios das 24 (ROLLBACK)" "begin; $(cat "$MIG") $KEEPERS; $VERIFY; rollback;"
# A API devolve so o resultado do ultimo statement: a prova das 3 RPCs de lockout vai num dry-run
# proprio, com a mesma migration, para o numero sair visivel no log.
run "Dry-run: RPCs de lockout (anon/auth=false, svc=true)" "begin; $(cat "$MIG") $LOGINPROOF; rollback;"

exit "$FAIL"