import { describe, it, expect, vi, beforeEach } from "vitest";
import { pickingService } from "./pickingService";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: vi.fn(), rpc: vi.fn() },
}));

function chain(overrides: Record<string, any> = {}) {
  const base: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    single: vi.fn(),
    ...overrides,
  };
  return base;
}

describe("pickingService", () => {
  beforeEach(() => vi.clearAllMocks());

  it("getTasks normaliza produto/posição ausentes", async () => {
    const rows = [
      { id: "1", tipo: "separacao", produto: null, posicao_origem: null },
      { id: "2", tipo: "separacao", produto: { nome: "SKU" }, posicao_origem: { codigo: "A1" } },
    ];
    const mock = chain({
      order: vi.fn().mockResolvedValue({ data: rows, error: null }),
    });
    (supabase.from as any).mockReturnValue(mock);
    const res = await pickingService.getTasks();
    expect(res[0].produto_nome).toBe("Produto Indefinido");
    expect(res[0].posicao_origem_codigo).toBe("---");
    expect(res[1].produto_nome).toBe("SKU");
    expect(res[1].posicao_origem_codigo).toBe("A1");
  });

  it("getTasks propaga erros do banco", async () => {
    const mock = chain({
      order: vi.fn().mockResolvedValue({ data: null, error: new Error("boom") }),
    });
    (supabase.from as any).mockReturnValue(mock);
    await expect(pickingService.getTasks()).rejects.toThrow("boom");
  });

  it("updateTaskStatus usa RPC iniciar_tarefa_picking ao iniciar", async () => {
    (supabase.rpc as any).mockResolvedValue({ error: null });
    await pickingService.updateTaskStatus("t1", "em_andamento", "user-1");
    expect(supabase.rpc).toHaveBeenCalledWith("iniciar_tarefa_picking", { p_tarefa_id: "t1" });
  });

  it("updateTaskStatus usa RPC concluir_tarefa_picking ao concluir", async () => {
    (supabase.rpc as any).mockResolvedValue({ error: null });
    await pickingService.updateTaskStatus("t1", "concluida", "user-1", 5);
    expect(supabase.rpc).toHaveBeenCalledWith("concluir_tarefa_picking", {
      p_tarefa_id: "t1",
      p_quantidade: 5,
      p_codigo_lido: null,
    });
  });

  it("updateTaskStatus exige quantidade ao concluir", async () => {
    await expect(pickingService.updateTaskStatus("t1", "concluida", "user-1")).rejects.toThrow(
      "Quantidade é obrigatória"
    );
  });

  it("updateTaskStatus propaga erro do RPC ao iniciar", async () => {
    (supabase.rpc as any).mockResolvedValue({ error: new Error("rpc-fail") });
    await expect(pickingService.updateTaskStatus("t1", "em_andamento", "user-1")).rejects.toThrow(
      "rpc-fail"
    );
  });
});
