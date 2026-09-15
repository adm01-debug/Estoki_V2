#!/usr/bin/env node
/**
 * RLS Audit — varre supabase/migrations/*.sql e falha se alguma tabela
 * pública (public.*) não tiver `ENABLE ROW LEVEL SECURITY` E pelo menos
 * uma `CREATE POLICY` correspondente no conjunto de migrations.
 *
 * Uso: node scripts/rls-audit.mjs
 * Saída: exit 0 se limpo, exit 1 se houver violação. Sempre imprime um
 *        relatório em Markdown para o CI colar como comentário do PR.
 */
import { readdirSync, readFileSync, existsSync, writeFileSync, mkdirSync } from "node:fs";
import { join } from "node:path";

const MIGRATIONS_DIR = "supabase/migrations";
const REPORT_DIR = ".qa-report";
const REPORT_FILE = join(REPORT_DIR, "rls-audit.md");

if (!existsSync(MIGRATIONS_DIR)) {
  console.log(`[rls-audit] Diretório ${MIGRATIONS_DIR} não encontrado — pulando.`);
  process.exit(0);
}

const files = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith(".sql"))
  .sort();

const created = new Set();
const rlsEnabled = new Set();
const withPolicy = new Set();
// Tabelas dropadas devem ser ignoradas nos gates.
const dropped = new Set();

const RE_CREATE = /create\s+table\s+(?:if\s+not\s+exists\s+)?public\.([a-z0-9_]+)/gi;
const RE_ENABLE =
  /alter\s+table\s+(?:only\s+)?public\.([a-z0-9_]+)\s+enable\s+row\s+level\s+security/gi;
const RE_POLICY = /create\s+policy\s+[^;]*?\s+on\s+(?:only\s+)?public\.([a-z0-9_]+)/gi;
const RE_DROP = /drop\s+table\s+(?:if\s+exists\s+)?public\.([a-z0-9_]+)/gi;

for (const file of files) {
  const sql = readFileSync(join(MIGRATIONS_DIR, file), "utf8");
  for (const m of sql.matchAll(RE_CREATE)) created.add(m[1].toLowerCase());
  for (const m of sql.matchAll(RE_ENABLE)) rlsEnabled.add(m[1].toLowerCase());
  for (const m of sql.matchAll(RE_POLICY)) withPolicy.add(m[1].toLowerCase());
  for (const m of sql.matchAll(RE_DROP)) dropped.add(m[1].toLowerCase());
}

const active = [...created].filter((t) => !dropped.has(t));
const missingRls = active.filter((t) => !rlsEnabled.has(t));
const missingPolicy = active.filter((t) => !withPolicy.has(t));

mkdirSync(REPORT_DIR, { recursive: true });
const lines = [
  "# RLS Audit",
  "",
  `- Tabelas ativas em \`public\`: **${active.length}**`,
  `- Sem RLS habilitado: **${missingRls.length}**`,
  `- Sem policy: **${missingPolicy.length}**`,
  "",
];
if (missingRls.length) {
  lines.push("## ❌ Tabelas sem `ENABLE ROW LEVEL SECURITY`");
  lines.push(...missingRls.map((t) => `- \`public.${t}\``), "");
}
if (missingPolicy.length) {
  lines.push("## ⚠️ Tabelas sem `CREATE POLICY`");
  lines.push(...missingPolicy.map((t) => `- \`public.${t}\``), "");
}
if (!missingRls.length && !missingPolicy.length) {
  lines.push("✅ Todas as tabelas públicas têm RLS habilitado e ao menos uma policy.");
}
writeFileSync(REPORT_FILE, lines.join("\n"));

console.log(lines.join("\n"));

if (missingRls.length) {
  console.error(`\n[rls-audit] FALHA: ${missingRls.length} tabela(s) sem RLS.`);
  process.exit(1);
}
process.exit(0);
