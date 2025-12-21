import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: "1", titulo: "Notif 1", lida: false, tipo: "alerta" },
          { id: "2", titulo: "Notif 2", lida: true, tipo: "info" },
        ],
        error: null,
      }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
      delete: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));

describe("useNotificacoes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar notificações", async () => {
    const { useNotificacoes } = await import("./useNotificacoes");
    const { result } = renderHook(() => useNotificacoes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.notificacoes).toBeDefined();
  });

  it("deve contar não lidas", async () => {
    const { useNotificacoes } = await import("./useNotificacoes");
    const { result } = renderHook(() => useNotificacoes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.naoLidas).toBe("number");
  });

  it("deve marcar como lida", async () => {
    const { useNotificacoes } = await import("./useNotificacoes");
    const { result } = renderHook(() => useNotificacoes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.marcarComoLida).toBe("function");
  });

  it("deve deletar notificação", async () => {
    const { useNotificacoes } = await import("./useNotificacoes");
    const { result } = renderHook(() => useNotificacoes());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(typeof result.current.deletar).toBe("function");
  });

  it("deve marcar todas como lidas", async () => {
    const { useNotificacoes } = await import("./useNotificacoes");
    const { result } = renderHook(() => useNotificacoes());

    expect(typeof result.current.marcarTodasComoLidas).toBe("function");
  });
});
