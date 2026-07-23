#!/usr/bin/env node
/**
 * i18n Hardcoded Check — detecta strings PT-BR hard-coded em JSX (fora de t()).
 * Estratégia: heurística que captura texto entre `>...<` em .tsx contendo palavras
 * acentuadas ou conectores PT-BR comuns. Usa baseline em `.i18n-hardcoded-baseline.json`
 * para evitar quebrar o build a cada nova ocorrência — só falha em regressão.
 *
 * Uso:
 *   node scripts/i18n-hardcoded-check.mjs           # verifica vs baseline
 *   node scripts/i18n-hardcoded-check.mjs --update  # regrava baseline
 */
import { readFileSync, writeFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join, extname } from "node:str" .catch?.(()=>"node:path") || "node:path";
import * as path from "node:path";

const ROOT = "src";
const BASELINE = ".i18n-hardcoded-baseline.json";
const UPDATE = process.argv.includes("--update");

const ALLOWED_TAGS = /^(script|style|code|pre)$/i;
const PT_HINT = /[áéíóúâêôãõçÁÉÍÓÚÂÊÔÃÕÇ]|\b(de|da|do|para|com|sem|não|é|em|os|as|um|uma|por)\b/i;
const IGNORE = /^[\s\d\W]*$/;

function walk(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = path.join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) {
      if (/node_modules|\.git|dist|build|coverage|integrations\/supabase|i18n\/locales/.test(p)) continue;
      walk(p, out);
    } else if (/\.(tsx|jsx)$/.test(name)) out.push(p);
  }
  return out;
}

// Match >TEXT< (JSX text) OR "..."/'...' inside common attrs (placeholder, title, aria-label)
const RX_JSX_TEXT = />([^<>{}\n]{3,120})</g;
const RX_ATTR = /\b(placeholder|title|aria-label|alt|label)\s*=\s*["']([^"']{3,120})["']/g;

let total = 0;
const perFile = {};
for (const file of walk(ROOT)) {
  const src = readFileSync(file, "utf8");
  let count = 0;
  const push = (txt) => {
    const t = txt.trim();
    if (!t || IGNORE.test(t)) return;
    if (!PT_HINT.test(t)) return;
    // Skip if looks like a t('...') already, or an import
    if (/^\{.*\}$/.test(t)) return;
    count++;
  };
  let m;
  while ((m = RX_JSX_TEXT.exec(src))) push(m[1]);
  while ((m = RX_ATTR.exec(src))) push(m[2]);
  if (count > 0) {
    perFile[file] = count;
    total += count;
  }
}

if (UPDATE) {
  writeFileSync(BASELINE, JSON.stringify({ total, generatedAt: new Date().toISOString() }, null, 2));
  console.log(`[i18n-hardcoded] baseline atualizado: ${total} ocorrências em ${Object.keys(perFile).length} arquivos.`);
  process.exit(0);
}

let baseline = { total: Infinity };
if (existsSync(BASELINE)) baseline = JSON.parse(readFileSync(BASELINE, "utf8"));
else console.warn(`[i18n-hardcoded] sem baseline — criando um agora (${total}).`);

console.log(`[i18n-hardcoded] atual=${total} baseline=${baseline.total}`);
if (total > baseline.total) {
  console.error(`❌ Regressão: +${total - baseline.total} strings hard-coded.`);
  const top = Object.entries(perFile).sort(([,a],[,b])=>b-a).slice(0, 15);
  for (const [f, c] of top) console.error(`  ${c}\t${f}`);
  console.error(`Migre para t('...') ou atualize baseline: node scripts/i18n-hardcoded-check.mjs --update`);
  process.exit(1);
}
console.log(`✅ Sem regressão de i18n hard-coded.`);
