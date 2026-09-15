#!/usr/bin/env node
/**
 * P2 #24 — Guarda anti-regressão contra TODOs residuais em migrations.
 *
 * Migrations são imutáveis (append-only). Este script bloqueia PRs que
 * introduzam marcadores acionáveis (TODO/FIXME/XXX/HACK/PENDING) em
 * arquivos novos sob `supabase/migrations/`.
 *
 * Comentários históricos existentes ("Resolves TODO in ...") são
 * tolerados via allowlist explícita — eles referem-se a itens já
 * resolvidos em código e servem apenas de rastro de auditoria.
 */
import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const DIR = "supabase/migrations";
const PATTERN = /\b(TODO|FIXME|XXX|HACK|PENDING)\b/;

const ALLOWLIST = new Set([
  "20251230000001_create_audit_log_table.sql",
  "20251230000002_create_feature_flags_table.sql",
]);

let violations = 0;
let scanned = 0;

for (const file of readdirSync(DIR)) {
  if (!file.endsWith(".sql")) continue;
  scanned++;
  if (ALLOWLIST.has(file)) continue;
  const src = readFileSync(join(DIR, file), "utf8");
  src.split("\n").forEach((line, idx) => {
    if (PATTERN.test(line)) {
      console.error(`❌ ${file}:${idx + 1}  ${line.trim()}`);
      violations++;
    }
  });
}

if (violations > 0) {
  console.error(
    `\n${violations} marcador(es) acionável(is) em migrations. Resolva ou justifique via allowlist.`
  );
  process.exit(1);
}

console.log(`✅ ${scanned} migrations auditadas — nenhum TODO residual acionável.`);
