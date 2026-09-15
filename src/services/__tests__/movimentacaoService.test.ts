import { describe, it, expect, vi, beforeEach } from "vitest";
import { movimentacaoService } from "../movimentacaoService";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() },
}));

vi.mock("@/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

function chain(overrides: Record<string, any> = {}) {
  const base: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    range: vi.fn(),
    ...overrides,
  };
  return base;
}

describe("movimentacaoService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getAll pagina, normaliza campos aninhados e retorna total", async () => {
    const rows = [
      {
        id: "m1",
        tipo_evento: "armazenamento",
        produto_id: "p1",
        produtos: { nome: "Prod" },
        lote_id: "l1",
        lotes: { numero_lote: "L-1" },
        profiles: { nome: "Op" },
        quantidade: 5,
        localizacao: "A1",
        descricao: "ok",
        operador_id: "u1",
        created_at: "2026-01-01",
      },
    ];
    const mock = chain({
      range: vi.fn().mockResolvedValue({ data: rows, error: null, count: 42 }),
    });
    (supabase.from as any).mockReturnValue(mock);
    const out = await movimentacaoService.getAll({ page: 2, pageSize: 10 });
    expect(out.total).toBe(42);
    expect(out.data[0]).toMatchObject({
      id: "m1",
      tipo: "armazenamento",
      produto_nome: "Prod",
      lote_numero: "L-1",
      operador_nome: "Op",
      quantidade: 5,
    });
    expect(mock.range).toHaveBeenCalledWith(10, 19);
  });

  it("getAll lança erro do banco", async () => {
    const mock = chain({
      range: vi.fn().mockResolvedValue({ data: null, error: new Error("db"), count: null }),
    });
    (supabase.from as any).mockReturnValue(mock);
    await expect(movimentacaoService.getAll()).rejects.toThrow("db");
  });

  it("registrar exige lote_id", async () => {
    await expect(
      movimentacaoService.registrar({
        tipo: "armazenamento",
        quantidade: 1,
        operador_id: "u1",
      } as any)
    ).rejects.toThrow(/lote/i);
  });

  it("registrar mapeia transferencia para armazenamento via RPC move_stock", async () => {
    (supabase.rpc as any).mockResolvedValue({ error: null });
    await movimentacaoService.registrar({
      tipo: "transferencia",
      lote_id: "l1",
      from_posicao_id: "a",
      to_posicao_id: "b",
      quantidade: 3,
      descricao: "mov",
      operador_id: "u1",
    } as any);
    expect(supabase.rpc).toHaveBeenCalledWith(
      "move_stock",
      expect.objectContaining({
        p_lote_id: "l1",
        p_from_posicao_id: "a",
        p_to_posicao_id: "b",
        p_quantidade: 3,
        p_tipo_evento: "armazenamento",
        p_operador_id: "u1",
      })
    );
  });

  it("registrar propaga erro da RPC", async () => {
    (supabase.rpc as any).mockResolvedValue({ error: new Error("rpc-fail") });
    await expect(
      movimentacaoService.registrar({
        tipo: "recebimento_nf",
        lote_id: "l1",
        quantidade: 1,
        descricao: "x",
        operador_id: "u1",
      } as any)
    ).rejects.toThrow("rpc-fail");
  });
});
