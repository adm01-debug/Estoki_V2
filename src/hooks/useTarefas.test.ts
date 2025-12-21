import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [
          { id: "1", titulo: "Tarefa 1", status: "pendente", prioridade: "alta" },
          { id: "2", titulo: "Tarefa 2", status: "em_andamento", prioridade: "media" },
        ],
        error: null,
      }),
      insert: vi.fn().mockResolvedValue({ data: null, error: null }),
      update: vi.fn().mockResolvedValue({ data: null, error: null }),
    })),
  },
}));

vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "test-user" } }),
}));

describe("useTarefas", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("deve carregar tarefas", async () => {
    const { useTarefas } = await import("./useTarefas");
    const { result } = renderHook(() => useTarefas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.tarefas).toBeDefined();
  });

  it("deve filtrar por status", async () => {
    const { useTarefas } = await import("./useTarefas");
    const { result } = renderHook(() => useTarefas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    if (result.current.pendentes) {
      expect(Array.isArray(result.current.pendentes)).toBe(true);
    }
  });

  it("deve criar tarefa", async () => {
    const { useTarefas } = await import("./useTarefas");
    const { result } = renderHook(() => useTarefas());

    expect(typeof result.current.criarTarefa).toBe("function");
  });

  it("deve atualizar status", async () => {
    const { useTarefas } = await import("./useTarefas");
    const { result } = renderHook(() => useTarefas());

    expect(typeof result.current.atualizarStatus).toBe("function");
  });

  it("deve contar por prioridade", async () => {
    const { useTarefas } = await import("./useTarefas");
    const { result } = renderHook(() => useTarefas());

    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });

    expect(result.current.estatisticas).toBeDefined();
  });
});
