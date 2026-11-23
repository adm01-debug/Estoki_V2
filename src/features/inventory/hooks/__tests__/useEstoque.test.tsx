import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import type { PosicaoEstoque } from "@/types/inventory";
import { useEstoque } from "../useEstoque";

const getAll = vi.hoisted(() => vi.fn());

vi.mock("@/services/inventoryService", () => ({ inventoryService: { getAll } }));
vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(), channel: vi.fn(), removeChannel: vi.fn(), removeAllChannels: vi.fn() },
}));
vi.mock("@/hooks/use-toast", () => ({ useToast: () => ({ toast: vi.fn() }) }));

function posicao(
  id: string,
  tipo: PosicaoEstoque["tipo"],
  status: PosicaoEstoque["status"]
): PosicaoEstoque {
  return { id, codigo: id, tipo, status, created_at: "", updated_at: "" };
}

function renderEstoque() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useEstoque(), { wrapper });
}

describe("useEstoque — ocupação por tipo de posição (E-153)", () => {
  beforeEach(() => {
    getAll.mockReset();
  });

  it("calcula porta-paletes e boxes separadamente", async () => {
    getAll.mockResolvedValue([
      posicao("pp1", "porta_palete", "ocupado"),
      posicao("pp2", "porta_palete", "ocupado"),
      posicao("pp3", "porta_palete", "livre"),
      posicao("bx1", "box", "ocupado"),
      posicao("bx2", "box", "bloqueado"),
    ]);

    const { result } = renderEstoque();
    await waitFor(() => expect(result.current.getEstatisticas().total).toBe(5));

    const stats = result.current.getEstatisticas();
    expect(stats.taxaOcupacao).toBeCloseTo(60, 5);
    expect(stats.taxaOcupacaoPortaPalete).toBeCloseTo((2 / 3) * 100, 5);
    expect(stats.taxaOcupacaoBox).toBeCloseTo(50, 5);
  });

  it("devolve 0 (sem NaN) quando não existe posição do tipo", async () => {
    getAll.mockResolvedValue([posicao("bx1", "box", "livre")]);

    const { result } = renderEstoque();
    await waitFor(() => expect(result.current.getEstatisticas().total).toBe(1));

    const stats = result.current.getEstatisticas();
    expect(stats.taxaOcupacaoPortaPalete).toBe(0);
    expect(stats.taxaOcupacaoBox).toBe(0);
    expect(Number.isNaN(stats.taxaOcupacaoPortaPalete)).toBe(false);
  });
});
