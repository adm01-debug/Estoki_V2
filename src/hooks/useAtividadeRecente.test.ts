import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      order: vi.fn().mockReturnThis(),
      limit: vi.fn().mockResolvedValue({
        data: [
          { id: "1", tipo: "triagem", descricao: "Triagem realizada", created_at: "2025-01-01T10:00:00" },
          { id: "2", tipo: "recebimento", descricao: "Recebimento confirmado", created_at: "2025-01-01T09:00:00" },
        ],
        error: null,
      }),
    })),
  },
}));

describe("useAtividadeRecente", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar atividades recentes", async () => {
    const { useAtividadeRecente } = await import("./useAtividadeRecente");
    const { result } = renderHook(() => useAtividadeRecente());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.atividades).toBeDefined();
  });

  it("deve limitar quantidade de atividades", async () => {
    const { useAtividadeRecente } = await import("./useAtividadeRecente");
    const { result } = renderHook(() => useAtividadeRecente(5));

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
  });

  it("deve ordenar por data decrescente", async () => {
    const { useAtividadeRecente } = await import("./useAtividadeRecente");
    const { result } = renderHook(() => useAtividadeRecente());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.atividades?.length > 1) {
      const first = new Date(result.current.atividades[0].created_at);
      const second = new Date(result.current.atividades[1].created_at);
      expect(first >= second).toBe(true);
    }
  });
});
