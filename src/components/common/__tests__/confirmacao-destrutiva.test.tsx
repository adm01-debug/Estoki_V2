import { describe, it, expect, vi, beforeEach } from "vitest";
import fs from "node:fs";
import path from "node:path";

const { mockErro } = vi.hoisted(() => ({ mockErro: vi.fn() }));
vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    error: mockErro,
    success: vi.fn(),
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

import { mutationCache } from "@/lib/mutationCache";

const NATIVO = /(?<![\w.])confirm\s*\(/;

function varrer(dir: string, acc: string[] = []): string[] {
  for (const entrada of fs.readdirSync(dir, { withFileTypes: true })) {
    const completo = path.join(dir, entrada.name);
    if (entrada.isDirectory()) {
      if (entrada.name === "__tests__" || entrada.name === "node_modules") continue;
      varrer(completo, acc);
    } else if (/\.(ts|tsx)$/.test(entrada.name)) {
      acc.push(completo);
    }
  }
  return acc;
}

describe("confirmacao destrutiva", () => {
  it("nao usa confirm() nativo em nenhum arquivo de src", () => {
    const infratores = varrer(path.resolve(process.cwd(), "src")).filter((arquivo) =>
      NATIVO.test(fs.readFileSync(arquivo, "utf8"))
    );
    expect(infratores).toEqual([]);
  });

  it("mantem dialogo de confirmacao nas acoes destrutivas que nao tinham", () => {
    for (const arquivo of [
      "src/components/security/MFASettings.tsx",
      "src/pages/notifications/NotificationsPage.tsx",
      "src/pages/RelatoriosAgendados.tsx",
    ]) {
      const conteudo = fs.readFileSync(path.resolve(process.cwd(), arquivo), "utf8");
      expect(conteudo, arquivo).toContain("<ConfirmDialog");
    }
  });
});

describe("MutationCache global", () => {
  beforeEach(() => mockErro.mockClear());

  it("mostra toast quando a mutacao nao trata o proprio erro", () => {
    mutationCache.config.onError?.(new Error("violacao de RLS"), undefined, undefined, {
      options: {},
    } as never);
    expect(mockErro).toHaveBeenCalledWith("Não foi possível concluir a ação", {
      description: "violacao de RLS",
    });
  });

  it("nao duplica o toast quando a mutacao define o proprio onError", () => {
    mutationCache.config.onError?.(new Error("x"), undefined, undefined, {
      options: { onError: () => {} },
    } as never);
    expect(mockErro).not.toHaveBeenCalled();
  });
});
