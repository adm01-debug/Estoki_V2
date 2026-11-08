#!/usr/bin/env node
/**
 * Garante que as instrucoes para agentes nao foram apagadas ou esvaziadas por outra sessao.
 * Alvo vigiado: AGENTS.md (regras), CLAUDE.md (so `@AGENTS.md`), docs/agentes/*.md (referencia)
 * e os dois SKILL.md espelhados, que precisam continuar identicos entre si.
 * Verifica:
 *  - AGENTS.md existe e tem os cabecalhos obrigatorios (ancorados em inicio de linha e fora de
 *    bloco de codigo: uma mencao em prosa ou dentro de ``` nao satisfaz);
 *  - CLAUDE.md, se existir, continua importando AGENTS.md;
 *  - os dois SKILL.md espelhados sao byte-identicos;
 *  - o conjunto dos arquivos que existem NA BASE nao encolheu >30% em bytes;
 *  - cada arquivo da base (menos CLAUDE.md, que e minusculo por design) continua existindo com
 *    >=50% do tamanho que tem na base.
 * Base: AGENTS_MD_BASE (no CI, a main buscada). Sem a variavel, compara com HEAD.
 * Se a base NAO resolver (ref inexistente, fora de repo git, sem git no PATH), o script FALHA:
 * uma base nula pularia a comparacao e deixaria um wipe passar. Para rodar sem base de proposito,
 * exporte AGENTS_MD_ALLOW_NO_BASE=1.
 */
import { readFileSync, readdirSync, existsSync, statSync } from "node:fs";
import { execFileSync } from "node:child_process";
import { join } from "node:path";

const AGENTS = "AGENTS.md";
const CLAUDE = "CLAUDE.md";
const DOCS_DIR = "docs/agentes";
const SKILLS = [".claude/skills/estoki-v2/SKILL.md", ".agents/skills/estoki-v2/SKILL.md"];
const EXTRA_RAIZ = [AGENTS, CLAUDE, ...SKILLS];
const REQUIRED_SECTIONS = [
  "## Postura",
  "## Bugs e funcionalidades",
  "## Comunicação",
  "## Fluxo Git",
  "## Banco",
  "## Serviços",
  "## Stack e comandos",
  "## Qualidade e guardas",
];
const SHRINK_THRESHOLD = 0.3;
const FILE_SHRINK_THRESHOLD = 0.5;

let falhas = 0;
const erro = (msg) => {
  console.error(`::error::${msg}`);
  falhas += 1;
};
const sair = () => {
  process.exitCode = falhas > 0 ? 1 : 0;
  process.exit();
};

function ler(path) {
  try {
    return readFileSync(path, "utf8");
  } catch (e) {
    erro(`${path} existe na arvore mas nao pode ser lido (${e.code || e.message}).`);
    return null;
  }
}

const content = ler(AGENTS);
if (content === null) {
  erro(`${AGENTS} nao encontrado ou ilegivel. Outra sessao pode ter apagado o arquivo.`);
  sair();
}

