import { describe, it, expect, vi, beforeEach } from "vitest";
import { receivingService } from "../receivingService";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

vi.mock("@/features/receiving/utils/receivingUtils", () => ({
  handleReceivingError: (err: unknown, ctx: string) =>
    new Error(`[${ctx}] ${err instanceof Error ? err.message : String(err)}`),
}));

function chain(overrides: Record<string, any> = {}) {
  const base: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
    ...overrides,
  };
  return base;
}

describe("receivingService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getRecebimentos retorna lista ordenada", async () => {
    const mock = chain({
      order: vi.fn().mockResolvedValue({ data: [{ id: "r1" }], error: null }),
    });
    (supabase.from as any).mockReturnValue(mock);
    const rows = await receivingService.getRecebimentos();
    expect(rows).toHaveLength(1);
    expect(mock.order).toHaveBeenCalledWith("created_at", { ascending: false });
  });

  it("getRecebimentos propaga erro via handleReceivingError", async () => {
    const mock = chain({
      order: vi.fn().mockResolvedValue({ data: null, error: new Error("db-fail") }),
    });
    (supabase.from as any).mockReturnValue(mock);
    await expect(receivingService.getRecebimentos()).rejects.toThrow(/db-fail/);
  });

  it("createRecebimento aplica defaults obrigatórios", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "r2", numero_lote: "L1" },
      error: null,
    });
    const mock = chain({ single });
    (supabase.from as any).mockReturnValue(mock);
    const out = await receivingService.createRecebimento({ numero_lote: "L1", produto_id: "p1" });
    expect(out.id).toBe("r2");
    expect(mock.insert).toHaveBeenCalledWith(
      expect.objectContaining({
        numero_lote: "L1",
        produto_id: "p1",
        quantidade_inicial: 0,
        quantidade_atual: 0,
        status: "aguardando",
      })
    );
  });

  it("updateRecebimento envia patch e retorna registro", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "r3", status: "conferido" },
      error: null,
    });
    const mock = chain({ single });
    (supabase.from as any).mockReturnValue(mock);
    const out = await receivingService.updateRecebimento("r3", { status: "conferido" } as any);
    expect(out.status).toBe("conferido");
    expect(mock.update).toHaveBeenCalledWith({ status: "conferido" });
    expect(mock.eq).toHaveBeenCalledWith("id", "r3");
  });
});
