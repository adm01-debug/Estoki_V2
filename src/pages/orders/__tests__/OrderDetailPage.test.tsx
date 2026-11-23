import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { orderService } from "@/services/orderService";
import OrderDetailPage from "../OrderDetailPage";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));
vi.mock("@/services/orderService", () => ({
  orderService: { getById: vi.fn() },
}));

const PEDIDO = {
  id: "ped-1",
  codigo: "PED-2025001",
  status: "pendente",
  prioridade: 2,
  cliente_id: null,
  cliente_nome: "Maria Comercio Ltda",
  data_prometida: "2026-08-13",
  observacoes: "Pedido prioritário",
  warehouse_id: "arm-1",
  created_at: "2026-08-12T15:54:56.396951+00:00",
  updated_at: "2026-11-22T12:56:08.103716+00:00",
  itens: [],
};

function renderPagina(id = "ped-1") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/pedidos/${id}`]}>
        <Routes>
          <Route path="/pedidos/:id" element={<OrderDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("OrderDetailPage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    const armazem = {
      select: () => armazem,
      eq: () => armazem,
      maybeSingle: () =>
        Promise.resolve({
          data: { id: "arm-1", nome: "CD São Paulo", codigo: "ARM-01" },
          error: null,
        }),
    };
    vi.mocked(supabase.from).mockReturnValue(armazem as never);
  });

  it("mostra o pedido, o armazém vinculado e o vazio de itens", async () => {
    vi.mocked(orderService.getById).mockResolvedValue(PEDIDO as never);

    renderPagina();

    expect(await screen.findByText("PED-2025001")).toBeInTheDocument();
    expect(screen.getByText("Pendente")).toBeInTheDocument();
    expect(screen.getByText("Maria Comercio Ltda")).toBeInTheDocument();
    expect(await screen.findByText("CD São Paulo (ARM-01)")).toBeInTheDocument();
    expect(screen.getByText("Este pedido ainda não tem itens cadastrados.")).toBeInTheDocument();
  });

  it("lista os itens com o progresso de atendimento", async () => {
    vi.mocked(orderService.getById).mockResolvedValue({
      ...PEDIDO,
      itens: [
        {
          id: "item-1",
          quantidade: 15,
          quantidade_atendida: 5,
          produto: { nome: "Produto Teste Triagem", sku: "TEST-PROD-001" },
        },
      ],
    } as never);

    renderPagina();

    expect(await screen.findByText("Produto Teste Triagem")).toBeInTheDocument();
    expect(screen.getByText("TEST-PROD-001")).toBeInTheDocument();
    expect(screen.getByText("5 / 15 un.")).toBeInTheDocument();
    expect(screen.getByText("5 de 15 unidades atendidas")).toBeInTheDocument();
  });

  it("mostra estado de erro quando a consulta do pedido falha", async () => {
    vi.mocked(orderService.getById).mockRejectedValue(new Error("pedido indisponível"));

    renderPagina();

    expect(await screen.findByText("pedido indisponível")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
