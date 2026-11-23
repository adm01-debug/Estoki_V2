import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useOperationalLive } from "../useOperationalLive";

const state = vi.hoisted(() => ({
  counts: [] as number[],
  countIndex: 0,
  failAt: -1,
  selectCalls: [] as Array<{ table: string; head: boolean }>,
}));

vi.mock("../useRealtimeKPIs", () => ({
  useRealtimeKPIs: () => ({ isConnected: true, lastUpdate: null, updatesCount: 0 }),
}));

vi.mock("@/integrations/supabase/client", () => {
  const makeBuilder = (table: string) => {
    const builder: Record<string, unknown> = {};
    const self = () => builder;
    let isCount = false;
    let countPosition = -1;

    builder.select = vi.fn((_cols: string, opts?: { head?: boolean }) => {
      isCount = opts?.head === true;
      state.selectCalls.push({ table, head: isCount });
      if (isCount) {
        countPosition = state.countIndex;
        state.countIndex += 1;
      }
      return builder;
    });
    builder.eq = vi.fn(self);
    builder.is = vi.fn(self);
    builder.not = vi.fn(self);
    builder.gte = vi.fn(self);
    builder.order = vi.fn(self);
    builder.limit = vi.fn(self);
    builder.then = (
      onFulfilled: (value: unknown) => unknown,
      onRejected?: (reason: unknown) => unknown
    ) => {
      const result = isCount
        ? {
            data: null,
            count: state.counts[countPosition] ?? 0,
            error: countPosition === state.failAt ? { message: "boom no banco" } : null,
          }
        : { data: [], count: null, error: null };
      return Promise.resolve(result).then(onFulfilled, onRejected);
    };
    return builder;
  };

  return { supabase: { from: vi.fn(makeBuilder), channel: vi.fn(), removeChannel: vi.fn() } };
});

function renderLive() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useOperationalLive(), { wrapper });
}

describe("useOperationalLive — contagens no servidor (E-155)", () => {
  beforeEach(() => {
    state.counts = [4, 8, 6, 10, 7, 3, 5, 1, 2, 3, 11, 164, 82, 70, 24, 4];
    state.countIndex = 0;
    state.failAt = -1;
    state.selectCalls = [];
  });

  it("deriva os KPIs dos counts, não das linhas baixadas", async () => {
    const { result } = renderLive();
    await waitFor(() => expect(result.current.data).not.toBeNull());

    const dados = result.current.data!;
    expect(dados.pickingEmAndamento).toBe(4);
    expect(dados.pickingConcluidos).toBe(8);
    expect(dados.pickingAcuracidade).toBeCloseTo(75, 5);
    expect(dados.triagensHoje).toBe(10);
    expect(dados.triagensAprovadas).toBe(7);
    expect(dados.taxaAprovacao).toBeCloseTo(70, 5);
    expect(dados.lotesAguardando).toBe(3);
    expect(dados.lotesConferidos).toBe(5);
    expect(dados.lotesDivergencia).toBe(1);
    expect(dados.tarefasPendentes).toBe(2);
    expect(dados.tarefasEmExecucao).toBe(3);
    expect(dados.tarefasConcluidas).toBe(11);
    expect(dados.posicaoOcupadas).toBe(82);
    expect(dados.posicaoLivres).toBe(70);
    expect(dados.taxaOcupacao).toBeCloseTo(50, 5);
    expect(dados.alertasAtivos).toBe(24);
    expect(dados.alertasCriticos).toBe(4);
  });

  it("faz 16 contagens head:true e só 2 selects de atividade", async () => {
    const { result } = renderLive();
    await waitFor(() => expect(result.current.data).not.toBeNull());

    const contagens = state.selectCalls.filter((c) => c.head);
    const listas = state.selectCalls.filter((c) => !c.head);
    expect(contagens).toHaveLength(16);
    expect(listas).toHaveLength(2);
  });

  it("propaga o erro do banco em vez de mostrar zeros", async () => {
    state.failAt = 5;
    const { result } = renderLive();

    await waitFor(() => expect(result.current.error).not.toBeNull());
    expect(result.current.error?.message).toBe("boom no banco");
  });
});
