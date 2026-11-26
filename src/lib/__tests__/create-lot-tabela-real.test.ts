import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

// Guarda da correcao do create-lot: a edge publicada escrevia na tabela `lots`, que nao existe
// no banco (o inventario acusava o objeto em objetos_citados_sem_banco). Toda chamada devolvia
// erro. Agora ela grava em public.lotes, e este teste prende duas coisas:
//   1) a tabela usada e a que existe;
//   2) toda coluna do insert existe de fato no Insert de lotes em src/integrations/supabase/types.ts
//      (o nome errado que causou o bug -- lot_number no lugar de numero_lote -- volta a falhar aqui).

const EDGE = resolve(process.cwd(), "supabase/functions/create-lot/index.ts");
const TYPES = resolve(process.cwd(), "src/integrations/supabase/types.ts");

function colunasDoInsertDeLotes(): Set<string> {
  const fonte = readFileSync(TYPES, "utf8");
  const inicio = fonte.indexOf("      lotes: {");
  expect(inicio, "tabela lotes ausente em types.ts").toBeGreaterThan(-1);
  const blocoLotes = fonte.slice(inicio, fonte.indexOf("\n      },", inicio));
  const inicioInsert = blocoLotes.indexOf("Insert: {");
  expect(inicioInsert, "Insert de lotes ausente em types.ts").toBeGreaterThan(-1);
  const bloco = blocoLotes.slice(inicioInsert, blocoLotes.indexOf("\n        },", inicioInsert));
  return new Set([...bloco.matchAll(/^ {10}([a-z0-9_]+)\??:/gm)].map((m) => m[1]));
}

function insertDaEdge(): { tabela: string; colunas: string[] } {
  const fonte = readFileSync(EDGE, "utf8");
  const inicio = fonte.indexOf(".insert({");
  expect(inicio, "insert ausente na edge").toBeGreaterThan(-1);
  const tabela =
    [...fonte.slice(0, inicio).matchAll(/\.from\(\s*["']([a-z0-9_]+)["']\s*\)/g)].at(-1)?.[1] ?? "";
  const bloco = fonte.slice(inicio, fonte.indexOf("\n      })", inicio));
  return {
    tabela,
    colunas: [...bloco.matchAll(/^ {8}([a-z0-9_]+):/gm)].map((m) => m[1]),
  };
}

describe("create-lot grava na tabela e nas colunas que existem", () => {
  it("usa a tabela lotes, nunca a tabela lots", () => {
    const fonte = readFileSync(EDGE, "utf8");
    expect(insertDaEdge().tabela).toBe("lotes");
    expect(fonte).not.toMatch(/\.from\(\s*["']lots["']\s*\)/);
  });

  it("toda coluna do insert existe no Insert de lotes", () => {
    const { colunas } = insertDaEdge();
    const banco = colunasDoInsertDeLotes();
    expect(colunas.length, "insert sem colunas mapeadas").toBeGreaterThanOrEqual(7);
    const inexistentes = colunas.filter((c) => !banco.has(c));
    expect(inexistentes, `coluna inexistente em lotes: ${inexistentes.join(", ")}`).toEqual([]);
  });

  it("nao sobra nome de coluna do modelo antigo em ingles", () => {
    const fonte = readFileSync(EDGE, "utf8");
    for (const antiga of ["lot_number", "product_id", "manufacturing_date", "expiration_date"]) {
      expect(fonte, `coluna antiga ${antiga}`).not.toContain(antiga);
    }
  });
});
