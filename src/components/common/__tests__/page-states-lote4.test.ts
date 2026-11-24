import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "src");

/**
 * E-181 lote 4 — telas administrativas e operacionais que falhavam em silêncio:
 * sem `isError` o usuário via tabela vazia como se não houvesse dado.
 */
const PAGES = [
  "pages/AlertasInteligentes.tsx",
  "pages/admin/AuditoriaCriticaPage.tsx",
  "pages/admin/BackendHealthPage.tsx",
  "pages/EndereçamentoAutomatico.tsx",
];

describe("estados de tela nas paginas administrativas (E-181 lote 4)", () => {
  it.each(PAGES)("%s trata erro com nova tentativa", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");

    expect(source).toMatch(/from "@\/components\/common\/AsyncStates"/);
    expect(source).toMatch(/<ErrorState[\s\S]{0,200}onRetry=/);
    // o ErrorState precisa estar atras da condicao de erro, nao em codigo morto
    expect(source).toMatch(/(?:isError|erro[A-Za-z]*|error)[\s\S]{0,300}<ErrorState/);
  });

  it.each(PAGES)("%s nao recarrega a pagina inteira como retry", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");
    expect(source).not.toMatch(/window\.location\.reload\(/);
  });

  it.each(PAGES)("%s tem estado de carregamento", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");
    expect(source).toMatch(/isLoading|loading/);
  });

  it.each(PAGES)("%s tem estado vazio ou lista na tela", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");
    expect(source).toMatch(/length === 0|EmptyState|map\(/);
  });
});
