import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import CustomerDetailPage from "../CustomerDetailPage";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

type Resposta = { data: unknown; error: unknown; count?: number | null };

const respostas: Record<string, Resposta> = {};

// Builder mínimo que aceita qualquer cadeia PostgREST usada pela página.
function builder(tabela: string) {
  const resposta = () => Promise.resolve(respostas[tabela] ?? { data: null, error: null });
  const q = {
    select: () => q,
    eq: () => q,
    neq: () => q,
    order: () => q,
    limit: () => q,
    maybeSingle: resposta,
    then: (resolve: (valor: Resposta) => unknown, reject?: (erro: unknown) => unknown) =>
      resposta().then(resolve, reject),
  };
  return q;
}

const CLIENTE = {
  id: "cli-1",
  nome: "Promo Brindes Ltda",
  cpf_cnpj: "12.345.678/0001-90",
  email: "contato@promobrindes.com.br",
  telefone: "(11) 3456-7890",
  endereco: "Av. Brigadeiro Faria Lima, 3477",
  cidade: "São Paulo",
  estado: "SP",
  cep: "04538-133",
  ativo: true,
  created_at: "2026-08-12T16:26:06.343038+00:00",
  updated_at: "2026-08-12T16:26:06.343038+00:00",
};

function renderPagina(id = "cli-1") {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={qc}>
      <MemoryRouter initialEntries={[`/clientes/${id}`]}>
        <Routes>
          <Route path="/clientes/:id" element={<CustomerDetailPage />} />
        </Routes>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe("CustomerDetailPage", () => {
  beforeEach(() => {
    for (const chave of Object.keys(respostas)) delete respostas[chave];
    vi.mocked(supabase.from).mockImplementation(((tabela: string) => builder(tabela)) as never);
  });

  it("mostra o cadastro do cliente buscado por id", async () => {
    respostas.clientes = { data: CLIENTE, error: null };
    respostas.orders = { data: [], error: null };

    renderPagina();

    expect(await screen.findByText("Promo Brindes Ltda")).toBeInTheDocument();
    expect(screen.getByText("12.345.678/0001-90")).toBeInTheDocument();
    expect(screen.getByText("contato@promobrindes.com.br")).toBeInTheDocument();
    expect(supabase.from).toHaveBeenCalledWith("clientes");
  });

  it("lista os pedidos vinculados ao cliente", async () => {
    respostas.clientes = { data: CLIENTE, error: null };
    respostas.orders = {
      data: [
        {
          id: "ped-1",
          codigo: "PED-2025001",
          status: "pendente",
          data_prometida: "2026-08-13",
          created_at: "2026-08-12T15:54:56.396951+00:00",
        },
      ],
      error: null,
    };

    renderPagina();

    expect(await screen.findByText("PED-2025001")).toBeInTheDocument();
    expect(screen.getByText("Pendente")).toBeInTheDocument();
  });

  it("avisa quando o cliente não existe", async () => {
    respostas.clientes = { data: null, error: null };

    renderPagina("cli-inexistente");

    expect(await screen.findByText("Cliente não encontrado")).toBeInTheDocument();
    expect(screen.queryByText("Promo Brindes Ltda")).not.toBeInTheDocument();
  });

  it("mostra estado de erro com retry quando a consulta falha", async () => {
    respostas.clientes = { data: null, error: new Error("permission denied") };

    renderPagina();

    expect(await screen.findByText("Algo deu errado")).toBeInTheDocument();
    expect(screen.getByText("permission denied")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /tentar novamente/i })).toBeInTheDocument();
  });
});
