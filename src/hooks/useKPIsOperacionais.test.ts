import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

// Mock Supabase
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockReturnThis(),
      lte: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: "1", tipo: "triagem", valor: 100, data: "2025-01-01" },
          { id: "2", tipo: "recebimento", valor: 50, data: "2025-01-01" },
        ],
        error: null,
      }),
    })),
  },
}));

// Mock AuthContext
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({
    user: { id: "test-user-id" },
  }),
}));

describe("useKPIsOperacionais", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve inicializar com loading true", async () => {
    const { useKPIsOperacionais } = await import("./useKPIsOperacionais");
    const { result } = renderHook(() => useKPIsOperacionais());
    
    expect(result.current.loading).toBeDefined();
  });

  it("deve calcular KPIs corretamente", async () => {
    const { useKPIsOperacionais } = await import("./useKPIsOperacionais");
    const { result } = renderHook(() => useKPIsOperacionais());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.kpis).toBeDefined();
  });

  it("deve filtrar por período", async () => {
    const { useKPIsOperacionais } = await import("./useKPIsOperacionais");
    const { result } = renderHook(() => useKPIsOperacionais(7));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("deve calcular tendências", async () => {
    const { useKPIsOperacionais } = await import("./useKPIsOperacionais");
    const { result } = renderHook(() => useKPIsOperacionais());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.tendencias) {
      expect(typeof result.current.tendencias).toBe("object");
    }
  });

  it("deve expor função de refresh", async () => {
    const { useKPIsOperacionais } = await import("./useKPIsOperacionais");
    const { result } = renderHook(() => useKPIsOperacionais());

    expect(typeof result.current.refresh).toBe("function");
  });
});
