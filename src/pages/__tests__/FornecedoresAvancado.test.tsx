import { describe, expect, it, vi } from "vitest";

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

vi.stubGlobal("ResizeObserver", ResizeObserverStub);
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import FornecedoresAvancado from "@/pages/FornecedoresAvancado";
import { toast } from "sonner";

const { mockRecalcular, mockErro, mockSucesso } = vi.hoisted(() => ({
  mockRecalcular: vi.fn(),
  mockErro: vi.fn(),
  mockSucesso: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: Object.assign(vi.fn(), {
    error: mockErro,
    success: mockSucesso,
    warning: vi.fn(),
    info: vi.fn(),
  }),
}));

vi.mock("@/services/fornecedorScoreService", () => ({
  fetchFornecedorScores: () =>
    Promise.resolve([
      {
        id: "1",
        fornecedor: "Alfa",
        total_entregas: 3,
        entregas_conformes: 2,
        entregas_divergentes: 1,
        lead_time_medio_dias: null,
        score: null,
        ultima_entrega: null,
      },
      {
        id: "2",
        fornecedor: "Beta",
        total_entregas: 5,
        entregas_conformes: 5,
        entregas_divergentes: 0,
        lead_time_medio_dias: 1.2,
        score: 97.6,
        ultima_entrega: "2026-02-10",
      },
    ]),
  recalcularFornecedorScores: mockRecalcular,
}));

const renderizar = () => {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <FornecedoresAvancado />
    </QueryClientProvider>
  );
};

describe("FornecedoresAvancado", () => {
  it("mostra travessão em vez de 0% quando o score é desconhecido", async () => {
    renderizar();

    await waitFor(() => expect(screen.getAllByText("Alfa").length).toBeGreaterThan(0));

    expect(screen.getByText("sem entregas")).toBeInTheDocument();
    expect(screen.getAllByText("97.6%").length).toBeGreaterThanOrEqual(1);
    expect(screen.getAllByText("—").length).toBeGreaterThanOrEqual(2);
  });

  it("informa erro real quando o recálculo falha", async () => {
    mockRecalcular.mockRejectedValueOnce(new Error("permissão negada"));
    renderizar();

    await waitFor(() => expect(screen.getAllByText("Alfa").length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("button", { name: /recalcular scores/i }));

    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("permissão negada"));
  });

  it("avisa quando parte dos fornecedores não foi atualizada", async () => {
    mockRecalcular.mockResolvedValueOnce({
      fornecedores: 3,
      atualizados: 2,
      falhas: ["Gama"],
    });
    renderizar();

    await waitFor(() => expect(screen.getAllByText("Alfa").length).toBeGreaterThan(0));
    fireEvent.click(screen.getByRole("button", { name: /recalcular scores/i }));

    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        "2 de 3 fornecedores atualizados. Falhas: Gama"
      )
    );
  });
});
