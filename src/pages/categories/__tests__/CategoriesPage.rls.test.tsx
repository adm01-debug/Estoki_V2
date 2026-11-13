import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import CategoriesPage from "../CategoriesPage";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: vi.fn() } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

// DELETE bloqueado pela RLS afeta 0 linhas sem erro: a tela não pode dizer "removida".
describe("CategoriesPage — remoção bloqueada pela RLS", () => {
  const linhasAfetadas = vi.fn();
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, "confirm").mockReturnValue(true);
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnValue({
        order: vi.fn().mockResolvedValue({
          data: [
            {
              id: "c1",
              codigo: "C1",
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
      delete: vi.fn().mockReturnValue({
        eq: vi.fn().mockReturnValue({ select: linhasAfetadas }),
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

  async function clicarRemover() {
    await screen.findByText("Brindes");
    const lixeira = document
      .querySelector("svg.lucide-trash2, svg.lucide-trash-2")
      ?.closest("button");
    expect(lixeira).toBeTruthy();
    fireEvent.click(lixeira!);
  }

  it("0 linhas afetadas mostra erro de permissão, não sucesso", async () => {
    linhasAfetadas.mockResolvedValue({ data: [], error: null });
    renderPage();
    await clicarRemover();
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(
        expect.stringContaining("Sem permissão para remover a categoria")
      )
    );
    expect(toast.success).not.toHaveBeenCalled();
  });

  it("1 linha afetada mostra sucesso", async () => {
    linhasAfetadas.mockResolvedValue({ data: [{ id: "c1" }], error: null });
    renderPage();
    await clicarRemover();
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Categoria removida"));
    expect(toast.error).not.toHaveBeenCalled();
  });
});