// Cabecalhos: inicio de linha e FORA de bloco de codigo. Sem isso, os 8 cabecalhos dentro de uma
// fence (ou citados em prosa) satisfazem o check com o arquivo vazio de regra.
const cabecalhos = [];
let dentroDeFence = false;
for (const linha of content.split("\n")) {
  const l = linha.trimEnd();
  if (/^\s*(```|~~~)/.test(l)) {
    dentroDeFence = !dentroDeFence;
    continue;
  }
  if (!dentroDeFence && l.startsWith("## ")) cabecalhos.push(l);
}
for (const s of REQUIRED_SECTIONS) {
  if (!cabecalhos.some((l) => l.startsWith(s))) erro(`${AGENTS}: secao obrigatoria ausente: ${s}`);
}
if (falhas > 0) sair();

// CLAUDE.md e so `@AGENTS.md` por design: se existir, tem que continuar importando AGENTS.md.
if (existsSync(CLAUDE)) {
  const c = ler(CLAUDE);
  if (c !== null && !c.includes(`@${AGENTS}`)) {
    erro(`${CLAUDE} existe e nao importa ${AGENTS} (esperado o conteudo "@${AGENTS}").`);
  }
}

// Os dois SKILL.md sao espelhos: divergir significa que um agente esta lendo regra diferente.
const presentes = SKILLS.filter((p) => existsSync(p));
if (presentes.length === SKILLS.length) {
  const [a, b] = SKILLS.map((p) => readFileSync(p));
  if (!a.equals(b))
    erro(`${SKILLS[0]} e ${SKILLS[1]} divergiram; os espelhos devem ser identicos.`);
} else if (presentes.length === 1) {
  erro(`${SKILLS.find((p) => !existsSync(p))} sumiu; os dois SKILL.md espelhados devem existir.`);
}

function listarDocs() {
  if (!existsSync(DOCS_DIR)) return [];
  // recursivo, para bater com o `ls-tree -r` usado na base
  return readdirSync(DOCS_DIR, { recursive: true })
    .map((f) => join(DOCS_DIR, String(f)))
    .filter((p) => p.endsWith(".md") && statSync(p, { throwIfNoEntry: false })?.isFile());
}

function bytes(path) {
  const txt = ler(path);
  return txt === null ? null : Buffer.byteLength(txt);
}

// git sem shell: `${base}` interpolado numa string de shell era injecao de comando.
function git(args) {
  return execFileSync("git", args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
}

function bytesNaBase(base) {
  const porArquivo = new Map();
  const tamanho = (path) => {
    try {
      porArquivo.set(
        path,
        Number.parseInt(git(["cat-file", "-s", `${base}:${path}`]).trim(), 10) || 0
      );
    } catch {
      /* nao existe na base */
    }
  };
  for (const f of EXTRA_RAIZ) tamanho(f);
  let lista = "";
  try {
    // -z: sem C-quoting, entao nome com acento continua casando com o arquivo em disco
    lista = git(["ls-tree", "-r", "--name-only", "-z", base, "--", DOCS_DIR]);
  } catch {
    lista = "";
  }
  for (const path of lista.split("\0").filter((l) => l.endsWith(".md"))) tamanho(path);
  if (porArquivo.size === 0) return null;
  let total = 0;
  for (const n of porArquivo.values()) total += n;
  return { total, porArquivo };
}

const BASE = process.env.AGENTS_MD_BASE || "HEAD";
if (BASE.startsWith("-")) {
  erro(`AGENTS_MD_BASE invalido ("${BASE}"): nao pode comecar com "-".`);
  sair();
}
const base = bytesNaBase(BASE);

if (!base) {
  if (process.env.AGENTS_MD_ALLOW_NO_BASE === "1") {
    console.log(
      `${AGENTS} OK: ${REQUIRED_SECTIONS.length} secoes presentes. Comparacao de tamanho PULADA (base "${BASE}" nao resolveu e AGENTS_MD_ALLOW_NO_BASE=1).`
    );
    sair();
  }
  erro(
    `Base "${BASE}" nao resolveu (ref inexistente, fora de repo git ou git ausente). A comparacao de tamanho nao rodou, entao um wipe passaria: falhando de proposito. Use AGENTS_MD_ALLOW_NO_BASE=1 para rodar sem base.`
  );
  sair();
}

// Compara apenas os arquivos que existem NA BASE: um .md novo (ou um symlink) inflava o conjunto e
// mascarava o encolhimento dos vigiados.
let atualVigiado = 0;
for (const path of base.porArquivo.keys()) {
  if (!existsSync(path)) continue;
  const n = bytes(path);
  if (n !== null) atualVigiado += n;
}
const ratio = atualVigiado / base.total;
if (ratio < 1 - SHRINK_THRESHOLD) {
  erro(
    `Instrucoes para agentes encolheram ${Math.round((1 - ratio) * 100)}% vs ${BASE} (atual: ${atualVigiado} bytes, base: ${base.total} bytes), contando so os arquivos que existem na base. Possivel wipe por sessao paralela.`
  );
  sair();
}

for (const [path, naBase] of base.porArquivo) {
  if (path === CLAUDE || naBase === 0) continue;
  if (!existsSync(path)) {
    erro(
      `${path} existia em ${BASE} (${naBase} bytes) e sumiu. Possivel wipe por sessao paralela (se foi rename deliberado, faca em PR propria e atualize a base).`
    );
    continue;
  }
  const agora = bytes(path);
  if (agora === null) continue;
  if (agora < naBase * FILE_SHRINK_THRESHOLD) {
    erro(
      `${path} encolheu ${Math.round((1 - agora / naBase) * 100)}% vs ${BASE} (atual: ${agora} bytes, base: ${naBase} bytes); limite por arquivo e ${Math.round(FILE_SHRINK_THRESHOLD * 100)}%.`
    );
  }
}
if (falhas > 0) sair();

const docsAgora = listarDocs().length;
console.log(
  `${AGENTS} OK: ${REQUIRED_SECTIONS.length} secoes presentes; ${docsAgora} docs em ${DOCS_DIR}/; vigiados ${atualVigiado} bytes vs ${base.total} na base ${BASE} (${base.porArquivo.size} arquivos, cada um >= ${Math.round(FILE_SHRINK_THRESHOLD * 100)}%).`
);
sair();
