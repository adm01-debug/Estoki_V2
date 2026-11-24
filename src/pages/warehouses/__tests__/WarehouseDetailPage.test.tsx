import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import WarehouseDetailPage from "../WarehouseDetailPage";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

type Resposta = { data: unknown; error: unknown; count?: number | null };

const respostas: Record<string, Resposta> = {};
const contagens: Record<string, number[]> = {};

function builder(tabela: string) {
  const fila = contagens[tabela] ?? [];
  const usaFila = fila.length > 0;
  const resposta = (): Promise<Resposta> => {
    if (usaFila) return Promise.resolve({ data: null, error: null, count: fila.shift() ?? 0 });
    return Promise.resolve(respostas[tabela] ?? { data: null, error: null });
  };
  const q = {
    select: () => q,
    eq: () => q,
    filter: () => q,
    neq: () => q,
    order: () => q,
    limit: () => q,
    maybeSingle: resposta,
    then: (resolve: (valor: Resposta) => unknown, reject?: (erro: unknown) => unknown) =>
      resposta().then(resolve, reject),
  };
  return q;
}

const ARMAZEM = {
  id: "arm-1",
  codigo: "ARM-01",
  nome: "Centro de Distribuição São Paulo",
  endereco: "Av. Paulista, 1000",
  cidade: "São Paulo",
  estado: "SP",
  cep: "01310-100",
  capacidade_total: 50000,
  ativo: true,
};

function renderPagina(id = "arm-1") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/armazens/${id}`]}>
        <Routes>
          <Route path="/armazens/:id" element={<WarehouseDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("WarehouseDetailPage", () => {
  beforeEach(() => {
    for (const chave of Object.keys(respostas)) delete respostas[chave];
    for (const chave of Object.keys(contagens)) delete contagens[chave];
    vi.mocked(supabase.from).mockImplementation(((tabela: string) => builder(tabela)) as never);
  });

  it("mostra o armazém e os indicadores contados no banco", async () => {
    respostas.armazens = { data: ARMAZEM, error: null };
    // Ordem real das consultas na página: posições, ocupadas, pedidos em aberto,
    // tarefas pendentes, lotes (valores medidos em produção para ARM-01).
    contagens.posicoes_estoque = [164, 76];
    contagens.orders = [4];
    contagens.tarefas = [23];
    contagens.lotes = [37];
    respostas.orders = {
      data: [{ id: "ped-1", codigo: "PED-2025001", status: "pendente" }],
      error: null,
    };

    renderPagina();

    expect(await screen.findByText("Centro de Distribuição São Paulo")).toBeInTheDocument();
    expect(await screen.findByText("164")).toBeInTheDocument();
    expect(screen.getByText("76")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
    expect(screen.getByText("23")).toBeInTheDocument();
    expect(screen.getByText("37")).toBeInTheDocument();
    const legenda = screen.getByText(/Ocupação de posições: 46%/);
    expect(legenda).toBeInTheDocument();
    expect(supabase.from).toHaveBeenCalledWith("posicoes_estoque");
  });

  it("avisa quando o armazém não existe", async () => {
    respostas.armazens = { data: null, error: null };

    renderPagina("arm-inexistente");

    expect(await screen.findByText("Armazém não encontrado")).toBeInTheDocument();
  });

  it("mostra estado de erro quando a consulta de indicadores falha", async () => {
    respostas.armazens = { data: ARMAZEM, error: null };
    respostas.posicoes_estoque = { data: null, error: new Error("timeout do PostgREST") };

    renderPagina();

    expect(await screen.findByText("timeout do PostgREST")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
