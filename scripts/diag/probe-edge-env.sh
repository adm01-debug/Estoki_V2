#!/usr/bin/env bash
# docs:
#   prova: quais variaveis de ambiente as edge functions enxergam em producao (somente NOMES, nunca valores)
#   porque: o login por passkey (webauthn) cai para o header Origin quando WEBAUTHN_ORIGINS nao existe,
#           e o header e controlado pelo cliente - a checagem vira no-op. Este probe prova se o env existe.
#   falha: sem SUPABASE_ACCESS_TOKEN nada e lido; ref do projeto errada resulta em HTTP != 200
#   nao-e-bug: a Management API devolve o valor dos secrets mascarado; usamos apenas as chaves
set -uo pipefail

REF="${SB_REF:-${VITE_SUPABASE_PROJECT_ID:-ookjbflsnoefnsixrspc}}"
TOKEN="${SUPABASE_ACCESS_TOKEN:-}"

if [ -z "$TOKEN" ]; then
  echo "::warning::sem SUPABASE_ACCESS_TOKEN: os nomes dos secrets das edges nao foram lidos."
  exit 0
fi

api="https://api.supabase.com/v1/projects/$REF/secrets/edge-functions"
tmp="$(mktemp)"
code="$(curl -sS -o "$tmp" -w '%{http_code}' -H "Authorization: Bearer $TOKEN" "$api" || echo 000)"

echo "===== Edge env em $REF (somente nomes) ====="
echo "-- http $code"

if [ "$code" != "200" ]; then
  echo "::error::Management API respondeu HTTP $code ao listar os secrets das edges de $REF"
  head -c 400 "$tmp"; echo
  rm -f "$tmp"
  exit 1
fi

python3 - "$tmp" <<'PY'
import json, sys
raw = json.load(open(sys.argv[1]))
itens = raw if isinstance(raw, list) else raw.get("data", [])
nomes = sorted({(i.get("name") or i.get("key") or "") for i in itens if isinstance(i, dict)})
nomes = [n for n in nomes if n]
print("total:", len(nomes))
for n in nomes:
    print("  ", n)
alvo = {"WEBAUTHN_RP_ID", "WEBAUTHN_ORIGINS"}
faltando = sorted(alvo - set(nomes))
if faltando:
    print("AUSENTES:", ", ".join(faltando))
    sys.exit(2)
print("OK: WEBAUTHN_RP_ID e WEBAUTHN_ORIGINS existem")
PY
rc=$?
rm -f "$tmp"
if [ "$rc" = "2" ]; then
  echo "::error::WEBAUTHN_RP_ID/WEBAUTHN_ORIGINS ausentes em $REF: resolveRp cai para o header Origin do cliente"
fi
exit 0
