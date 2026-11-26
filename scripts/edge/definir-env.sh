#!/usr/bin/env bash
# docs:
#   gatilho: workflow_dispatch (edges-env.yml) - nunca push, nunca cron
#   prova: depois de definir, POST na edge webauthn-auth-options com Origin do site devolve o mesmo
#          Origin em access-control-allow-origin; com Origin de terceiro continua recusando.
#   falha: sem token, origem invalida (esquema/porta/caminho), resposta != 200 da Management API
#   rollback: rode de novo passando as origens antigas; o valor anterior nao e apagado pelo PATCH
#   nao-e-bug:
#     - secrets existentes de outros nomes nao sao tocados (o endpoint so altera as chaves enviadas)
#     - WEBAUTHN_RP_ID e opcional: sem ele o rpId vira o hostname da origem permitida
set -uo pipefail

REF="${SB_REF:-ookjbflsnoefnsixrspc}"
TOKEN="${SUPABASE_ACCESS_TOKEN:-}"
ORIGENS="${ORIGENS_ALVO:-}"
RP_ID="${RP_ID_ALVO:-}"

if [ -z "$TOKEN" ]; then
  echo "::error::sem SUPABASE_MANAGEMENT_TOKEN/SUPABASE_ACCESS_TOKEN: nada foi definido."
  exit 1
fi

if [ -z "$ORIGENS" ]; then
  echo "::error::origens vazias: definir WEBAUTHN_ORIGINS/APP_ORIGINS com lista vazia derrubaria o login por passkey."
  exit 1
fi

body="$(mktemp)"
python3 - "$ORIGENS" "$RP_ID" > "$body" <<'PY'
import json, re, sys

origens_brutas = [o.strip() for o in sys.argv[1].split(",")]
rp_id = sys.argv[2].strip()

padrao = re.compile(r"^(https://[a-z0-9]([a-z0-9.-]*[a-z0-9])?(:[0-9]{1,5})?|http://localhost(:[0-9]{1,5})?)$")

origens = [o for o in origens_brutas if o]
if not origens:
    print("ERRO: nenhuma origem valida", file=sys.stderr)
    sys.exit(1)

for o in origens:
    if not padrao.match(o):
        print(f"ERRO: origem invalida (esquema https, sem caminho e sem barra final): {o}", file=sys.stderr)
        sys.exit(1)

if len(set(origens)) != len(origens):
    print("ERRO: origem repetida na lista", file=sys.stderr)
    sys.exit(1)

if rp_id and not re.match(r"^[a-z0-9]([a-z0-9.-]*[a-z0-9])?$", rp_id):
    print(f"ERRO: WEBAUTHN_RP_ID invalido (dominio registravel, sem esquema): {rp_id}", file=sys.stderr)
    sys.exit(1)

lista = ",".join(origens)
segredos = [
    {"name": "WEBAUTHN_ORIGINS", "value": lista},
    {"name": "APP_ORIGINS", "value": lista},
]
if rp_id:
    segredos.append({"name": "WEBAUTHN_RP_ID", "value": rp_id})

print(json.dumps(segredos))
PY
rc=$?
if [ "$rc" != "0" ]; then
  rm -f "$body"
  echo "::error::validacao das origens falhou (veja a mensagem ERRO acima)"
  exit 1
fi

api="https://api.supabase.com/v1/projects/$REF/secrets"

echo "===== Definindo env das edges em $REF ====="
echo "-- origens: $ORIGENS"
echo "-- rp_id: ${RP_ID:-(derivado do hostname da origem)}"

code="$(curl -sS -o /tmp/resp.json -w '%{http_code}' -X POST -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary @"$body" "$api" || echo 000)"
if [ "$code" = "409" ]; then
  echo "-- ja existiam, aplicando PATCH"
  code="$(curl -sS -o /tmp/resp.json -w '%{http_code}' -X PATCH -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" --data-binary @"$body" "$api" || echo 000)"
fi
echo "-- http $code"

rm -f "$body"
if [ "$code" != "200" ] && [ "$code" != "201" ]; then
  echo "::error::Management API respondeu HTTP $code ao definir os secrets de $REF"
  head -c 400 /tmp/resp.json; echo
  rm -f /tmp/resp.json
  exit 1
fi
rm -f /tmp/resp.json
echo "OK: WEBAUTHN_ORIGINS, APP_ORIGINS${RP_ID:+ e WEBAUTHN_RP_ID} definidos em $REF"
