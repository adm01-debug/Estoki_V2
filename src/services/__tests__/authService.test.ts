import { describe, it, expect, vi, beforeEach } from "vitest";
import { authService } from "../authService";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

function roleChain(overrides: Record<string, unknown> = {}) {
  const base: any = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    ...overrides,
  };
  return base;
}

describe("authService.getRole fail-closed", () => {
  beforeEach(() => vi.clearAllMocks());

  it("retorna null quando o banco falha (nao libera operador)", async () => {
    const mock = roleChain({
      maybeSingle: vi.fn().mockResolvedValue({
        data: null,
        error: new Error("db indisponivel"),
      }),
    });
    (supabase.from as any).mockReturnValue(mock);
    await expect(authService.getRole("user-1")).resolves.toBeNull();
  });

  it("retorna null quando usuario nao tem role cadastrada", async () => {
    const mock = roleChain({
      maybeSingle: vi.fn().mockResolvedValue({ data: null, error: null }),
    });
    (supabase.from as any).mockReturnValue(mock);
    await expect(authService.getRole("user-1")).resolves.toBeNull();
  });

  it("retorna role legitima quando existe", async () => {
    const mock = roleChain({
      maybeSingle: vi.fn().mockResolvedValue({ data: { role: "admin" }, error: null }),
    });
    (supabase.from as any).mockReturnValue(mock);
    await expect(authService.getRole("user-1")).resolves.toBe("admin");
  });
});
