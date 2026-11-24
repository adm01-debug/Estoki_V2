import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { MemoryRouter } from "react-router-dom";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import WarehousesPage from "../WarehousesPage";

vi.mock("@/integrations/supabase/client", () => ({ supabase: { from: vi.fn() } }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const armazens = [
  {
    id: "w1",
    codigo: "ARM-01",
    nome: "CD São Paulo",
    endereco: "Av. Paulista, 1000",
    cidade: "São Paulo",
    estado: "SP",
    cep: "01310-100",
    capacidade_total: 50000,
    ativo: true,
  },
  {
    id: "w9",
    codigo: "ARM-09",
    nome: "CD Antigo",
    endereco: null,
    cidade: null,
    estado: null,
    cep: null,
    capacidade_total: null,
    ativo: false,
  },
];

const vinculos = { posicoes: 0, tarefas: 0, pedidos: 0 };
const updateMock = vi.fn();

function cadeiaDeContagem(count: number) {
  const cadeia = {
    filter: () => cadeia,
    then: (resolver: (valor: unknown) => void) => resolver({ count, error: null }),
  };
  return cadeia;
}

beforeEach(() => {
  vi.clearAllMocks();
  vinculos.posicoes = 0;
  vinculos.tarefas = 0;
  vinculos.pedidos = 0;
  vi.mocked(supabase.from).mockImplementation((tabela: string) => {
    if (tabela === "armazens") {
      return {
        select: () => ({ order: () => Promise.resolve({ data: armazens, error: null }) }),
        update: (payload: Record<string, unknown>) => {
          updateMock(payload);
          return {
            eq: () => ({
              select: () => Promise.resolve({ data: [{ id: "w1" }], error: null }),
            }),
          };
        },
      } as never;
    }
    const count =
      tabela === "posicoes_estoque"
        ? vinculos.posicoes
        : tabela === "tarefas"
          ? vinculos.tarefas
          : vinculos.pedidos;
    return { select: () => cadeiaDeContagem(count) } as never;
  });
});

function renderPage() {
  const qc = new QueryClient({
    defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
  });
  render(
    <QueryClientProvider client={qc}>
      <MemoryRouter>
        <WarehousesPage />
      </MemoryRouter>
    </QueryClientProvider>
  );
}

async function pedirDesativacao(nome: string) {
  await screen.findByText(nome);
  fireEvent.click(screen.getByLabelText(`Desativar ${nome}`));
  fireEvent.click(await screen.findByRole("button", { name: "Desativar" }));
}

describe("WarehousesPage — desativação (soft delete)", () => {
  it("desativa com update ativo=false em vez de apagar a linha", async () => {
    renderPage();
    await pedirDesativacao("CD São Paulo");
    await waitFor(() => expect(updateMock).toHaveBeenCalledWith({ ativo: false }));
    await waitFor(() => expect(toast.success).toHaveBeenCalled());
  });

  it("bloqueia a desativação quando há posições ocupadas e não chama update", async () => {
    vinculos.posicoes = 164;
    renderPage();
    await pedirDesativacao("CD São Paulo");
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("164 posição"))
    );
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("bloqueia a desativação quando há tarefas em aberto e pedidos em andamento", async () => {
    vinculos.tarefas = 66;
    vinculos.pedidos = 5;
    renderPage();
    await pedirDesativacao("CD São Paulo");
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith(expect.stringContaining("66 tarefa"))
    );
    expect(updateMock).not.toHaveBeenCalled();
  });

  it("oculta armazém inativo até ligar 'Mostrar inativos'", async () => {
    renderPage();
    await screen.findByText("CD São Paulo");
    expect(screen.queryByText("CD Antigo")).toBeNull();
    fireEvent.click(screen.getByRole("switch"));
    expect(await screen.findByText("CD Antigo")).toBeTruthy();
  });
});
