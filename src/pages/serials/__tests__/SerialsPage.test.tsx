import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import SerialsPage from "../SerialsPage";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

// A coluna do número de série é `codigo`: ordenar por `numero_serial` (que não existe)
// fazia o PostgREST responder 400 e a tela nunca listava nada.
describe("SerialsPage", () => {
  const order = vi.fn();
  beforeEach(() => {
    order.mockResolvedValue({
      data: [
        {
          id: "1",
          codigo: "SN-001",
          produto_id: null,
          lote_id: null,
          status: "disponivel",
          produtos: { nome: "Caneta" },
        },
        {
          id: "2",
          codigo: "SN-002",
          produto_id: null,
          lote_id: null,
          status: "expedido",
          produtos: null,
        },
      ],
      error: null,
    });
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({ order }),
    } as never);
  });

  function renderPage() {
    const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return render(
      <QueryClientProvider client={qc}>
        <SerialsPage />
      </QueryClientProvider>
    );
  }

  it("consulta serial_numbers ordenando pela coluna real `codigo`", async () => {
    renderPage();
    expect(await screen.findByText("SN-001")).toBeInTheDocument();
    expect(supabase.from).toHaveBeenCalledWith("serial_numbers");
    expect(order).toHaveBeenCalledWith("codigo");
  });

  it("busca filtra pelo código e pelo nome do produto", async () => {
    renderPage();
    await screen.findByText("SN-001");
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "caneta" } });
    expect(screen.getByText("SN-001")).toBeInTheDocument();
    expect(screen.queryByText("SN-002")).not.toBeInTheDocument();
    fireEvent.change(screen.getByRole("textbox"), { target: { value: "sn-002" } });
    expect(screen.getByText("SN-002")).toBeInTheDocument();
  });
});
