import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = join(process.cwd(), "src");

/**
 * E-181 — toda tela precisa tratar carregando, erro e vazio. O erro precisa de
 * `onRetry` que refaz a busca (nada de recarregar a página inteira).
 */
const PAGES = [
  "pages/KanbanPipeline.tsx",
  "pages/admin/AuditLogPage.tsx",
  "pages/AjustesEstoque.tsx",
];

describe("estados de tela nas paginas operacionais (E-181)", () => {
  it.each(PAGES)("%s trata erro com nova tentativa", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");

    expect(source).toMatch(/from "@\/components\/common\/AsyncStates"/);
    expect(source).toMatch(/<ErrorState[\s\S]{0,200}onRetry=/);
    expect(source).toMatch(/isError/);
  });

  it.each(PAGES)("%s nao recarrega a pagina inteira como retry", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");
    expect(source).not.toMatch(/window\.location\.reload\(/);
  });

  it.each(PAGES)("%s tem estado de carregamento", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");
    expect(source).toMatch(/isLoading/);
  });
});
