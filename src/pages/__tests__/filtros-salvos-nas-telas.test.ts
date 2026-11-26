import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Garante que o recurso de filtros salvos nao volte a ficar sem tela:
 * toda tela listada precisa montar o dropdown e aplicar o filtro padrao.
 */
const TELAS: { arquivo: string; entidade: string }[] = [
  { arquivo: "src/pages/Produtos.tsx", entidade: "produtos" },
  { arquivo: "src/pages/Lotes.tsx", entidade: "lotes" },
  { arquivo: "src/pages/Romaneios.tsx", entidade: "romaneios" },
  { arquivo: "src/pages/Movimentacao.tsx", entidade: "movimentacao" },
  { arquivo: "src/pages/GestaoTarefas.tsx", entidade: "tarefas" },
  { arquivo: "src/pages/AlertasInteligentes.tsx", entidade: "alertas" },
];

describe("filtros salvos montados nas telas", () => {
  it.each(TELAS)("$arquivo usa o dropdown e aplica o filtro padrao", ({ arquivo, entidade }) => {
    const fonte = readFileSync(join(process.cwd(), arquivo), "utf8");

    expect(fonte).toContain('from "@/components/filters/SavedFiltersDropdown"');
    expect(fonte).toContain('from "@/hooks/useSavedFilters"');
    expect(fonte).toContain(`entityType="${entidade}"`);
    expect(fonte).toContain(`useApplyDefaultSavedFilter("${entidade}"`);
  });
});
