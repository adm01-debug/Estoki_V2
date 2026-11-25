#!/usr/bin/env bash
# Mostra apenas a REFERENCIA de projeto de cada secret (nunca a chave em claro).
set +e

ref_of() { local u="$1"; u="${u#https://}"; echo "${u%%.supabase.co*}"; }

claim_of() {
  local jwt="$1"
  if [ -z "$jwt" ]; then echo "(vazio)"; return; fi
  case "$jwt" in
    sb_publishable_*|sb_secret_*) echo "(chave nova, sem ref embutida)"; return ;;
  esac
  local payload pad
  payload=$(printf '%s' "$jwt" | cut -d. -f2)
  pad=$(( (4 - ${#payload} % 4) % 4 ))
  if [ "$pad" -gt 0 ]; then payload="$payload$(printf '=%.0s' $(seq 1 "$pad"))"; fi
  printf '%s' "$payload" | tr '_-' '/+' | base64 -d 2>/dev/null | jq -r '.ref // "(sem ref)"' 2>/dev/null
}

echo "SUPABASE_URL               ref = $(ref_of "${S_URL:-}")"
echo "SUPABASE_ANON_KEY          ref = $(claim_of "${S_KEY:-}")"
echo "VITE_SUPABASE_URL          ref = $(ref_of "${V_URL:-}")"
echo "VITE_SUPABASE_ANON_KEY     ref = $(claim_of "${V_KEY:-}")"
echo "VITE_SUPABASE_PROJECT_ID       = ${V_PID:-(vazio)}"