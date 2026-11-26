import { readdirSync, readFileSync } from "node:fs";
import { basename, dirname, join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Guarda contra edge function que consulta tabela que nao existe no banco de hoje.
// Nada aqui e "estilo": tabela ausente = a funcao devolve erro em toda chamada, e o
// endpoint segue publicado como se funcionasse.
//
// O baseline e a lista medida do que ja estava quebrado quando a guarda nasceu. Ela
// impede que novas referencias quebradas entrem e avisa quando alguem conserta uma.
//
// Atualizar depois de corrigir/remover uma funcao:
//   npx vitest run src/lib/__tests__/edges-tabelas-existentes.test.ts -u
// e revisar o diff de .edges-tabelas-baseline.json.

const RAIZ = process.cwd();
const TYPES = resolve(RAIZ, "src/integrations/supabase/types.ts");
const BASELINE = resolve(RAIZ, ".edges-tabelas-baseline.json");
const FUNCTIONS = resolve(RAIZ, "supabase/functions");

function tabelasDoBanco(): Set<string> {
  const fonte = readFileSync(TYPES, "utf8");
  const inicio = fonte.indexOf("Tables: {");
  const fim = fonte.indexOf("Views: {", inicio);
  const bloco = fonte.slice(inicio, fim);
  return new Set([...bloco.matchAll(/^ {6}([a-z0-9_]+): \{/gm)].map((m) => m[1]));
}

function arquivosDeEdge(dir: string, saida: string[] = []): string[] {
  for (const entrada of readdirSync(dir, { withFileTypes: true })) {
    const caminho = join(dir, entrada.name);
    if (entrada.isDirectory()) arquivosDeEdge(caminho, saida);
    else if (entrada.name.endsWith(".ts")) saida.push(caminho);
  }
  return saida;
}

function auditar(): { tabelas: Record<string, string[]>; total: number } {
  const banco = tabelasDoBanco();
  const quebradas: Record<string, Set<string>> = {};
  for (const arquivo of arquivosDeEdge(FUNCTIONS)) {
    if (basename(arquivo).endsWith("_test.ts")) continue;
    const fonte = readFileSync(arquivo, "utf8");
    const funcao = basename(dirname(arquivo));
    for (const m of fonte.matchAll(/\.from\(\s*["']([a-z0-9_]+)["']\s*\)/g)) {
      const tabela = m[1];
      if (banco.has(tabela)) continue;
      (quebradas[tabela] ??= new Set()).add(funcao);
    }
  }
  const saida: Record<string, string[]> = {};
  for (const tabela of Object.keys(quebradas).sort()) {
    saida[tabela] = [...quebradas[tabela]].sort();
  }
  return {
    tabelas: saida,
    total: Object.values(saida).reduce((acc, funcoes) => acc + funcoes.length, 0),
  };
}

describe("edge functions so consultam tabela que existe", () => {
  const medido = auditar();
  const baseline = JSON.parse(readFileSync(BASELINE, "utf8")) as {
    total_referencias: number;
    total_tabelas: number;
    tabelas: Record<string, string[]>;
  };

  it("a lista medida bate com o baseline, tabela por tabela", () => {
    const novas = Object.keys(medido.tabelas).filter((t) => !(t in baseline.tabelas));
    expect(
      novas,
      `Edge nova consultando tabela inexistente: ${novas.join(", ")}. ` +
        "Corrija o nome da tabela ou remova a referencia antes de seguir."
    ).toEqual([]);

    const resolvidas = Object.keys(baseline.tabelas).filter((t) => !(t in medido.tabelas));
    expect(
      resolvidas,
      `Baseline desatualizado: ${resolvidas.join(", ")} nao sao mais citadas. ` +
        "Rode com -u e commite o baseline menor."
    ).toEqual([]);

    for (const tabela of Object.keys(baseline.tabelas)) {
      expect(medido.tabelas[tabela] ?? [], `funcoes com ${tabela}`).toEqual(
        baseline.tabelas[tabela]
      );
    }
  });

  it("os totais do baseline batem com o diff medido", () => {
    expect(medido.total).toBe(baseline.total_referencias);
    expect(Object.keys(medido.tabelas).length).toBe(baseline.total_tabelas);
  });

  it("nenhuma funcao quebrada le tabela que nao existe em silencio", () => {
    for (const [tabela, funcoes] of Object.entries(medido.tabelas)) {
      expect(tabela.trim(), "nome de tabela vazio").not.toBe("");
      expect(funcoes.length, `${tabela} precisa de ao menos uma funcao`).toBeGreaterThan(0);
    }
  });
});
