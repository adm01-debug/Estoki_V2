import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { act, renderHook, waitFor } from "@testing-library/react";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useApplyDefaultSavedFilter } from "@/hooks/useSavedFilters";

const { linhas } = vi.hoisted(() => ({ linhas: { current: [] as any[] } }));

vi.mock("@/integrations/supabase/client", () => {
  const cadeia: Record<string, any> = {};
  cadeia.select = vi.fn(() => cadeia);
  cadeia.eq = vi.fn(() => cadeia);
  cadeia.order = vi.fn(() => Promise.resolve({ data: linhas.current, error: null }));
  return {
    supabase: {
      from: vi.fn(() => cadeia),
      auth: { getUser: vi.fn(async () => ({ data: { user: { id: "u1" } } })) },
    },
  };
});

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

const filtroPadrao = (filters: Record<string, unknown>) => ({
  id: "f-1",
  user_id: "u1",
  entity_type: "produtos",
  name: "padrão",
  filters,
  is_default: true,
  is_shared: false,
  icon: "filter",
  color: "blue",
  usage_count: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
});

describe("useApplyDefaultSavedFilter", () => {
  beforeEach(() => {
    linhas.current = [];
  });

  it("aplica o filtro padrão uma única vez, mesmo após mudanças de filtro", async () => {
    linhas.current = [filtroPadrao({ search: "caneta", curva: "A" })];
    const aplicar = vi.fn();

    const { rerender } = renderHook(() => useApplyDefaultSavedFilter("produtos", aplicar), {
      wrapper,
    });

    await waitFor(() => expect(aplicar).toHaveBeenCalledTimes(1));
    expect(aplicar).toHaveBeenCalledWith({ search: "caneta", curva: "A" });

    rerender();
    await act(async () => {
      await new Promise((r) => setTimeout(r, 30));
    });
    expect(aplicar).toHaveBeenCalledTimes(1);
  });

  it("não aplica nada quando nenhum filtro é padrão", async () => {
    linhas.current = [{ ...filtroPadrao({ search: "x" }), is_default: false }];
    const aplicar = vi.fn();

    renderHook(() => useApplyDefaultSavedFilter("produtos", aplicar), { wrapper });

    await act(async () => {
      await new Promise((r) => setTimeout(r, 50));
    });
    expect(aplicar).not.toHaveBeenCalled();
  });
});
