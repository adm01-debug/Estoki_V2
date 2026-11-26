import { describe, it, expect, vi, beforeEach } from "vitest";
import { consertoService, validarResultado } from "../consertoService";
import { supabase } from "@/integrations/supabase/client";

vi.mock("@/integrations/supabase/client", () => ({
  supabase: {
    from: vi.fn(),
    auth: { getUser: vi.fn() },
  },
}));

vi.mock("@/utils/logger", () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn(), debug: vi.fn() },
}));

function chain(overrides: Record<string, any> = {}) {
  const base: any = {
    select: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    single: vi.fn(),
    ...overrides,
  };
  return base;
}

describe("validarResultado", () => {
  it("aceita recuperação parcial que fecha a conta", () => {
    expect(validarResultado(10, { recuperada: 7, perda: 3, status: "recuperado" })).toBeNull();
  });

  it("recusa soma acima do que entrou no setor", () => {
    expect(validarResultado(10, { recuperada: 8, perda: 3, status: "recuperado" })).toMatch(
      /passa das 10/
    );
  });

  it("recusa resultado vazio", () => {
    expect(validarResultado(5, { recuperada: 0, perda: 0, status: "recuperado" })).toMatch(
      /Informe/
    );
  });

  it("exige recuperada > 0 quando o destino é estoque", () => {
    expect(validarResultado(5, { recuperada: 0, perda: 5, status: "recuperado" })).toMatch(
      /ao menos 1 unidade recuperada/
    );
  });

  it("exige perda > 0 quando o destino é sucata", () => {
    expect(validarResultado(5, { recuperada: 5, perda: 0, status: "sucata" })).toMatch(
      /ao menos 1 unidade perdida/
    );
  });

  it("recusa quantidade fracionada ou negativa", () => {
    expect(validarResultado(5, { recuperada: 1.5, perda: 0, status: "recuperado" })).toMatch(
      /inválida/
    );
    expect(validarResultado(5, { recuperada: -1, perda: 0, status: "recuperado" })).toMatch(
      /inválida/
    );
  });
});

describe("consertoService.registrarPlanoConserto", () => {
  beforeEach(() => vi.clearAllMocks());

  it("não grava nada quando não há unidades para conserto", async () => {
    const resultado = await consertoService.registrarPlanoConserto({
      loteId: "l1",
      quantidade: 0,
      defeito: "x",
    });
    expect(resultado).toBeNull();
    expect(supabase.from).not.toHaveBeenCalled();
  });

  it("exige lote ou produto para rastrear a origem", async () => {
    await expect(
      consertoService.registrarPlanoConserto({ quantidade: 2, defeito: "x" })
    ).rejects.toThrow(/lote ou produto/);
  });

  it("abre a recuperação e registra o checkpoint triagem → conserto", async () => {
    const recChain = chain({
      single: vi.fn().mockResolvedValue({ data: { id: "r1" }, error: null }),
    });
    const cpChain = chain({ insert: vi.fn().mockResolvedValue({ error: null }) });
    (supabase.from as any).mockImplementation((tabela: string) =>
      tabela === "recuperacao_materiais" ? recChain : cpChain
    );

    const row = await consertoService.registrarPlanoConserto({
      loteId: "l1",
      produtoId: "p1",
      quantidade: 4,
      defeito: "Troca de embalagem",
      operadorId: "u1",
    });

    expect(row).toEqual({ id: "r1" });
    const recPayload = (recChain.insert as any).mock.calls[0][0];
    expect(recPayload).toMatchObject({
      lote_id: "l1",
      produto_id: "p1",
      quantidade_original: 4,
      quantidade_recuperada: 0,
      quantidade_perda: 0,
      status: "em_recuperacao",
      operador_responsavel: "u1",
    });

    const cpPayload = (cpChain.insert as any).mock.calls[0][0];
    expect(cpPayload).toMatchObject({
      setor_origem: "triagem",
      setor_destino: "conserto",
      quantidade: 4,
      status_integridade: "com_avaria",
    });
  });

  it("propaga o erro do banco ao abrir a recuperação", async () => {
    const recChain = chain({
      single: vi.fn().mockResolvedValue({ data: null, error: new Error("rls") }),
    });
    (supabase.from as any).mockReturnValue(recChain);

    await expect(
      consertoService.registrarPlanoConserto({
        loteId: "l1",
        quantidade: 1,
        defeito: "x",
        operadorId: "u1",
      })
    ).rejects.toThrow("rls");
  });
});

describe("consertoService.registrarResultado", () => {
  beforeEach(() => vi.clearAllMocks());

  it("barra soma acima do original sem tocar no banco de escrita", async () => {
    const selectChain = chain({
      single: vi.fn().mockResolvedValue({
        data: { id: "r1", quantidade_original: 5, lote_id: "l1", produto_id: "p1" },
        error: null,
      }),
    });
    const updateChain = chain();
    let chamada = 0;
    (supabase.from as any).mockImplementation(() => {
      chamada += 1;
      return chamada === 1 ? selectChain : updateChain;
    });

    await expect(
      consertoService.registrarResultado("r1", { recuperada: 4, perda: 4, status: "recuperado" })
    ).rejects.toThrow(/passa das 5/);
    expect(updateChain.update).not.toHaveBeenCalled();
  });

  it("fecha a recuperação e registra checkpoint conserto → estoque", async () => {
    const selectChain = chain({
      single: vi.fn().mockResolvedValue({
        data: {
          id: "r1",
          quantidade_original: 5,
          lote_id: "l1",
          produto_id: "p1",
          operador_responsavel: "u1",
        },
        error: null,
      }),
    });
    const updateChain = chain({
      single: vi.fn().mockResolvedValue({
        data: { id: "r1", status: "recuperado", quantidade_recuperada: 4 },
        error: null,
      }),
    });
    const cpChain = chain({ insert: vi.fn().mockResolvedValue({ error: null }) });
    let chamada = 0;
    (supabase.from as any).mockImplementation(() => {
      chamada += 1;
      if (chamada === 1) return selectChain;
      if (chamada === 2) return updateChain;
      return cpChain;
    });

    const row = await consertoService.registrarResultado("r1", {
      recuperada: 4,
      perda: 1,
      status: "recuperado",
    });

    expect(row).toMatchObject({ id: "r1", status: "recuperado" });
    const updatePayload = (updateChain.update as any).mock.calls[0][0];
    expect(updatePayload).toMatchObject({ quantidade_recuperada: 4, quantidade_perda: 1 });
    expect(typeof updatePayload.data_saida).toBe("string");

    const cpPayload = (cpChain.insert as any).mock.calls[0][0];
    expect(cpPayload).toMatchObject({
      setor_origem: "conserto",
      setor_destino: "estoque",
      quantidade: 4,
      status_integridade: "completo",
    });
  });
});
