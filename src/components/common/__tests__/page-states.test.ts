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

/** Lote 2 — telas com busca própria (`loading`/`error` em vez de `isLoading`/`isError`). */
const PAGES_LOTE2 = [
  "pages/GestaoTarefas.tsx",
  "pages/quality/QualityPage.tsx",
  "pages/Gamificacao.tsx",
  "pages/notifications/NotificationsPage.tsx",
  "features/picking/pages/PickingPage.tsx",
  "pages/Rastreabilidade.tsx",
];

const ALL = [...PAGES, ...PAGES_LOTE2];

describe("estados de tela nas paginas operacionais (E-181)", () => {
  it.each(ALL)("%s trata erro com nova tentativa", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");

    expect(source).toMatch(/from "@\/components\/common\/AsyncStates"/);
    expect(source).toMatch(/<ErrorState[\s\S]{0,200}onRetry=/);
    // o ErrorState precisa estar atras da condicao de erro, nao em codigo morto
    expect(source).toMatch(/(?:isError|erro[A-Za-z]*|error)[\s\S]{0,300}<ErrorState/);
    expect(source).toMatch(/isError|error/);
  });

  it.each(ALL)("%s nao recarrega a pagina inteira como retry", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");
    expect(source).not.toMatch(/window\.location\.reload\(/);
  });

  it.each(ALL)("%s tem estado de carregamento", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");
    expect(source).toMatch(/isLoading|loading/);
  });

  it.each(PAGES_LOTE2)("%s tem estado vazio ou lista na tela", (page) => {
    const source = readFileSync(join(ROOT, page), "utf8");
    expect(source).toMatch(/length === 0|EmptyState|map\(/);
  });
});
