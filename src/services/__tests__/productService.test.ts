import { describe, it, expect, vi, beforeEach } from "vitest";

const mockRange = vi.fn();
const mockEq = vi.fn();
const mockOr = vi.fn();
const mockOrder = vi.fn();
const mockSelect = vi.fn();
const mockFrom = vi.fn();

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: (...args: unknown[]) => mockFrom(...args) },
}));

import { productService } from "@/services/productService";

const montarCadeia = (resultado: Record<string, unknown> = { data: [], count: 0, error: null }) => {
  const cadeia: any = {
    select: mockSelect,
    order: mockOrder,
    eq: mockEq,
    or: mockOr,
    range: mockRange,
  };
  mockFrom.mockReturnValue(cadeia);
  mockSelect.mockReturnValue(cadeia);
  mockOrder.mockReturnValue(cadeia);
  mockEq.mockReturnValue(cadeia);
  mockOr.mockReturnValue(cadeia);
  mockRange.mockResolvedValue(resultado);
  return cadeia;
};

describe("productService.getAll", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("filtra a busca e a curva no banco e pagina com range", async () => {
    montarCadeia({ data: [], count: 120, error: null });

    const resultado = await productService.getAll({
      page: 2,
      pageSize: 50,
      search: "mochila",
      curva: "A",
    });

    expect(mockSelect).toHaveBeenCalledWith("*", { count: "exact" });
    expect(mockOr).toHaveBeenCalledWith("nome.ilike.%mochila%,sku.ilike.%mochila%");
    expect(mockEq).toHaveBeenCalledWith("curva_abc", "A");
    expect(mockRange).toHaveBeenCalledWith(50, 99);
    expect(resultado.total).toBe(120);
  });

  it("nao envia filtros quando a busca e a curva estao vazias", async () => {
    montarCadeia();

    await productService.getAll({ curva: "todos" });

    expect(mockOr).not.toHaveBeenCalled();
    expect(mockEq).not.toHaveBeenCalled();
    expect(mockRange).toHaveBeenCalledWith(0, 99);
  });

  it("remove caracteres que quebram a sintaxe do or do PostgREST", async () => {
    montarCadeia();

    await productService.getAll({ search: "café, (500ml)" });

    expect(mockOr).toHaveBeenCalledWith("nome.ilike.%café 500ml%,sku.ilike.%café 500ml%");
  });
});

describe("productService.contarPorCurva", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("conta o total e cada curva no banco", async () => {
    const contagens: Record<string, number> = { total: 16, A: 6, B: 5, C: 5 };
    mockFrom.mockImplementation(() => {
      const estado = { curva: "total" };
      const cadeia: any = {
        select: () => cadeia,
        eq: (coluna: string, valor: string) => {
          expect(coluna).toBe("curva_abc");
          expect(["A", "B", "C"]).toContain(valor);
          estado.curva = valor;
          return cadeia;
        },
        then: (res: any) => res({ count: contagens[estado.curva], error: null }),
      };
      return cadeia;
    });

    const resultado = await productService.contarPorCurva();

    expect(resultado).toEqual({ total: 16, A: 6, B: 5, C: 5 });
  });

  it("propaga erro de contagem", async () => {
    mockFrom.mockImplementation(() => {
      const cadeia: any = {
        select: () => cadeia,
        eq: () => cadeia,
        then: (res: any) => res({ count: null, error: { message: "rls" } }),
      };
      return cadeia;
    });

    await expect(productService.contarPorCurva()).rejects.toMatchObject({ message: "rls" });
  });
});
