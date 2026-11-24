import { describe, it, expect, vi, beforeEach } from "vitest";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import OrdersPage from "../OrdersPage";

const mockGetAll = vi.fn();
const mockUpdateStatus = vi.fn();
const mockCreate = vi.fn();

vi.mock("@/services/orderService", () => ({
  orderService: {
    getAll: (...args: unknown[]) => mockGetAll(...args),
    updateStatus: (...args: unknown[]) => mockUpdateStatus(...args),
    create: (...args: unknown[]) => mockCreate(...args),
  },
}));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

const mockToastError = vi.fn();
const mockToastSuccess = vi.fn();
vi.mock("sonner", () => ({
  toast: {
    error: (...args: unknown[]) => mockToastError(...args),
    success: (...a: unknown[]) => mockToastSuccess(...a),
  },
}));

vi.mock("@/components/layout/AppLayout", () => ({
  AppLayout: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

vi.mock("@/components/layout/PageTransition", () => ({
  PageTransition: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
}));

const PEDIDOS = [
  {
    id: "ped-1",
    codigo: "PED-001",
    cliente_nome: "Mercado Central",
    status: "pendente",
    prioridade: 1,
    created_at: "2026-11-20T10:00:00Z",
    data_prometida: null,
    observacoes: null,
    itens: [{ id: "i1", produto_id: "prod-1", quantidade: 3, quantidade_atendida: 0 }],
  },
  {
    id: "ped-2",
    codigo: "PED-002",
    cliente_nome: "Atacado Silva",
    status: "enviado",
    prioridade: 2,
    created_at: "2026-11-21T10:00:00Z",
    data_prometida: null,
    observacoes: null,
    itens: [],
  },
];

function renderPagina() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <OrdersPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

function arrastar(itemId: string, colunaId: string) {
  const item = screen.getByTestId(`kanban-item-${itemId}`);
  const coluna = screen.getByTestId(`kanban-coluna-${colunaId}`);
  const dataTransfer = { setData: vi.fn(), getData: () => itemId };
  fireEvent.dragStart(item, { dataTransfer });
  fireEvent.dragOver(coluna, { dataTransfer });
  fireEvent.drop(coluna, { dataTransfer });
}

describe("OrdersPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetAll.mockResolvedValue({
      data: PEDIDOS,
      total: 2,
      page: 1,
      pageSize: 500,
      totalPages: 1,
    });
    mockUpdateStatus.mockResolvedValue({ id: "ped-1" });
    mockCreate.mockResolvedValue({ id: "ped-novo" });
  });

  it("carrega os pedidos do serviço e mostra a contagem real", async () => {
    renderPagina();

    expect(await screen.findByText("PED-001")).toBeInTheDocument();
    expect(screen.getByText("PED-002")).toBeInTheDocument();
    expect(screen.getByText("Mostrando 2 de 2 pedidos.")).toBeInTheDocument();
    expect(mockGetAll).toHaveBeenCalledWith({ pageSize: 500 });
  });

  it("mostra o pedido cancelado no board em vez de escondê-lo", async () => {
    mockGetAll.mockResolvedValue({
      data: [{ ...PEDIDOS[0], status: "cancelado" }],
      total: 1,
      page: 1,
      pageSize: 500,
      totalPages: 1,
    });

    renderPagina();

    expect(await screen.findByText("Cancelado")).toBeInTheDocument();
    expect(screen.getByTestId("kanban-item-ped-1")).toBeInTheDocument();
  });

  it("arrastar para uma coluna válida grava o novo status", async () => {
    renderPagina();
    await screen.findByText("PED-001");

    arrastar("ped-1", "em_separacao");

    await waitFor(() => expect(mockUpdateStatus).toHaveBeenCalledWith("ped-1", "em_separacao"));
  });

  it("bloqueia transição inválida e avisa o usuário", async () => {
    renderPagina();
    await screen.findByText("PED-002");

    arrastar("ped-2", "pendente");

    expect(mockUpdateStatus).not.toHaveBeenCalled();
    expect(mockToastError).toHaveBeenCalledWith("Transição não permitida: Enviado → Pendente");
  });

  it("mostra estado de erro com opção de tentar de novo", async () => {
    mockGetAll.mockRejectedValue(new Error("sem permissão de leitura"));

    renderPagina();

    expect(await screen.findByText("sem permissão de leitura")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });

  it("não cria pedido com dados inválidos", async () => {
    renderPagina();
    await screen.findByText("PED-001");

    fireEvent.click(screen.getByRole("button", { name: /novo pedido/i }));
    fireEvent.click(await screen.findByRole("button", { name: /criar pedido/i }));

    await waitFor(() => expect(mockToastError).toHaveBeenCalledWith("Informe o código do pedido"));
    expect(mockCreate).not.toHaveBeenCalled();
  });
});
