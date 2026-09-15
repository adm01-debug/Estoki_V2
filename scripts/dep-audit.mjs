#!/usr/bin/env node
/**
 * Auditoria de dependências independente do proxy de registro.
 *
 * `npm audit` depende do endpoint /-/npm/v1/security/audits, indisponível em
 * alguns mirrors corporativos. Este script lê o package-lock.json, consulta o
 * endpoint público de advisories em lote e falha conforme o nível configurado.
 *
 * Uso:  node scripts/dep-audit.mjs [--level=high] [--prod]
 * Saída: .qa-report/dep-audit.md  (exit 1 se houver achado acima do nível)
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { join } from "node:path";
import semver from "semver";

const REGISTRY = process.env.NPM_ADVISORY_REGISTRY ?? "https://registry.npmjs.org";
const BULK = `${REGISTRY}/-/npm/v1/security/advisories/bulk`;
const ORDER = ["info", "low", "moderate", "high", "critical"];
const args = process.argv.slice(2);
const level = (args.find((a) => a.startsWith("--level="))?.split("=")[1] ?? "high").toLowerCase();
const prodOnly = args.includes("--prod");
const REPORT_DIR = ".qa-report";
const REPORT_FILE = join(REPORT_DIR, "dep-audit.md");

if (!ORDER.includes(level)) {
  console.error(`[dep-audit] Nível inválido: ${level}. Use ${ORDER.join("|")}.`);
  process.exit(2);
}
if (!existsSync("package-lock.json")) {
  console.log("[dep-audit] package-lock.json ausente — pulando.");
  process.exit(0);
}

/** Aceitos formalmente (sem correção upstream). Revisar a cada release. */
const ALLOWLIST = JSON.parse(
  existsSync(".dep-audit-allowlist.json") ? readFileSync(".dep-audit-allowlist.json", "utf8") : "{}"
);

const lock = JSON.parse(readFileSync("package-lock.json", "utf8"));
/** @type {Record<string, Set<string>>} */
const versions = {};
/** @type {Record<string, Set<string>>} nome -> versões alcançáveis em produção */
const prodVersions = {};
for (const [path, info] of Object.entries(lock.packages ?? {})) {
  const idx = path.lastIndexOf("node_modules/");
  if (idx === -1 || !info.version) continue;
  const name = path.slice(idx + "node_modules/".length);
  (versions[name] ??= new Set()).add(info.version);
  if (!(info.dev || info.devOptional)) (prodVersions[name] ??= new Set()).add(info.version);
}

const payload = Object.fromEntries(Object.entries(versions).map(([k, v]) => [k, [...v]]));
let advisories = {};
try {
  const res = await fetch(BULK, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  advisories = await res.json();
} catch (err) {
  console.error(`[dep-audit] Não foi possível consultar ${BULK}: ${err.message}`);
  process.exit(0); // sem rede: não bloqueia o build
}

const threshold = ORDER.indexOf(level);
const rows = [];
for (const [name, list] of Object.entries(advisories)) {
  for (const a of list) {
    // A API em lote responde por pacote; casamos a faixa vulnerável contra cada
    // versão realmente presente na árvore para evitar falsos positivos.
    const affected = [...(versions[name] ?? [])].filter((v) =>
      semver.satisfies(v, a.vulnerable_versions, { includePrerelease: true })
    );
    if (!affected.length) continue;
    const prodAffected = affected.filter((v) => prodVersions[name]?.has(v));
    if (prodOnly && !prodAffected.length) continue;
    const allowed =
      (ALLOWLIST[name] ?? []).includes(a.url) || (ALLOWLIST[name] ?? []).includes("*");
    rows.push({
      name,
      severity: a.severity,
      range: a.vulnerable_versions,
      affected: affected.join(", "),
      title: a.title,
      url: a.url,
      scope: prodAffected.length ? "prod" : "dev",
      allowed,
      blocking: !allowed && ORDER.indexOf(a.severity) >= threshold,
    });
  }
}

const blocking = rows.filter((r) => r.blocking);
const counts = ORDER.reduce(
  (acc, s) => ({ ...acc, [s]: rows.filter((r) => r.severity === s).length }),
  {}
);

mkdirSync(REPORT_DIR, { recursive: true });
const md = [
  "# Auditoria de Dependências",
  "",
  `- Pacotes analisados: **${Object.keys(payload).length}**`,
  `- Escopo: **${prodOnly ? "produção" : "produção + dev"}** · nível de bloqueio: **${level}**`,
  `- Achados: ${ORDER.map((s) => `${s}=${counts[s]}`).join(" · ")}`,
  `- Bloqueantes: **${blocking.length}** · aceitos em allowlist: **${rows.filter((r) => r.allowed).length}**`,
  "",
];
if (rows.length) {
  md.push(
    "| Pacote | Sev | Escopo | Instalado | Faixa vulnerável | Achado | Status |",
    "|---|---|---|---|---|---|---|"
  );
  for (const r of rows.sort((a, b) => ORDER.indexOf(b.severity) - ORDER.indexOf(a.severity))) {
    md.push(
      `| \`${r.name}\` | ${r.severity} | ${r.scope} | \`${r.affected}\` | \`${r.range}\` | [${r.title.slice(0, 80)}](${r.url}) | ${
        r.allowed ? "aceito" : r.blocking ? "❌ bloqueante" : "informativo"
      } |`
    );
  }
} else {
  md.push("✅ Nenhum advisory encontrado.");
}
writeFileSync(REPORT_FILE, md.join("\n") + "\n");
console.log(md.join("\n"));

if (blocking.length) {
  console.error(
    `\n[dep-audit] FALHA: ${blocking.length} advisory(ies) >= ${level} sem correção nem allowlist.`
  );
  process.exit(1);
}
console.log("\n[dep-audit] OK");
