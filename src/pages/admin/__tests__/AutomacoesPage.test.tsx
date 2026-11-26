import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { HelmetProvider } from "react-helmet-async";
import { beforeEach, describe, expect, it, vi } from "vitest";
import AutomacoesPage from "@/pages/admin/AutomacoesPage";

const updateMock = vi.fn();

const logs = [
  {
    id: "log-1",
    integration: "sap_b1",
    action: "get_items",
    request: { action: "get_items" },
    response: { value: [] },
    status: null,
    created_at: new Date().toISOString(),
  },
  {
    id: "log-2",
    integration: "totvs_protheus",
    action: "get_products",
    request: { action: "get_products" },
    response: { error: "timeout" },
    status: null,
    created_at: new Date().toISOString(),
  },
];

const sugestoes = [
  {
    id: "sug-1",
    product_name: "Fone Bluetooth",
    sku: "FONE-001",
    current_stock: 2,
    reorder_point: 10,
    suggested_quantity: 40,
    supplier_name: "Fornecedor A",
    estimated_delivery: "2026-12-01",
    status: "pending",
    created_at: new Date().toISOString(),
  },
  {
    id: "sug-2",
    product_name: "Cabo USB-C",
    sku: "CABO-002",
    current_stock: 0,
    reorder_point: 5,
    suggested_quantity: 20,
    supplier_name: null,
    estimated_delivery: null,
    status: "approved",
    created_at: new Date().toISOString(),
  },
];

const saude = {
  crons: [
    {
      jobid: 35,
      jobname: "produtos-sync-catalogo",
      schedule: "*/30 * * * *",
      ultima_execucao: new Date().toISOString(),
      ultimo_status: "succeeded",
      falhas_48h: 0,
    },
    {
      jobid: 39,
      jobname: "dashboard-mv-refresh",
      schedule: "20 7 * * *",
      ultima_execucao: null,
      ultimo_status: "failed",
      falhas_48h: 3,
    },
  ],
  catalogo: {
    produtos: 20814,
    cursor_ate: "2026-11-26T09:51:00Z",
    cursor_sku: "SKU-999",
    ultima_execucao: new Date().toISOString(),
    ultima_duracao_ms: 1838,
    ultimo_resultado: { modo: "incremental", replicados: 0 },
  },
  gerado_em: new Date().toISOString(),
};

const tabela = (nome: string) => {
  const resultado = {
    data: nome === "integration_logs" ? logs : nome === "reorder_suggestions" ? sugestoes : [],
    error: null,
  };
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.order = vi.fn(() => chain);
  chain.gte = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.limit = vi.fn(() => Promise.resolve(resultado));
  chain.update = updateMock.mockImplementation(() => ({
    eq: vi.fn(() => Promise.resolve({ data: null, error: null })),
  }));
  return chain;
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((nome: string) => tabela(nome)),
    rpc: vi.fn(() => Promise.resolve({ data: saude, error: null })),
  },
}));

const renderPagina = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <AutomacoesPage />
      </QueryClientProvider>
    </HelmetProvider>
  );
};

describe("AutomacoesPage", () => {
  beforeEach(() => {
    updateMock.mockClear();
  });

  it("mostra os totais de execucoes, falhas e sugestoes pendentes", async () => {
    renderPagina();

    const valor = (rotulo: string) =>
      screen.getAllByText(rotulo)[0].parentElement?.textContent ?? "";

    await waitFor(() => expect(screen.getAllByText("SAP Business One").length).toBeGreaterThan(0));
    expect(valor("Execuções registradas")).toContain("2");
    expect(valor("Execuções com erro")).toContain("1");
    expect(valor("Sugestões pendentes")).toContain("1");
    expect(screen.getByText("TOTVS Protheus")).toBeInTheDocument();
  });

  it("mostra a saude dos jobs de cron e do catalogo replicado", async () => {
    renderPagina();

    await waitFor(() => expect(screen.getByText("Saúde da sincronização")).toBeInTheDocument());
    expect(await screen.findByText("20.814")).toBeInTheDocument();
    expect(screen.getByText("produtos-sync-catalogo")).toBeInTheDocument();
    expect(screen.getByText("dashboard-mv-refresh")).toBeInTheDocument();
    expect(screen.getByText("1 job(s) com falha")).toBeInTheDocument();
    expect(screen.getByText("Falhas nas últimas 48h")).toBeInTheDocument();
  });

  it("aprova uma sugestao de reposicao", async () => {
    const usuario = userEvent.setup();
    renderPagina();

    await waitFor(() => expect(screen.getAllByText("Fone Bluetooth").length).toBeGreaterThan(0));
    await usuario.click(screen.getAllByRole("button", { name: "Aprovar" })[0]);

    await waitFor(() =>
      expect(updateMock).toHaveBeenCalledWith(expect.objectContaining({ status: "approved" }))
    );
  });
});
