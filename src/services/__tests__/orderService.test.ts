import { describe, it, expect, vi, beforeEach } from "vitest";
import { orderService } from "../orderService";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn() },
}));

vi.mock("@/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

function chain(resultado: { data?: unknown; error?: unknown; count?: number | null }) {
  const q: Record<string, unknown> = {};
  const devolve = () => q;
  for (const metodo of ["select", "eq", "neq", "order", "range", "update", "insert", "delete"]) {
    q[metodo] = vi.fn(devolve);
  }
  q.single = vi.fn(() => Promise.resolve(resultado));
  q.then = (resolve: (valor: unknown) => unknown, reject?: (erro: unknown) => unknown) =>
    Promise.resolve(resultado).then(resolve, reject);
  return q;
}

describe("orderService.updateStatus", () => {
  beforeEach(() => vi.clearAllMocks());

  it("grava o novo status e retorna a linha afetada", async () => {
    vi.mocked(supabase.from).mockReturnValue(
      chain({ data: [{ id: "ped-1" }], error: null }) as never
    );

    await expect(orderService.updateStatus("ped-1", "embalagem")).resolves.toEqual({ id: "ped-1" });
    expect(supabase.from).toHaveBeenCalledWith("orders");
  });

  it("falha quando a RLS bloqueia (0 linhas afetadas em silêncio)", async () => {
    vi.mocked(supabase.from).mockReturnValue(chain({ data: [], error: null }) as never);

    await expect(orderService.updateStatus("ped-1", "enviado")).rejects.toThrow(
      /Sem permissão para alterar o status do pedido/
    );
  });
});

describe("orderService.create", () => {
  beforeEach(() => vi.clearAllMocks());

  it("cria o pedido sem itens quando a lista vem vazia", async () => {
    vi.mocked(supabase.from).mockReturnValue(
      chain({ data: { id: "ped-9" }, error: null }) as never
    );

    const pedido = await orderService.create({ codigo: "PED-9", cliente_nome: "Cliente" }, []);

    expect(pedido).toEqual({ id: "ped-9" });
    expect(supabase.from).toHaveBeenCalledTimes(1);
  });

  it("desfaz o pedido quando a inserção dos itens falha", async () => {
    const pedidoChain = chain({ data: { id: "ped-9" }, error: null });
    const itensChain = chain({ data: null, error: new Error("item inválido") });
    const limpezaChain = chain({ data: null, error: null });
    vi.mocked(supabase.from)
      .mockReturnValueOnce(pedidoChain as never)
      .mockReturnValueOnce(itensChain as never)
      .mockReturnValueOnce(limpezaChain as never)
      .mockReturnValueOnce(limpezaChain as never);

    await expect(
      orderService.create({ codigo: "PED-9", cliente_nome: "Cliente" }, [
        { produto_id: "6f1c1b2e-1111-4a2a-9c3d-8a1b2c3d4e5f", quantidade: 1 },
      ])
    ).rejects.toThrow("item inválido");

    expect(supabase.from).toHaveBeenCalledWith("order_items");
    expect(supabase.from).toHaveBeenCalledWith("orders");
    expect(supabase.from).toHaveBeenCalledTimes(4);
  });
});
