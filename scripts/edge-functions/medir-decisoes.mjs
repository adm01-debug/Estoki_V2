// Remede as decisoes das edge functions publicadas em producao.
//
// Uso: node scripts/edge-functions/medir-decisoes.mjs [--escrever]
// Fonte: inventario/estado/banco.json (lista publicada medida na API), o fonte de
// cada funcao em supabase/functions/<slug>/index.ts e inventario/estado/edges.json
// (chamadores por pasta). Sem --escrever so imprime o resumo — nada e alterado.
import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const RAIZ = process.cwd();
const ARQUIVO = join(RAIZ, "scripts/edge-functions/decisao-edges.json");
const FUNCOES = join(RAIZ, "supabase/functions");

// Funcoes que existem para rodar antes de haver sessao (contrato de plataforma).
const POR_DESIGN = new Set([
  "auth-login",
  "auth-register",
  "auth-recover",
  "auth-refresh",
  "auth-verify",
  "health",
  "webauthn-register",
  "webauthn-authenticate",
  "webauthn-options",
]);

const GUARDA =
  /\b(exigirSessao|exigirSessaoOuCron|veioDoInterno|veioDoCron|usuarioDaSessao|tokenDoBearer)\b/;
// Delegacao de sessao: o cliente e criado com o Authorization do chamador e a RLS decide.
const SESSAO_DO_CHAMADOR = /Authorization:\s*req\.headers\.get\(\s*["']Authorization["']/;

const banco = JSON.parse(readFileSync(join(RAIZ, "inventario/estado/banco.json"), "utf8"));
const edges = JSON.parse(readFileSync(join(RAIZ, "inventario/estado/edges.json"), "utf8"));
const atual = JSON.parse(readFileSync(ARQUIVO, "utf8"));

const publicadas = banco.edge_functions.publicadas;
const porSlug = new Map(publicadas.map((p) => [p.slug, p]));

function fonte(slug) {
  const caminho = join(FUNCOES, slug, "index.ts");
  return existsSync(caminho) ? readFileSync(caminho, "utf8") : null;
}

function ehPorDesign(slug) {
  return POR_DESIGN.has(slug) || slug.startsWith("auth-");
}

function classificar(slug, src, total) {
  if (!src) return "sem-codigo-no-repo";
  if (ehPorDesign(slug)) return "publica-por-design";
  if (GUARDA.test(src) || SESSAO_DO_CHAMADOR.test(src)) return "mantem";
  if (total > 0) return "precisa-guarda";
  return "revisar";
}

function chamadores(slug) {
  const e = edges.edge_functions[slug];
  if (!e || !e.chamada_em) return 0;
  return Object.values(e.chamada_em).reduce((a, b) => a + b, 0);
}

const decisoes = [];

// As decisoes de 24/11 foram tomadas lendo cada funcao. Esta remedicao nao as
// derruba com regex: ela corrige o que ficou velho (funcao republicada, funcao que
// deixou de existir, funcao que entrou depois) e marca o que ainda precisa de olho
// humano como "revisar" — nunca "remover" automaticamente.
for (const slug of [...porSlug.keys()].sort()) {
  const pub = porSlug.get(slug);
  const src = fonte(slug);
  const total = chamadores(slug);
  const anterior = atual.funcoes.find((f) => f.slug === slug);
  const decididoAntes =
    anterior &&
    [
      "mantem",
      "publica-por-design",
      "precisa-guarda",
      "stub-sem-implementacao",
      "remover",
    ].includes(anterior.decisao);
  const decisao = decididoAntes ? anterior.decisao : classificar(slug, src, total);
  const motivo = decididoAntes
    ? anterior.motivo
    : decisao === "mantem"
      ? "index.ts verifica a sessao (_shared/auth.ts) ou cria o cliente com o Authorization do chamador"
      : decisao === "publica-por-design"
        ? "existe para rodar antes de haver sessao (auth/login/fluxo publico)"
        : decisao === "precisa-guarda"
          ? `sem guarda de sessao e chamada ${total}x pelo app — adicionar exigirSessao`
          : decisao === "sem-codigo-no-repo"
            ? "publicada mas sem pasta/index.ts no repo — ninguem consegue auditar nem corrigir"
            : "sem guarda de sessao e sem chamador no repo; decisao manual pendente";
  decisoes.push({
    slug,
    decisao,
    motivo,
    verify_jwt: pub.verify_jwt,
    versao: pub.versao,
    atualizada_em: pub.atualizada_em,
  });
}

// Preserva o historico: funcao que estava no arquivo e nao esta mais publicada
// continua registrada como "removido" (prova ao vivo e HTTP 404 com a chave publica),
// para o proximo agente nao recriar uma funcao que ja foi decidida.
for (const antiga of atual.funcoes) {
  if (porSlug.has(antiga.slug)) continue;
  decisoes.push({
    ...antiga,
    decisao: "removido",
    motivo:
      antiga.decisao === "removido" || antiga.decisao === "remover"
        ? antiga.motivo
        : `${antiga.motivo} | nao estava publicada na remedicao de ${new Date().toISOString().slice(0, 10)}`,
  });
}

decisoes.sort((a, b) => a.slug.localeCompare(b.slug));
const resumo = decisoes.reduce((acc, d) => ((acc[d.decisao] = (acc[d.decisao] ?? 0) + 1), acc), {});
const novo = {
  _medido_em: new Date().toISOString().replace(/\.\d+Z$/, "Z"),
  _fonte:
    "inventario/estado/banco.json (publicadas) + supabase/functions/**/index.ts + inventario/estado/edges.json",
  _gerado_por: "node scripts/edge-functions/medir-decisoes.mjs --escrever",
  _criterios: {
    "publica-por-design": "existe para rodar antes de haver sessao (auth/health/webauthn)",
    mantem:
      "index.ts verifica a sessao (exigirSessao/exigirSessaoOuCron/usuarioDaSessao/getUser/veioDoCron/veioDoInterno)",
    "precisa-guarda": "sem guarda e chamada pelo app",
    remover: "sem guarda, sem chamador no repo (remocao exige autorizacao)",
    "sem-codigo-no-repo": "publicada em producao sem fonte versionado",
    revisar:
      "sem guarda detectavel e sem chamador no repo: decisao manual pendente (nao remover por atacado)",
    removido: "ja removida de producao; prova ao vivo: HTTP 404 com a chave publica",
  },
  funcoes: decisoes,
};

console.log("publicadas:", publicadas.length);
console.log("resumo:", resumo);
console.log(
  "remover:",
  decisoes
    .filter((d) => d.decisao === "remover")
    .map((d) => d.slug)
    .join(", ") || "(nenhuma)"
);
console.log(
  "revisar:",
  decisoes
    .filter((d) => d.decisao === "revisar")
    .map((d) => d.slug)
    .join(", ") || "(nenhuma)"
);
console.log(
  "sem-codigo-no-repo:",
  decisoes
    .filter((d) => d.decisao === "sem-codigo-no-repo")
    .map((d) => d.slug)
    .join(", ") || "(nenhuma)"
);

if (process.argv.includes("--escrever")) {
  writeFileSync(ARQUIVO, JSON.stringify(novo, null, 2) + "\n");
  console.log("escrito:", ARQUIVO);
}
