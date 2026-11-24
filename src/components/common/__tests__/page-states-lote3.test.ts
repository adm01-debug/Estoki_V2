import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "src");

/** E-181, lote 3 — telas de estoque. Erro precisa de retry que refaz a consulta. */
const PAGES = [
  "pages/Lotes.tsx",
  "pages/Ondas.tsx",
  "pages/Movimentacao.tsx",
  "pages/Armazenamento.tsx",
  "pages/Posicoes.tsx",
  "pages/AprovacaoMovimentacoes.tsx",
];

describe("estados de tela nas paginas de estoque (E-181 lote 3)", () => {
  it.each(PAGES)("%s trata erro com nova tentativa", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");
    expect(source).toMatch(/from "@\/components\/common\/AsyncStates"/);
    expect(source).toMatch(/<ErrorState[\s\S]{0,200}onRetry=/);
    // o ErrorState precisa estar atras da condicao de erro, nao em codigo morto
    expect(source).toMatch(/(?:isError|erro[A-Za-z]*|error)[\s\S]{0,300}<ErrorState/);
    expect(source).toMatch(/isError|error/);
  });

  it.each(PAGES)("%s nao recarrega a pagina inteira como retry", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");
    expect(source).not.toMatch(/window\.location\.reload\(/);
  });

  it.each(PAGES)("%s tem estado de carregamento e lista", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");
    expect(source).toMatch(/isLoading|loading/);
    expect(source).toMatch(/length === 0|map\(/);
  });
});
