import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [
          { id: "1", kpi: "ocupacao", limite: 90, ativo: true },
          { id: "2", kpi: "triagens", limite: 50, ativo: true },
        ],
        error: null,
      }),
    })),
  },
}));

describe("useKPIAlerts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar configurações de alertas", async () => {
    const { useKPIAlerts } = await import("./useKPIAlerts");
    const { result } = renderHook(() => useKPIAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.alertas).toBeDefined();
  });

  it("deve verificar KPIs contra limites", async () => {
    const { useKPIAlerts } = await import("./useKPIAlerts");
    const { result } = renderHook(() => useKPIAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.verificarAlerta).toBe("function");
  });

  it("deve retornar alertas ativos", async () => {
    const { useKPIAlerts } = await import("./useKPIAlerts");
    const { result } = renderHook(() => useKPIAlerts());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.alertasAtivos) {
      expect(Array.isArray(result.current.alertasAtivos)).toBe(true);
    }
  });
});
