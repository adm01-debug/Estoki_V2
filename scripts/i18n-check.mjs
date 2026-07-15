#!/usr/bin/env node
/**
 * i18n Check — verifica paridade de chaves entre os arquivos de tradução
 * em src/i18n/locales/*.json. Exit 1 se houver chave faltando em algum
 * idioma além do base pt-BR.
 */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join } from "node:path";

const DIR = "src/i18n/locales";
const BASE = "pt-BR.json";

if (!existsSync(join(DIR, BASE))) {
  console.log(`[i18n-check] Base ${BASE} não encontrada — pulando.`);
  process.exit(0);
}

function flatten(obj, prefix = "") {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v && typeof v === "object" && !Array.isArray(v)) Object.assign(out, flatten(v, key));
    else out[key] = true;
  }
  return out;
}

const base = flatten(JSON.parse(readFileSync(join(DIR, BASE), "utf8")));
const baseKeys = Object.keys(base);
const files = readdirSync(DIR).filter((f) => f.endsWith(".json") && f !== BASE);

let failed = false;
for (const f of files) {
  const other = flatten(JSON.parse(readFileSync(join(DIR, f), "utf8")));
  const missing = baseKeys.filter((k) => !(k in other));
  const extra = Object.keys(other).filter((k) => !(k in base));
  if (missing.length || extra.length) {
    failed = true;
    console.error(`\n❌ ${f}: missing=${missing.length} extra=${extra.length}`);
    if (missing.length) console.error("  Missing:", missing.slice(0, 5).join(", "), missing.length > 5 ? "..." : "");
    if (extra.length) console.error("  Extra:", extra.slice(0, 5).join(", "), extra.length > 5 ? "..." : "");
  } else {
    console.log(`✅ ${f}: paridade OK (${baseKeys.length} chaves)`);
  }
}

process.exit(failed ? 1 : 0);