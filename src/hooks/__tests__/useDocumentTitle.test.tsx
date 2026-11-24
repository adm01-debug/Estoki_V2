import { readFileSync } from "node:fs";
import { join } from "node:path";
import { renderHook } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { useDocumentTitle } from "@/hooks/useDocumentTitle";

const defineTituloAtual = (valor: string) => {
  document.title = valor;
};

describe("useDocumentTitle", () => {
  it("define o título da aba e restaura o anterior ao desmontar", () => {
    defineTituloAtual("Título anterior");
    const { unmount } = renderHook(() => useDocumentTitle("Estoque · ESTOKI"));

    expect(document.title).toBe("Estoque · ESTOKI");

    unmount();
    expect(document.title).toBe("Título anterior");
  });

  it("sem título (layout aninhado) não mexe no título atual", () => {
    defineTituloAtual("Estoque · ESTOKI");
    renderHook(() => useDocumentTitle(undefined));

    expect(document.title).toBe("Estoque · ESTOKI");
  });

  it("acompanha a troca de rota", () => {
    const { rerender } = renderHook(({ titulo }) => useDocumentTitle(titulo), {
      initialProps: { titulo: "Lotes · ESTOKI" },
    });
    expect(document.title).toBe("Lotes · ESTOKI");

    rerender({ titulo: "Posições · ESTOKI" });
    expect(document.title).toBe("Posições · ESTOKI");
  });

  it("AppLayout publica o título da página com a marca do app", () => {
    const src = readFileSync(join(process.cwd(), "src/components/layout/AppLayout.tsx"), "utf8");

    expect(src).toContain('from "@/hooks/useDocumentTitle"');
    expect(src).toMatch(
      /useDocumentTitle\(isNested \? undefined : title \? `\$\{title\} · \$\{APP_NAME\}` : APP_NAME\)/
    );
  });
});
