#!/usr/bin/env bash
# Diagn?stico do fluxo autenticado real: login por API, RPCs de picking e
# leitura de system_settings com um JWT de usu?rio. Imprime apenas status HTTP
# e corpos de resposta; nunca imprime a senha nem o access_token.
set +e

SB_URL="${SB_URL:?}"
SB_ANON="${SB_ANON:?}"
EU="${EU:?}"
EP="${EP:?}"

echo "== credenciais: email ${#EU} chars, senha ${#EP} chars =="

RAW=$(curl -s -X POST "$SB_URL/auth/v1/token?grant_type=password" \
  -H "apikey: $SB_ANON" -H "Content-Type: application/json" \
  --data-binary "$(jq -nc --arg e "$EU" --arg p "$EP" '{email:$e,password:$p}')")

AT=$(printf '%s' "$RAW" | jq -r '.access_token // empty' 2>/dev/null)
echo "== login: token_len=${#AT} =="
if [ -z "$AT" ]; then
  echo "LOGIN_FALHOU: $(printf '%s' "$RAW" | head -c 300)"
  exit 0
fi

AUTH=(-H "apikey: $SB_ANON" -H "Authorization: Bearer $AT")

probe() {
  local fn="$1" payload="$2" code
  echo "===== $fn ====="
  code=$(curl -s -o /tmp/b.txt -w '%{http_code}' -X POST "$SB_URL/rest/v1/rpc/$fn" \
    "${AUTH[@]}" -H "Content-Type: application/json" -d "$payload")
  echo "HTTP=$code"
  echo "BODY=$(head -c 400 /tmp/b.txt)"
}

probe iniciar_tarefa_picking '{"p_tarefa_id":"00000000-0000-0000-0000-000000000001"}'
probe concluir_tarefa_picking '{"p_tarefa_id":"00000000-0000-0000-0000-000000000001","p_quantidade":1,"p_codigo_lido":null}'

echo "===== system_settings com JWT ====="
code=$(curl -s -o /tmp/s.txt -w '%{http_code}' "$SB_URL/rest/v1/system_settings?select=key&limit=2" "${AUTH[@]}")
echo "HTTP=$code"
echo "BODY=$(head -c 300 /tmp/s.txt)"

echo "===== user_roles do usuario ====="
code=$(curl -s -o /tmp/r.txt -w '%{http_code}' "$SB_URL/rest/v1/user_roles?select=role&limit=5" "${AUTH[@]}")
echo "HTTP=$code"
echo "BODY=$(head -c 300 /tmp/r.txt)"
