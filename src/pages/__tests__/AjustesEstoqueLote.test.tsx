import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AjustesEstoquePage from "@/pages/AjustesEstoque";

// O Radix Select usa a Pointer Events API, que o jsdom nao implementa.
if (!Element.prototype.hasPointerCapture) {
  Element.prototype.hasPointerCapture = () => false;
  Element.prototype.releasePointerCapture = () => {};
  Element.prototype.setPointerCapture = () => {};
}
if (!Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}

const createAdjustment = vi.fn(() => Promise.resolve({}));

const lotes = [
  {
    id: "lote-1",
    numero_lote: "LOTE-A",
    quantidade_atual: 7,
    data_validade: "2027-01-01",
  },
];

vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/layout/PageTransition", () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));
vi.mock("@/components/common/SEO", () => ({ SEO: () => null }));
vi.mock("@/contexts/AuthContext", () => ({
  useAuth: () => ({ user: { id: "user-1" }, role: "admin" }),
}));
vi.mock("@/hooks/useAdjustments", () => ({
  useAdjustments: () => ({
    adjustments: [],
    isLoading: false,
    isError: false,
    refetch: vi.fn(),
    createAdjustment: { mutateAsync: createAdjustment, isPending: false },
    updateStatus: { mutate: vi.fn(), isPending: false },
  }),
}));

vi.mock("@/integrations/supabase/client", () => {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn((coluna: string) =>
    coluna === "produto_id" ? Promise.resolve({ data: lotes, error: null }) : chain
  );
  chain.order = vi.fn(() =>
    Promise.resolve({
      data: [{ id: "prod-1", nome: "Fone", sku: "FONE-1" }],
      error: null,
    })
  );
  return { supabase: { from: vi.fn(() => chain) } };
});

const renderPagina = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <AjustesEstoquePage />
    </QueryClientProvider>
  );
};

describe("AjustesEstoque — lote obrigatorio", () => {
  beforeEach(() => createAdjustment.mockClear());

  it("nao envia ajuste sem lote escolhido", async () => {
    const usuario = userEvent.setup();
    renderPagina();

    await usuario.click(screen.getByRole("button", { name: /novo ajuste/i }));

    const enviar = screen.getByRole("button", { name: /enviar para aprovação/i });
    expect(enviar).toBeDisabled();

    await usuario.click(screen.getByRole("combobox", { name: /produto/i }));
    const opcoes = await screen.findAllByText(/Fone/);
    await usuario.click(opcoes[opcoes.length - 1]);

    // produto escolhido, lote ainda nao: o envio continua bloqueado
    await waitFor(() => expect(enviar).toBeDisabled());
    expect(createAdjustment).not.toHaveBeenCalled();
  });
});
