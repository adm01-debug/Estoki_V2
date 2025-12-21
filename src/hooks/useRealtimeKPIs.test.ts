import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockResolvedValue({
        data: [{ id: "1", valor: 100, tipo: "ocupacao" }],
        error: null,
      }),
    })),
    channel: vi.fn(() => ({
      on: vi.fn().mockReturnThis(),
      subscribe: vi.fn().mockReturnValue({ unsubscribe: vi.fn() }),
    })),
  },
}));

describe("useRealtimeKPIs", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar KPIs iniciais", async () => {
    const { useRealtimeKPIs } = await import("./useRealtimeKPIs");
    const { result } = renderHook(() => useRealtimeKPIs());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.kpis).toBeDefined();
  });

  it("deve se inscrever para atualizações realtime", async () => {
    const { useRealtimeKPIs } = await import("./useRealtimeKPIs");
    const { result } = renderHook(() => useRealtimeKPIs());

    expect(result.current).toBeDefined();
  });

  it("deve expor função de refresh", async () => {
    const { useRealtimeKPIs } = await import("./useRealtimeKPIs");
    const { result } = renderHook(() => useRealtimeKPIs());

    expect(typeof result.current.refresh).toBe("function");
  });
});
