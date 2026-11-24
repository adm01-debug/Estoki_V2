import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const read = (p: string) => readFileSync(resolve(process.cwd(), p), "utf8");

const TELAS_COM_ATUALIZACAO_EM_MASSA = [
  "src/pages/Posicoes.tsx",
  "src/features/inventory/pages/EstoquePage.tsx",
];

const GUARDA = /if \(updatePosicao\.isPending \|\| selectedIds\.length === 0\) return;/;

describe("atualização em massa não dispara duas vezes", () => {
  it.each(TELAS_COM_ATUALIZACAO_EM_MASSA)(
    "%s ignora clique repetido e seleção vazia",
    (arquivo) => {
      const fonte = read(arquivo);
      expect(fonte).toMatch(GUARDA);
    }
  );

  it.each(TELAS_COM_ATUALIZACAO_EM_MASSA)(
    "%s desabilita os dois botoes durante a mutacao",
    (arquivo) => {
      const fonte = read(arquivo);
      const desabilitados = fonte.match(/disabled=\{updatePosicao\.isPending\}/g) ?? [];
      expect(desabilitados).toHaveLength(2);
    }
  );

  it("Posicoes trata a falha do clique em massa com aviso", () => {
    const fonte = read("src/pages/Posicoes.tsx");
    expect(fonte).toMatch(/catch \{[\s\S]{0,200}toast\.error\(/);
  });
});
