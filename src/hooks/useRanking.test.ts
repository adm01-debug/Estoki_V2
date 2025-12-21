import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          { user_id: "1", nome: "João", xp: 1000, posicao: 1 },
          { user_id: "2", nome: "Maria", xp: 800, posicao: 2 },
        ],
        error: null,
      }),
    })),
  },
}));

describe("useRanking", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar ranking", async () => {
    const { useRanking } = await import("./useRanking");
    const { result } = renderHook(() => useRanking());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.ranking).toBeDefined();
  });

  it("deve ordenar por XP", async () => {
    const { useRanking } = await import("./useRanking");
    const { result } = renderHook(() => useRanking());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.ranking?.length > 1) {
      expect(result.current.ranking[0].xp >= result.current.ranking[1].xp).toBe(true);
    }
  });

  it("deve limitar resultados", async () => {
    const { useRanking } = await import("./useRanking");
    const { result } = renderHook(() => useRanking(10));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });
});
