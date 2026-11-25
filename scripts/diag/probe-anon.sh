#!/usr/bin/env bash
# Prova se as RPCs de picking s?o execut?veis apenas com a chave p?blica (anon),
# sem JWT de usu?rio. Controla com uma fun??o inexistente para comparar o erro.
set +e

SB_URL="${SB_URL:?}"
SB_ANON="${SB_ANON:?}"

probe() {
  local fn="$1" payload="$2" code
  echo "===== $fn ====="
  code=$(curl -s -o /tmp/b.txt -w '%{http_code}' -X POST "$SB_URL/rest/v1/rpc/$fn" \
    -H "apikey: $SB_ANON" -H "Authorization: Bearer $SB_ANON" \
    -H "Content-Type: application/json" -d "$payload")
  echo "HTTP=$code"
  echo "BODY=$(head -c 400 /tmp/b.txt)"
}

probe iniciar_tarefa_picking '{"p_tarefa_id":"00000000-0000-0000-0000-000000000001"}'
probe concluir_tarefa_picking '{"p_tarefa_id":"00000000-0000-0000-0000-000000000001","p_quantidade":1,"p_codigo_lido":null}'
probe funcao_que_nao_existe_xyz '{}'

echo "===== system_settings como anon ====="
code=$(curl -s -o /tmp/s.txt -w '%{http_code}' "$SB_URL/rest/v1/system_settings?select=key&limit=1" \
  -H "apikey: $SB_ANON" -H "Authorization: Bearer $SB_ANON")
echo "HTTP=$code"
echo "BODY=$(head -c 300 /tmp/s.txt)"
