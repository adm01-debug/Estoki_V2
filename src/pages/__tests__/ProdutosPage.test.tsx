import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import Produtos from "../Produtos";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import * as useProdutosHook from "@/hooks/useProdutos";
import "@testing-library/jest-dom";

vi.mock("@/hooks/useProdutos", () => ({
  useProdutos: vi.fn(),
}));

vi.mock("@/hooks/useAuditLog", () => ({
  useAuditLog: () => ({ log: { custom: vi.fn() } }),
}));

vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children, title, rightAction }: any) => (
    <div data-testid="app-layout">
      <h1>{title}</h1>
      {rightAction}
      {children}
    </div>
  ),
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const produtoMock = {
  id: "1",
  nome: "Produto Real",
  sku: "REAL1",
  unidade: "UN",
  curva_abc: "A",
  estoque_minimo: 0,
  estoque_maximo: null,
  fornecedor_principal: null,
  created_at: new Date().toISOString(),
};

const montarHook = (overrides: Record<string, unknown> = {}) => {
  (useProdutosHook.useProdutos as any).mockReturnValue({
    produtos: [produtoMock],
    total: 1,
    page: 1,
    pageCount: 1,
    loading: false,
    isFetching: false,
    error: null,
    refetch: vi.fn(),
    stats: { total: 1, curvaA: 1, curvaB: 0, curvaC: 0 },
    createProduto: { isPending: false, mutateAsync: vi.fn() },
    updateProduto: { isPending: false, mutateAsync: vi.fn() },
    ...overrides,
  });
};

const renderizar = () =>
  render(
    <QueryClientProvider client={queryClient}>
      <HelmetProvider>
        <BrowserRouter>
          <Produtos />
        </BrowserRouter>
      </HelmetProvider>
    </QueryClientProvider>
  );

const ultimaChamada = () => {
  // BulkImportDialog tambem chama useProdutos() sem opcoes; aqui interessa a pagina.
  const chamadas = ((useProdutosHook.useProdutos as any).mock.calls as any[][]).filter(
    (chamada) => chamada[0]
  );
  return chamadas[chamadas.length - 1][0];
};

describe("ProdutosPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should display skeletons during search transition", async () => {
    montarHook();
    renderizar();

    const searchInput = screen.getByPlaceholderText(/Buscar por nome ou SKU/i);

    expect(screen.getByTestId("product-grid-results")).toBeInTheDocument();
    expect(screen.getByText("Produto Real")).toBeInTheDocument();

    fireEvent.change(searchInput, { target: { value: "novo termo" } });

    await waitFor(() => {
      expect(screen.getByTestId("product-grid-loading")).toBeInTheDocument();
    });

    await waitFor(
      () => {
        expect(screen.queryByTestId("product-grid-loading")).not.toBeInTheDocument();
      },
      { timeout: 1500 }
    );
  });

  it("envia a busca para o servidor usando o valor com debounce", async () => {
    montarHook();
    renderizar();

    const searchInput = screen.getByPlaceholderText(/Buscar por nome ou SKU/i);
    fireEvent.change(searchInput, { target: { value: "m" } });
    fireEvent.change(searchInput, { target: { value: "mochila" } });

    await waitFor(
      () => {
        expect(ultimaChamada()).toMatchObject({ search: "mochila", page: 1 });
      },
      { timeout: 1500 }
    );

    const buscas = ((useProdutosHook.useProdutos as any).mock.calls as any[][])
      .filter((chamada) => chamada[0])
      .map((chamada) => chamada[0].search);
    expect(buscas).not.toContain("m");
  });

  it("mostra o recorte da pagina e avanca para a proxima pagina", () => {
    montarHook({ total: 120 });
    renderizar();

    expect(screen.getByTestId("produtos-contagem")).toHaveTextContent("Mostrando 1–50 de 120");

    fireEvent.click(screen.getByRole("button", { name: "Próxima" }));

    expect(ultimaChamada()).toMatchObject({ page: 2, pageSize: 50 });
    expect(screen.getByTestId("produtos-contagem")).toHaveTextContent("Mostrando 51–100 de 120");
  });

  it("mantem o botao de proxima desabilitado na ultima pagina", () => {
    montarHook({ total: 10 });
    renderizar();

    expect(screen.getByRole("button", { name: "Próxima" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Anterior" })).toBeDisabled();
    expect(screen.getByTestId("produtos-contagem")).toHaveTextContent("Mostrando 1–10 de 10");
  });

  it("oferece nova tentativa quando a listagem falha", () => {
    const refetch = vi.fn();
    montarHook({ error: new Error("boom"), produtos: [], total: 0, refetch });
    renderizar();

    expect(screen.getByText(/Não foi possível carregar os produtos/)).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: "Tentar novamente" }));
    expect(refetch).toHaveBeenCalled();
  });
});
