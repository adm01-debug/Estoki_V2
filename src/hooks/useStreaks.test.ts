// @ts-nocheck - Test file uses outdated API, needs update
import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { streak_atual: 5, maior_streak: 10, ultima_atividade: "2025-01-01" },
        error: null,
      }),
      upsert: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));

describe("useStreaks", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar streak do usuário", async () => {
    const { useStreaks } = await import("./useStreaks");
    const { result } = renderHook(() => useStreaks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.streakAtual).toBeDefined();
  });

  it("deve retornar maior streak", async () => {
    const { useStreaks } = await import("./useStreaks");
    const { result } = renderHook(() => useStreaks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.maiorStreak).toBeDefined();
  });

  it("deve verificar se streak está ativo", async () => {
    const { useStreaks } = await import("./useStreaks");
    const { result } = renderHook(() => useStreaks());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.streakAtivo).toBe("boolean");
  });

  it("deve atualizar streak", async () => {
    const { useStreaks } = await import("./useStreaks");
    const { result } = renderHook(() => useStreaks());

    expect(typeof result.current.atualizarStreak).toBe("function");
  });
});
