import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const DIALOGOS = [
  "src/components/tarefas/NovaTarefaDialog.tsx",
  "src/components/kpis-page/KPIMetaDialog.tsx",
  "src/components/inventario/NovoCicloDialog.tsx",
  "src/components/ondas/NovoOndaDialog.tsx",
  "src/components/trocas-page/NovoRegistroDialog.tsx",
  "src/components/romaneios/NovoRomaneioDialog.tsx",
  "src/components/common/SavedFiltersManager.tsx",
  "src/components/filters/SavedFiltersDropdown.tsx",
  "src/components/DataImporter.tsx",
  "src/components/security/PasskeySettings.tsx",
  "src/features/receiving/components/ImportarNFDialog.tsx",
  "src/pages/AjustesEstoque.tsx",
  "src/pages/orders/OrdersPage.tsx",
];

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

describe("diálogos de criação: Enter envia e ação não é ambígua", () => {
  it.each(DIALOGOS)("%s tem form com onSubmit e submit explícito", (file) => {
    const source = read(file);
    expect(source).toContain("<form");
    expect(source).toContain("</form>");
    expect(source).toMatch(/onSubmit=\{\(e\) => \{\s*e\.preventDefault\(\);/);
    expect(source).toContain('type="submit"');
  });

  it.each(DIALOGOS)("%s não deixa botão sem type dentro do form", (file) => {
    const source = read(file);
    const inicio = source.indexOf("<form");
    const fim = source.indexOf("</form>");
    expect(inicio).toBeGreaterThan(-1);
    expect(fim).toBeGreaterThan(inicio);
    const semType = [...source.slice(inicio, fim).matchAll(/<Button\b[^>]*>/g)]
      .map((m) => m[0])
      .filter((tag) => !tag.includes('type="') && !tag.includes("asChild"));
    expect(semType).toEqual([]);
  });
});
