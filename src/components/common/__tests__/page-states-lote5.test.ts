import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

const ROOT = process.cwd();
const ler = (rel: string) => readFileSync(join(ROOT, rel), "utf8");

const ARQUIVOS = [
  "src/pages/serials/SerialsPage.tsx",
  "src/pages/admin/RolesPage.tsx",
  "src/pages/admin/UsersPage.tsx",
  "src/pages/OcupacaoVisual.tsx",
  "src/pages/FornecedoresAvancado.tsx",
];

describe("E-181 lote 5 — falha de carregamento visível e recuperável", () => {
  for (const arquivo of ARQUIVOS) {
    it(`${arquivo} mostra erro com nova tentativa`, () => {
      const src = ler(arquivo);
      expect(src).toContain('from "@/components/common/AsyncStates"');
      expect(src).toContain("<ErrorState");
      expect(src).toMatch(/isError/);
      expect(src).toMatch(/onRetry=\{\(\) => void (refetch|refetchCounts)\(\)\}/);
    });
  }

  it("SerialsPage não cai em 'nenhum serial encontrado' quando a consulta falha", () => {
    const src = ler("src/pages/serials/SerialsPage.tsx");
    const posErro = src.indexOf("isError ? (");
    const posLoading = src.indexOf("isLoading ? (");
    expect(posErro).toBeGreaterThan(-1);
    expect(posErro).toBeLessThan(posLoading);
  });

  it("UsersPage substitui o card de erro sem saída por ErrorState com nova tentativa", () => {
    const src = ler("src/pages/admin/UsersPage.tsx");
    expect(src).not.toContain('<p className="text-sm font-bold text-destructive">Erro ao carregar');
    expect(src).toMatch(/\berror,\s*\n\s*refetch,/);
  });

  it("páginas com retorno antecipado interrompem antes de renderizar dados vazios", () => {
    for (const arquivo of ["src/pages/OcupacaoVisual.tsx", "src/pages/FornecedoresAvancado.tsx"]) {
      const src = ler(arquivo);
      expect(src).toMatch(/if \(isError\) \{[\s\S]{0,220}<ErrorState/);
    }
  });
});
