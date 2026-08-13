#!/usr/bin/env node
/**
 * QA Report — agrega os resultados dos jobs (lint/typecheck/test/build/
 * size/rls/security) em um único Markdown para ser postado como comentário
 * do PR pelo workflow qa.yml.
 *
 * Entrada: variáveis de ambiente QA_<STEP>_STATUS (success | failure | skipped)
 *          + arquivos opcionais em .qa-report/*.md
 * Saída:   .qa-report/summary.md
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const REPORT_DIR = ".qa-report";
mkdirSync(REPORT_DIR, { recursive: true });

const steps = [
  ["Lint (ESLint)", process.env.QA_LINT_STATUS],
  ["Type-check (tsc)", process.env.QA_TYPECHECK_STATUS],
  ["Testes unitários (Vitest)", process.env.QA_TEST_STATUS],
  ["Build (Vite)", process.env.QA_BUILD_STATUS],
  ["Budget de bundle (size-limit)", process.env.QA_SIZE_STATUS],
  ["Auditoria RLS", process.env.QA_RLS_STATUS],
  ["Segurança (npm audit)", process.env.QA_SECURITY_STATUS],
];

const icon = (s) =>
  s === "success" ? "✅" : s === "failure" ? "❌" : s === "skipped" ? "⏭️" : "❔";

const lines = [
  "## 🧪 QA Report",
  "",
  "| Verificação | Status |",
  "| --- | :---: |",
  ...steps.map(([label, status]) => `| ${label} | ${icon(status)} ${status ?? "n/a"} |`),
  "",
];

// Anexa relatórios detalhados quando existirem.
for (const detail of ["rls-audit.md", "size-limit.md", "security.md"]) {
  const p = join(REPORT_DIR, detail);
  if (existsSync(p)) {
    lines.push("<details><summary>" + detail + "</summary>", "", readFileSync(p, "utf8"), "", "</details>", "");
  }
}

writeFileSync(join(REPORT_DIR, "summary.md"), lines.join("\n"));
console.log(lines.join("\n"));