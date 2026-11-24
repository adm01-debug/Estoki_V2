import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CategoriesPage from "../CategoriesPage";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: vi.fn() } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// UPDATE barrado pela RLS afeta 0 linhas sem erro: a tela não pode dizer "desativada".
describe("CategoriesPage — desativação bloqueada pela RLS", () => {
  const linhasAfetadas = vi.fn();
  const updateMock = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "c1",
              nome: "Brindes",
              descricao: null,
              cor: "#000",
              icone: "Tag",
              ativo: true,
            },
          ],
          error: null,
        }),
      }),
      update: vi.fn().mockImplementation((payload: Record<string, unknown>) => {
        updateMock(payload);
        return { eq: vi.fn().mockReturnValue({ select: linhasAfetadas }) };
      }),
    } as never);
  });

  function renderPage() {
    const qc = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    render(
      <QueryClientProvider client={qc}>
        <CategoriesPage />
      </QueryClientProvider>
    );
  }

  async function clicarDesativar() {
    await screen.findByText("Brindes");
    fireEvent.click(screen.getByLabelText("Desativar Brindes"));
    fireEvent.click(await screen.findByRole("button", { name: "Desativar" }));
  }

  it("0 linhas afetadas mostra erro de permissão, não sucesso", async () => {
    linhasAfetadas.mockResolvedValue({ data: [], error: null });
    renderPage();
    await clicarDesativar();
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Sem permissão para desativar a categoria")
      )
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("1 linha afetada mostra sucesso e desativa em vez de apagar", async () => {
    linhasAfetadas.mockResolvedValue({ data: [{ id: "c1" }], error: null });
    renderPage();
    await clicarDesativar();
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
    expect(updateMock).toHaveBeenCalledWith({ ativo: false });
    expect(toast.error).not.toHaveBeenCalled();
  });
});
