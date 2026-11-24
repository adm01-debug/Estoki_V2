import { describe, it, expect, vi, afterEach } from "vitest";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { exportRowsToCSV, exportToCSV, objectsToCSV, rowsToCSV } from "@/lib/export";

describe("rowsToCSV", () => {
  it("escapa aspas duplas dobrando o caractere dentro das aspas", () => {
    const csv = rowsToCSV(["Nome"], [['Mochila Notebook 15.6"']]);
    expect(csv).toBe('Nome\n"Mochila Notebook 15.6"""');
  });

  it("escapa virgula, ponto e virgula e quebra de linha", () => {
    const csv = rowsToCSV(["A", "B"], [["x,y", "linha\nquebrada"]]);
    expect(csv).toBe('A,B\n"x,y","linha\nquebrada"');
  });

  it("neutraliza formula ao abrir no Excel", () => {
    const csv = rowsToCSV(["SKU"], [["=1+1"]]);
    expect(csv).toBe("SKU\n'=1+1");
  });

  it("mantem valores numericos e vazios sem aspas", () => {
    const csv = rowsToCSV(["Min", "Max"], [[0, null]]);
    expect(csv).toBe("Min,Max\n0,");
  });
});

describe("objectsToCSV", () => {
  it("nao serializa com JSON.stringify: aspas internas viram aspas dobradas", () => {
    // JSON.stringify gerava "Mochila \"15.6\"" — invalido em CSV e quebrava a coluna.
    expect(objectsToCSV([{ Nome: 'Mochila 15.6"', Qtd: 2 }])).toBe('Nome,Qtd\n"Mochila 15.6""",2');
  });

  it("escapa virgula e neutraliza formula na mesma linha", () => {
    expect(objectsToCSV([{ SKU: "=1+1", Nome: "Cabo, HDMI" }])).toBe(
      'SKU,Nome\n\'=1+1,"Cabo, HDMI"'
    );
  });

  it("sem registros devolve string vazia", () => {
    expect(objectsToCSV([])).toBe("");
  });
});

/** E-182: um unico caminho de escrita de CSV — BOM para o Excel e uma unica descarga. */
describe("download de CSV", () => {
  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllGlobals();
  });

  function capturarDownload(fn: () => void) {
    const conteudos: string[] = [];
    const clicks: string[] = [];
    const BlobOriginal = globalThis.Blob;
    class BlobEspiao extends BlobOriginal {
      constructor(partes: BlobPart[], opcoes?: BlobPropertyBag) {
        super(partes, opcoes);
        // Blob.text() remove o BOM na decodificacao; aqui guardamos o texto cru.
        conteudos.push(partes.map((p) => String(p)).join(""));
      }
    }
    vi.stubGlobal("Blob", BlobEspiao);
    vi.stubGlobal("URL", {
      ...URL,
      createObjectURL: vi.fn(() => "blob:estoki"),
      revokeObjectURL: vi.fn(),
    });
    const clickOriginal = HTMLAnchorElement.prototype.click;
    HTMLAnchorElement.prototype.click = function () {
      clicks.push(this.download);
    };
    try {
      fn();
    } finally {
      HTMLAnchorElement.prototype.click = clickOriginal;
    }
    return { conteudos, clicks };
  }

  it("exportRowsToCSV grava BOM, nome do arquivo e uma unica descarga", () => {
    const { conteudos, clicks } = capturarDownload(() =>
      exportRowsToCSV(["Nome"], [["João, Silva"]], "produtos_estoki_2026-11-24")
    );
    expect(clicks).toEqual(["produtos_estoki_2026-11-24.csv"]);
    expect(conteudos).toEqual(['\ufeffNome\n"João, Silva"']);
  });

  it("exportToCSV nao baixa nada quando a lista esta vazia", () => {
    const { conteudos, clicks } = capturarDownload(() => exportToCSV([], "vazio"));
    expect(conteudos).toHaveLength(0);
    expect(clicks).toHaveLength(0);
  });
});

/** E-182: nenhuma tela remonta CSV na mao (perde escape e abre brecha de CSV injection). */
describe("guard: CSV escrito apenas por src/lib/export.ts", () => {
  const RAIZES = ["src/pages", "src/features", "src/components", "src/hooks"];
  const ARTESANAL = /\.map\([\s\S]{0,120}?\.join\(","\)[\s\S]{0,80}?\.join\("\\n"\)/;

  function arquivos(dir: string): string[] {
    if (!existsSync(dir)) return [];
    return readdirSync(dir).flatMap((entrada) => {
      const caminho = join(dir, entrada);
      if (statSync(caminho).isDirectory()) {
        return entrada === "__tests__" ? [] : arquivos(caminho);
      }
      return /\.tsx?$/.test(entrada) ? [caminho] : [];
    });
  }

  it("nenhum arquivo monta linha de CSV com join(',') manual", () => {
    const infratores = RAIZES.flatMap(arquivos).filter((arquivo) =>
      ARTESANAL.test(readFileSync(arquivo, "utf8"))
    );
    expect(infratores).toEqual([]);
  });
});
