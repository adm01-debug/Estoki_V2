import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { render, screen, waitFor } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { CatalogoMestreCard } from "@/components/integracoes/CatalogoMestreCard";

const { maybeSingleMock } = vi.hoisted(() => ({ maybeSingleMock: vi.fn() }));

const cadeia = () => {
  const chain: Record<string, unknown> = {};
  chain.select = vi.fn(() => chain);
  chain.eq = vi.fn(() => chain);
  chain.maybeSingle = maybeSingleMock;
  return chain;
};

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(() => cadeia()) },
}));

const renderCard = () => {
  const queryClient = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(
    <QueryClientProvider client={queryClient}>
      <CatalogoMestreCard />
    </QueryClientProvider>
  );
};

describe("CatalogoMestreCard", () => {
  it("mostra o resumo da ultima execucao e o cursor guardado", async () => {
    maybeSingleMock.mockResolvedValue({
      data: {
        origem: "doufsxqlfjyuvxuezpln",
        origem_atualizada_ate: "2026-11-26T12:00:00.000Z",
        origem_sku: "SKU-999",
        ultima_execucao: new Date().toISOString(),
        ultima_duracao_ms: 4200,
        ultimo_resultado: {
          modo: "incremental",
          paginas: 4,
          processados: 5000,
          replicados: 4990,
          ignorados: 10,
          barcodes_descartados: 0,
          duracao_ms: 4200,
        },
        updated_at: new Date().toISOString(),
      },
      error: null,
    });

    renderCard();

    await waitFor(() => expect(screen.getByText("5.000")).toBeInTheDocument());
    expect(screen.getByText("4.990")).toBeInTheDocument();
    expect(screen.getByText("10")).toBeInTheDocument();
    expect(screen.getByText("4.200 ms")).toBeInTheDocument();
    expect(screen.getByText(/SKU-999/)).toBeInTheDocument();
  });

  it("avisa quando o catalogo nunca foi sincronizado", async () => {
    maybeSingleMock.mockResolvedValue({
      data: {
        origem: "doufsxqlfjyuvxuezpln",
        origem_atualizada_ate: null,
        origem_sku: null,
        ultima_execucao: null,
        ultima_duracao_ms: null,
        ultimo_resultado: null,
        updated_at: null,
      },
      error: null,
    });

    renderCard();

    await waitFor(() => expect(screen.getByText("Nunca sincronizado")).toBeInTheDocument());
  });

  it("mostra o erro quando a leitura do estado falha", async () => {
    maybeSingleMock.mockResolvedValue({ data: null, error: { message: "permission denied" } });

    renderCard();

    await waitFor(() => expect(screen.getByText(/permission denied/)).toBeInTheDocument());
  });
});
