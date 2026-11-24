import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom, estado } = vi.hoisted(() => ({
  mockFrom: vi.fn(),
  estado: { existentes: new Set<string>() },
}));

vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: mockFrom } }));

beforeEach(() => {
  estado.existentes = new Set<string>();
  mockFrom.mockClear();
  mockFrom.mockImplementation(() => {
    // a primeira coluna consultada e sempre o barcode gerado na tentativa
    return {
      select: () => ({
        eq: (coluna: string, barcode: string) => ({
          maybeSingle: async () => ({
            data: estado.existentes.has(barcode) ? { id: "p1" } : null,
            error: null,
          }),
        }),
      }),
    };
  });
});

describe("gerarCodigoBarras", () => {
  it("gera EAN-13 com prefixo brasileiro e digito verificador valido", async () => {
    const { gerarCodigoBarras } = await import("../barcodeService");
    const codigo = gerarCodigoBarras("EAN13", () => 0.123456789);

    expect(codigo).toHaveLength(13);
    expect(codigo.startsWith("789")).toBe(true);

    const base = codigo.slice(0, 12);
    let soma = 0;
    for (let i = 0; i < 12; i++) soma += Number(base[i]) * (i % 2 === 0 ? 1 : 3);
    expect(Number(codigo[12])).toBe((10 - (soma % 10)) % 10);
  });

  it("gera CODE128 interno com prefixo EST", async () => {
    const { gerarCodigoBarras } = await import("../barcodeService");
    expect(gerarCodigoBarras("CODE128", () => 0.5)).toBe("EST500000000");
  });
});

describe("barcodeService.generateBarcode", () => {
  it("descarta codigos ja usados por outro produto", async () => {
    const { barcodeService } = await import("../barcodeService");
    estado.existentes.add("EST500000000");
    // primeira tentativa cai em um codigo ja existente, a segunda gera outro
    const sorteio = vi.spyOn(Math, "random").mockReturnValueOnce(0.5).mockReturnValue(0.7);

    await expect(barcodeService.generateBarcode("CODE128")).resolves.toBe("EST700000000");
    sorteio.mockRestore();

    expect(mockFrom).toHaveBeenCalledTimes(2);
  });

  it("falha depois de 5 colisoes seguidas", async () => {
    const { barcodeService } = await import("../barcodeService");
    const sorteio = vi.spyOn(Math, "random").mockReturnValue(0.5);
    mockFrom.mockImplementation(() => ({
      select: () => ({
        eq: () => ({
          maybeSingle: async () => ({ data: { id: "p1" }, error: null }),
        }),
      }),
    }));

    await expect(barcodeService.generateBarcode("CODE128")).rejects.toThrow(
      "Nao foi possivel gerar um codigo de barras unico"
    );
    sorteio.mockRestore();
  });
});
