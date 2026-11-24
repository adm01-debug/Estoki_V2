import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const DIALOGOS = [
  "src/components/tarefas/NovaTarefaDialog.tsx",
  "src/components/kpis-page/KPIMetaDialog.tsx",
  "src/components/inventario/NovoCicloDialog.tsx",
  "src/components/ondas/NovoOndaDialog.tsx",
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

  it.each(DIALOGOS)("%s não deixa botão sem type dentro do DialogContent", (file) => {
    const source = read(file);
    const body = source.slice(source.indexOf("<DialogContent"));
    const semType = [...body.matchAll(/<Button\b[^>]*>/g)]
      .map((m) => m[0])
      .filter((tag) => !tag.includes('type="'));
    expect(semType).toEqual([]);
  });
});
