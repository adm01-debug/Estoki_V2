import { describe, it, expect, vi, beforeEach } from "vitest";
import { stockService } from "../stockService";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

function chain(overrides: Record<string, any> = {}) {
  const base: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    gte: vi.fn().mockReturnThis(),
    lte: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
    ...overrides,
  };
  return base;
}

describe("stockService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getMovements retorna lista", async () => {
    const mock = chain({
      order: vi.fn().mockResolvedValue({ data: [{ id: "1" }], error: null }),
    });
    (supabase.from as any).mockReturnValue(mock);
    const rows = await stockService.getMovements();
    expect(rows).toHaveLength(1);
  });

  it("getMovements lança erro do banco", async () => {
    const mock = chain({
      order: vi.fn().mockResolvedValue({ data: null, error: new Error("db") }),
    });
    (supabase.from as any).mockReturnValue(mock);
    await expect(stockService.getMovements()).rejects.toThrow("db");
  });

  it("createMovement recusa estoque negativo", async () => {
    const productMock = chain({
      single: vi.fn().mockResolvedValue({ data: { stock_quantity: 2 }, error: null }),
    });
    (supabase.from as any).mockReturnValueOnce(productMock);
    await expect(
      stockService.createMovement({
        product_id: "p1",
        type: "OUT",
        quantity: 10,
        user_id: "u1",
      } as any),
    ).rejects.toThrow("Estoque insuficiente");
  });

  it("createMovement grava com previous_qty/new_qty corretos", async () => {
    const productMock = chain({
      single: vi.fn().mockResolvedValue({ data: { stock_quantity: 5 }, error: null }),
    });
    const updateMock = chain();
    const insertSingle = vi.fn().mockResolvedValue({
      data: { id: "m1", previous_qty: 5, new_qty: 8 },
      error: null,
    });
    const insertMock = chain({ single: insertSingle });
    (supabase.from as any)
      .mockReturnValueOnce(productMock)
      .mockReturnValueOnce(updateMock)
      .mockReturnValueOnce(insertMock);

    const result = await stockService.createMovement({
      product_id: "p1",
      type: "IN",
      quantity: 3,
      user_id: "u1",
    } as any);
    expect(result.new_qty).toBe(8);
    expect(insertMock.insert).toHaveBeenCalledWith(
      expect.objectContaining({ previous_qty: 5, new_qty: 8 }),
    );
  });
});