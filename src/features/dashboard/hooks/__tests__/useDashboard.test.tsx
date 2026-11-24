import { renderHook, waitFor } from "@testing-library/react";
import { useDashboard } from "../useDashboard";
import { vi, describe, it, expect, beforeEach } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import React from "react";

// Registra os filtros de data enviados ao Supabase (E-152)
type GteCall = { table: string; column: string; value: string };

const gteCalls = vi.hoisted(() => [] as GteCall[]);

// Mocking Supabase: encadeavel e "thenable", para capturar os filtros aplicados
vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn((table: string) => {
      const result = { data: [], count: 10, error: null };
      const builder: Record<string, unknown> = {};
      const self = () => builder;
      builder.select = vi.fn(self);
      builder.eq = vi.fn(self);
      builder.is = vi.fn(self);
      builder.order = vi.fn(self);
      builder.limit = vi.fn(self);
      builder.gte = vi.fn((column: string, value: string) => {
        gteCalls.push({ table, column, value });
        return builder;
      });
      builder.then = (
        onFulfilled: (value: unknown) => unknown,
        onRejected?: (reason: unknown) => unknown
      ) => Promise.resolve(result).then(onFulfilled, onRejected);
      return builder;
    }),
  },
}));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
    },
  },
});

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
);

describe("useDashboard hook", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    queryClient.clear();
    gteCalls.length = 0;
  });

  it("should fetch and return dashboard metrics", async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.kpis).toBeDefined();
    expect(result.current.ocupacaoPP).toBeInstanceOf(Array);
    expect(result.current.movimentacoes7dias).toBeInstanceOf(Array);
  });

  it("filtra entradas, saidas e triagens pelo inicio do dia local", async () => {
    const { result } = renderHook(() => useDashboard(), { wrapper });

    await waitFor(() => expect(gteCalls.length).toBeGreaterThanOrEqual(3));
    await waitFor(() => expect(result.current.loading).toBe(false));

    const inicioDoDia = new Date();
    inicioDoDia.setHours(0, 0, 0, 0);
    const esperadoISO = inicioDoDia.toISOString();
    const esperadaDataLocal = [
      inicioDoDia.getFullYear(),
      String(inicioDoDia.getMonth() + 1).padStart(2, "0"),
      String(inicioDoDia.getDate()).padStart(2, "0"),
    ].join("-");

    expect(gteCalls).toContainEqual({
      table: "eventos_triagem",
      column: "created_at",
      value: esperadoISO,
    });
    expect(gteCalls).toContainEqual({
      table: "lotes",
      column: "data_recebimento",
      value: esperadaDataLocal,
    });
    expect(gteCalls).toContainEqual({
      table: "lotes",
      column: "data_conferencia",
      value: esperadoISO,
    });
  });
});
