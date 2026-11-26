import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { HelmetProvider } from "react-helmet-async";
import ObservabilidadePage from "../ObservabilidadePage";
import { supabase } from "@/integrations/supabase/client";
import "@testing-library/jest-dom";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { rpc: vi.fn() },
}));

// recharts mede o container para desenhar; no jsdom a largura e 0 e nada renderiza.
vi.mock("recharts", () => ({
  ResponsiveContainer: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  BarChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  LineChart: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  Bar: () => null,
  Line: () => null,
  XAxis: () => null,
  YAxis: () => null,
  CartesianGrid: () => null,
  Tooltip: () => null,
  Legend: () => null,
}));

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const rpc = supabase.rpc as unknown as ReturnType<typeof vi.fn>;

const cliente = new QueryClient({ defaultOptions: { queries: { retry: false } } });

const renderizar = () =>
  render(
    <QueryClientProvider client={cliente}>
      <HelmetProvider>
        <ObservabilidadePage />
      </HelmetProvider>
    </QueryClientProvider>
  );

const metricas = {
  audit: [
    {
      dia: "2026-11-24",
      entity_type: "produtos",
      action: "update",
      total: 5,
      usuarios_distintos: 2,
    },
  ],
  alertas: [
    { dia: "2026-11-24", severidade: "critica", tipo: "estoque", status: "aberto", total: 3 },
  ],
  notificacoes: [
    { dia: "2026-11-24", tipo: "estoque_baixo", enviadas: 4, lidas: 2, taxa_leitura_pct: 50 },
  ],
  generated_at: "2026-11-24T10:00:00Z",
};

describe("ObservabilidadePage", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    cliente.clear();
  });

  it("mostra os totais agregados que a RPC devolve", async () => {
    rpc.mockResolvedValue({ data: metricas, error: null });

    renderizar();

    await waitFor(() => expect(screen.getByText("Eventos auditados")).toBeInTheDocument());
    expect(rpc).toHaveBeenCalledWith("get_dashboard_metrics", { _dias: 30 });
    // os mesmos numeros aparecem no cartao e na barra/tabela: compara dentro do cartao
    const cartao = (rotulo: string) =>
      screen.getAllByText(rotulo)[0].parentElement?.textContent ?? "";
    expect(cartao("Eventos auditados")).toContain("5");
    expect(cartao("Alertas")).toContain("3");
    expect(cartao("Notificações enviadas")).toContain("4");
    expect(cartao("Taxa de leitura")).toContain("50%");
    expect(screen.getByText("estoque_baixo")).toBeInTheDocument();
  });

  it("avisa quando nao ha indicadores no periodo", async () => {
    rpc.mockResolvedValue({
      data: { audit: [], alertas: [], notificacoes: [], generated_at: "2026-11-24T10:00:00Z" },
      error: null,
    });

    renderizar();

    await waitFor(() => expect(screen.getByText("Sem indicadores no período")).toBeInTheDocument());
  });

  it("mostra o erro da RPC em vez de tela vazia", async () => {
    rpc.mockResolvedValue({ data: null, error: { message: "Acesso restrito a administradores" } });

    renderizar();

    await waitFor(() =>
      expect(screen.getByText("Acesso restrito a administradores")).toBeInTheDocument()
    );
  });
});
