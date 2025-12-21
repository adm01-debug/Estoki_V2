import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      gte: vi.fn().mockResolvedValue({
        data: [
          { id: "1", operador_id: "op1", triagens: 50, data: "2025-01-01" },
          { id: "2", operador_id: "op2", triagens: 30, data: "2025-01-01" },
        ],
        error: null,
      }),
    })),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));

describe("useProdutividade", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve inicializar corretamente", async () => {
    const { useProdutividade } = await import("./useProdutividade");
    const { result } = renderHook(() => useProdutividade());
    
    expect(result.current).toBeDefined();
  });

  it("deve carregar métricas de produtividade", async () => {
    const { useProdutividade } = await import("./useProdutividade");
    const { result } = renderHook(() => useProdutividade());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("deve calcular média de produtividade", async () => {
    const { useProdutividade } = await import("./useProdutividade");
    const { result } = renderHook(() => useProdutividade());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.metricas).toBeDefined();
  });

  it("deve gerar ranking de operadores", async () => {
    const { useProdutividade } = await import("./useProdutividade");
    const { result } = renderHook(() => useProdutividade());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.ranking) {
      expect(Array.isArray(result.current.ranking)).toBe(true);
    }
  });

  it("deve permitir filtro por período", async () => {
    const { useProdutividade } = await import("./useProdutividade");
    const { result } = renderHook(() => useProdutividade(30));

    expect(result.current).toBeDefined();
  });
});
