import { describe, it, expect, vi, beforeEach } from "vitest";
import { qualityService } from "../qualityService";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

vi.mock("@/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
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

describe("qualityService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getAll retorna lista", async () => {
    const mock = chain({
      order: vi.fn().mockResolvedValue({ data: [{ id: "t1" }], error: null }),
    });
    (supabase.from as any).mockReturnValue(mock);
    const rows = await qualityService.getAll();
    expect(rows).toHaveLength(1);
  });

  it("getAll lança erro do banco", async () => {
    const mock = chain({
      order: vi.fn().mockResolvedValue({ data: null, error: new Error("boom") }),
    });
    (supabase.from as any).mockReturnValue(mock);
    await expect(qualityService.getAll()).rejects.toThrow("boom");
  });

  it("create injeta data_inicio ISO", async () => {
    const single = vi.fn().mockResolvedValue({ data: { id: "n1" }, error: null });
    const mock = chain({ single });
    (supabase.from as any).mockReturnValue(mock);
    await qualityService.create({ lote_id: "l1", operador_id: "u1" });
    const payload = (mock.insert as any).mock.calls[0][0];
    expect(payload.lote_id).toBe("l1");
    expect(payload.operador_id).toBe("u1");
    expect(typeof payload.data_inicio).toBe("string");
    expect(() => new Date(payload.data_inicio)).not.toThrow();
  });

  it("finalize envia resultado + data_fim", async () => {
    const single = vi.fn().mockResolvedValue({
      data: { id: "n2", resultado: "aprovado" },
      error: null,
    });
    const mock = chain({ single });
    (supabase.from as any).mockReturnValue(mock);
    const out = await qualityService.finalize("n2", { resultado: "aprovado" });
    expect(out.resultado).toBe("aprovado");
    const payload = (mock.update as any).mock.calls[0][0];
    expect(payload.resultado).toBe("aprovado");
    expect(payload.data_fim).toBeTruthy();
  });
});
