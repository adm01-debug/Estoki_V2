import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React from "react";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { useRealtimeKPIs } from "../useRealtimeKPIs";

type Handler = (payload: { eventType: string; new: Record<string, unknown> }) => void;

const captured = vi.hoisted(() => ({ handlers: new Map<string, Handler>() }));

vi.mock("@/integrations/supabase/client", () => {
  const channel = () => {
    const builder: Record<string, unknown> = {};
    builder.on = vi.fn((_type: string, filter: { table: string }, cb: Handler) => {
      captured.handlers.set(filter.table, cb);
      return builder;
    });
    builder.subscribe = vi.fn((cb?: (status: string) => void) => {
      cb?.("SUBSCRIBED");
      return builder;
    });
    return builder;
  };
  return { supabase: { channel: vi.fn(channel), removeChannel: vi.fn() } };
});

function createQueryClient() {
  return new QueryClient({ defaultOptions: { queries: { retry: false } } });
}

function renderRealtime(client: QueryClient) {
  const wrapper = ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={client}>{children}</QueryClientProvider>
  );
  return renderHook(() => useRealtimeKPIs({ showToasts: false }), { wrapper });
}

// Cada tabela precisa invalidar as queryKeys REAIS do app (E-154).
const EXPECTED: Array<[string, string[][]]> = [
  ["metricas_operacionais", [["metricas-operacionais"], ["metas-kpi"]]],
  [
    "posicoes_estoque",
    [["estoque-posicoes"], ["ocupacao-visual-v2"], ["operational-live"], ["dashboard-stats"]],
  ],
  ["estoque_posicao", [["estoque-posicoes"], ["posicao-detalhe"], ["dashboard-stats"]]],
  [
    "eventos_triagem",
    [["triagens"], ["fornecedor-scores"], ["dashboard-stats"], ["operational-live"]],
  ],
  ["eventos_picking", [["operational-live"], ["picking-tasks"]]],
  ["tarefas", [["tarefas"], ["picking-tasks"], ["putaway-tasks"], ["operational-live"]]],
  [
    "lotes",
    [
      ["recebimentos"],
      ["lotes-list"],
      ["kanban-lotes"],
      ["curva-abc"],
      ["dashboard-stats"],
      ["operational-live"],
    ],
  ],
  ["alertas_historico", [["alertas_historico"], ["operational-live"]]],
  ["rastreamento_historico", [["rastreamento_historico"], ["curva-abc"], ["dashboard-stats"]]],
];

describe("useRealtimeKPIs", () => {
  let client: QueryClient;
  let invalidateSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    captured.handlers.clear();
    client = createQueryClient();
    invalidateSpy = vi.spyOn(client, "invalidateQueries");
  });

  it("assina as nove tabelas de KPI", () => {
    renderRealtime(client);
    expect(Array.from(captured.handlers.keys()).sort()).toEqual(
      EXPECTED.map(([table]) => table).sort()
    );
  });

  it.each(EXPECTED)("invalida as chaves reais quando %s muda", async (table, keys) => {
    renderRealtime(client);

    const handler = captured.handlers.get(table);
    expect(handler).toBeDefined();
    handler?.({ eventType: "INSERT", new: {} });

    await waitFor(() => {
      keys.forEach((key) => {
        expect(invalidateSpy).toHaveBeenCalledWith({ queryKey: key });
      });
    });
  });

  it("nao invalida chaves inexistentes (bug do E-154)", async () => {
    renderRealtime(client);

    captured.handlers.forEach((handler) => handler({ eventType: "UPDATE", new: {} }));

    await waitFor(() => expect(invalidateSpy).toHaveBeenCalled());

    const invalidatedKeys = invalidateSpy.mock.calls.map((call) => call[0]?.queryKey);
    const legacy = [
      "dashboard",
      "posicoes_estoque",
      "posicoes_estoque_count",
      "ocupacao_por_porta_palete",
      "estoque_posicao",
      "triagem_por_produto",
      "eventos_triagem",
      "eventos_picking",
      "ondas_separacao",
      "lotes",
      "alertas",
      "atividades_recentes",
      "metricas_operacionais",
    ];

    legacy.forEach((key) => expect(invalidatedKeys).not.toContainEqual([key]));
  });
});
