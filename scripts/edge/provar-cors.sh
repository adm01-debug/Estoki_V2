#!/usr/bin/env bash
# docs:
#   prova: o navegador so aceita a resposta se access-control-allow-origin casar com o Origin enviado.
#          Aqui cada origem permitida tem de ser refletida, e uma origem de terceiro NAO pode ser refletida.
#   falha: qualquer origem permitida que nao volte igual, ou origem de terceiro refletida
#   nao-e-bug: as edges que respondem "*" (backend-health, metrics, simulation-test) nao usam este modulo
set -uo pipefail

BASE="${ALVO_URL:-https://ookjbflsnoefnsixrspc.supabase.co}/functions/v1"
EDGE="${EDGE_PROVA:-webauthn-auth-options}"
ORIGENS="${ORIGENS_PROVA:-}"

if [ -z "$ORIGENS" ]; then
  echo "::error::ORIGENS_PROVA vazio: nada a provar"
  exit 1
fi

falhas=0

provar() {
  local origem="$1" esperado="$2" rotulo="$3"
  local devolvido
  devolvido="$(curl -sS -i -X OPTIONS "$BASE/$EDGE" \
      -H "Origin: $origem" \
      -H "Access-Control-Request-Method: POST" \
      -H "Access-Control-Request-Headers: authorization,apikey,content-type" \
      2>/dev/null | tr -d '\r' | grep -i '^access-control-allow-origin:' | cut -d' ' -f2-)"
  echo "-- $rotulo: enviei $origem / devolveu ${devolvido:-(nada)}"
  if [ "$esperado" = "igual" ] && [ "$devolvido" != "$origem" ]; then
    echo "::error::origem permitida nao foi refletida ($origem -> ${devolvido:-(nada)})"
    falhas=$((falhas + 1))
  fi
  if [ "$esperado" = "diferente" ] && [ "$devolvido" = "$origem" ]; then
    echo "::error::origem de terceiro foi refletida ($origem) - CORS aberto para qualquer site"
    falhas=$((falhas + 1))
  fi
}

echo "===== CORS ao vivo em $BASE/$EDGE ====="
IFS=',' read -r -a lista <<< "$ORIGENS"
for origem in "${lista[@]}"; do
  origem="$(echo "$origem" | xargs)"
  [ -n "$origem" ] && provar "$origem" igual "permitida"
done

provar "https://atacante.invalid" diferente "terceiro"

if [ "$falhas" != "0" ]; then
  echo "::error::$falhas verificacao(oes) de CORS falharam"
  exit 1
fi
echo "OK: todas as origens permitidas sao refletidas e a origem de terceiro nao e"
