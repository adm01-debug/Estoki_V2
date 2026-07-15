#!/usr/bin/env node
/**
 * Audit Zod — varre supabase/functions/*//*index.ts e lista quais Edge
 * Functions recebem body (via `req.json()` ou POST/PUT/PATCH) mas NÃO
 * usam Zod para validar. Alimenta o item P0 #2 do plano.
 *
 * Saída: relatório em .qa-report/zod-coverage.md
 * Exit 0 sempre (informativo — não bloqueia CI até P0 #2 concluir).
 */
import { readdirSync, readFileSync, existsSync, mkdirSync, writeFileSync, statSync } from "node:fs";
import { join } from "node:path";

const FUNCTIONS_DIR = "supabase/functions";
const REPORT_DIR = ".qa-report";

if (!existsSync(FUNCTIONS_DIR)) {
  console.log("[audit-zod] Diretório não encontrado — pulando.");
  process.exit(0);
}

const dirs = readdirSync(FUNCTIONS_DIR).filter((d) => {
  const p = join(FUNCTIONS_DIR, d);
  return statSync(p).isDirectory() && !d.startsWith("_") && d !== "tests";
});

let total = 0;
let withBody = 0;
let withZod = 0;
const missing = [];

for (const name of dirs) {
  const file = join(FUNCTIONS_DIR, name, "index.ts");
  if (!existsSync(file)) continue;
  const src = readFileSync(file, "utf8");
  total++;
  const hasBody = /req\.json\(\)|await\s+req\.text\(\)/.test(src);
  if (!hasBody) continue;
  withBody++;
  // Direct zod import OR use of shared validator that internally uses zod.
  const hasZod =
    /from\s+["']https?:\/\/[^"']*zod[^"']*["']/i.test(src) ||
    /from\s+["'][^"']*_shared\/(schemas|validation)[^"']*["']/i.test(src) ||
    /validateInput\s*\(/.test(src);
  if (hasZod) withZod++;
  else missing.push(name);
}

mkdirSync(REPORT_DIR, { recursive: true });
const lines = [
  "# Zod Coverage — Edge Functions",
  "",
  `- Total de functions: **${total}**`,
  `- Com body (req.json/text): **${withBody}**`,
  `- Com Zod: **${withZod}**`,
  `- **Faltando Zod: ${missing.length}**`,
  "",
];
if (missing.length) {
  lines.push("## Functions sem validação Zod (top 30)", "");
  lines.push(...missing.slice(0, 30).map((n) => `- \`${n}\``), "");
  if (missing.length > 30) lines.push(`_...e mais ${missing.length - 30}._`, "");
}
writeFileSync(join(REPORT_DIR, "zod-coverage.md"), lines.join("\n"));
console.log(lines.join("\n"));