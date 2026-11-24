import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockFrom } = vi.hoisted(() => ({ mockFrom: vi.fn() }));

vi.mock("@/integrations/supabase/client", () => ({
  supabase: { from: mockFrom },
}));

import {
  calcularMetricasPorFornecedor,
  recalcularFornecedorScores,
  tendenciaDasMetricas,
} from "@/services/fornecedorScoreService";

interface LoteFake {
  id: string;
  fornecedor: string | null;
  quantidade_inicial: number | null;
  status: string | null;
  created_at: string;
  data_recebimento: string | null;
  previsao_chegada: string | null;
}

interface TriagemFake {
  id: string;
  resultado: string;
  lote_id: string | null;
}

const lote = (over: Partial<LoteFake> & { id: string }): LoteFake => ({
  fornecedor: "Alfa",
  quantidade_inicial: 10,
  status: "recebido",
  created_at: "2026-01-01",
  data_recebimento: null,
  previsao_chegada: null,
  ...over,
});

const consultaVazia = () => {
  const resolvido = () => Promise.resolve({ data: [], error: null });
  return { select: () => ({ not: () => ({ limit: resolvido }), limit: resolvido }) };
};

const montarLotes = (lotes: LoteFake[], triagens: TriagemFake[] = []) => {
  mockFrom.mockImplementation((tabela: string) => {
    if (tabela === "lotes") {
      return {
        select: () => ({
          not: () => ({ limit: () => Promise.resolve({ data: lotes, error: null }) }),
        }),
      };
    }
    if (tabela === "eventos_triagem") {
      return { select: () => ({ limit: () => Promise.resolve({ data: triagens, error: null }) }) };
    }
    return consultaVazia();
  });
};

describe("calcularMetricasPorFornecedor", () => {
  beforeEach(() => mockFrom.mockClear());

  it("só mede pontualidade nos lotes que têm previsão de chegada", async () => {
    montarLotes([
      lote({ id: "l1", data_recebimento: "2026-01-12", previsao_chegada: "2026-01-10" }),
      lote({ id: "l2", data_recebimento: "2026-01-09", previsao_chegada: "2026-01-10" }),
      lote({ id: "l3", data_recebimento: "2026-01-11" }),
    ]);

    const [metrica] = await calcularMetricasPorFornecedor();

    expect(metrica.entregasTotais).toBe(3);
    expect(metrica.entregasComPrevisao).toBe(2);
    expect(metrica.entregasNoPrazo).toBe(1);
  });

  it("conta divergência pelo status do lote", async () => {
    montarLotes([
      lote({ id: "l1", status: "recebido" }),
      lote({ id: "l2", status: "divergencia" }),
      lote({ id: "l3", status: "divergencia" }),
    ]);

    const [metrica] = await calcularMetricasPorFornecedor();

    expect(metrica.entregasConformes).toBe(1);
    expect(metrica.entregasDivergentes).toBe(2);
  });

  it("agrupa triagens por lote e trata conserto/reprovado como problema", async () => {
    montarLotes(
      [lote({ id: "l1" }), lote({ id: "l2" })],
      [
        { id: "t1", resultado: "aprovado", lote_id: "l1" },
        { id: "t2", resultado: "conserto", lote_id: "l1" },
        { id: "t3", resultado: "reprovado", lote_id: "l2" },
        { id: "t4", resultado: "parcial", lote_id: "l2" },
        { id: "t5", resultado: "aprovado", lote_id: "lote-inexistente" },
      ]
    );

    const [metrica] = await calcularMetricasPorFornecedor();

    expect(metrica.triagens).toBe(4);
    expect(metrica.triagensAprovadas).toBe(1);
    expect(metrica.trocas).toBe(2);
  });

  it("separa janelas recente e anterior pela data da última entrega", async () => {
    montarLotes([
      lote({ id: "l1", data_recebimento: "2026-03-01" }),
      lote({ id: "l2", data_recebimento: "2026-01-20" }),
      lote({ id: "l3", data_recebimento: "2025-01-01" }),
    ]);

    const [metrica] = await calcularMetricasPorFornecedor();

    expect(metrica.janelaRecente).toEqual({ total: 1, conformes: 1 });
    // 40 dias antes da referência (2026-03-01) => janela anterior
    expect(metrica.janelaAnterior).toEqual({ total: 1, conformes: 1 });
  });

  it("guarda a primeira e a última entrega reais", async () => {
    montarLotes([
      lote({ id: "l1", data_recebimento: "2026-02-10" }),
      lote({ id: "l2", data_recebimento: "2026-01-05" }),
    ]);

    const [metrica] = await calcularMetricasPorFornecedor();

    expect(metrica.primeiraEntrega).toBe("2026-01-05");
    expect(metrica.ultimaEntrega).toBe("2026-02-10");
  });

  it("devolve uma métrica por fornecedor e ignora lote sem fornecedor", async () => {
    montarLotes([
      lote({ id: "l1", fornecedor: "Alfa" }),
      lote({ id: "l2", fornecedor: "Beta" }),
      lote({ id: "l3", fornecedor: null }),
    ]);

    const metricas = await calcularMetricasPorFornecedor();

    expect(metricas.map((m) => m.nome).sort()).toEqual(["Alfa", "Beta"]);
  });

  it("propaga erro da consulta de lotes", async () => {
    mockFrom.mockImplementation(() => ({
      select: () => ({
        not: () => ({ limit: () => Promise.resolve({ data: null, error: { message: "boom" } }) }),
      }),
    }));

    await expect(calcularMetricasPorFornecedor()).rejects.toEqual({ message: "boom" });
  });
});

describe("tendenciaDasMetricas", () => {
  const base = {
    nome: "Alfa",
    entregasTotais: 0,
    entregasConformes: 0,
    entregasDivergentes: 0,
    entregasNoPrazo: 0,
    entregasComPrevisao: 0,
    desviosDias: [],
    itensRecebidos: 0,
    triagens: 0,
    triagensAprovadas: 0,
    trocas: 0,
    primeiraEntrega: null,
    ultimaEntrega: null,
    janelaRecente: { total: 0, conformes: 0 },
    janelaAnterior: { total: 0, conformes: 0 },
  };

  it("sem histórico nas duas janelas fica sem dados", () => {
    expect(tendenciaDasMetricas(base)).toBe("sem_dados");
  });

  it("compara a conformidade das duas janelas", () => {
    expect(
      tendenciaDasMetricas({
        ...base,
        janelaRecente: { total: 4, conformes: 4 },
        janelaAnterior: { total: 4, conformes: 2 },
      })
    ).toBe("subindo");
  });
});

describe("recalcularFornecedorScores", () => {
  beforeEach(() => mockFrom.mockClear());

  it("grava a última entrega real, não a data do clique", async () => {
    const upsert = vi.fn(() => Promise.resolve({ error: null }));
    mockFrom.mockImplementation((tabela: string) => {
      if (tabela === "lotes") {
        return {
          select: () => ({
            not: () => ({
              limit: () =>
                Promise.resolve({
                  data: [
                    lote({ id: "l1", data_recebimento: "2026-02-10" }),
                    lote({ id: "l2", data_recebimento: "2026-01-05" }),
                  ],
                  error: null,
                }),
            }),
          }),
        };
      }
      if (tabela === "eventos_triagem") {
        return { select: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) };
      }
      return { upsert };
    });

    const resultado = await recalcularFornecedorScores();

    expect(resultado).toEqual({ fornecedores: 1, atualizados: 1, falhas: [] });
    expect(upsert).toHaveBeenCalledTimes(1);
    const [payload, opcoes] = upsert.mock.calls[0] as unknown as [Record<string, unknown>, unknown];
    expect(payload.ultima_entrega).toBe("2026-02-10");
    expect(payload.total_entregas).toBe(2);
    expect(payload.score).toBe(100);
    expect(opcoes).toEqual({ onConflict: "fornecedor" });
  });

  it("reporta falha de gravação em vez de dizer que deu tudo certo", async () => {
    mockFrom.mockImplementation((tabela: string) => {
      if (tabela === "lotes") {
        return {
          select: () => ({
            not: () => ({
              limit: () => Promise.resolve({ data: [lote({ id: "l1" })], error: null }),
            }),
          }),
        };
      }
      if (tabela === "eventos_triagem") {
        return { select: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) };
      }
      return { upsert: () => Promise.resolve({ error: { message: "RLS" } }) };
    });

    const resultado = await recalcularFornecedorScores();

    expect(resultado).toEqual({ fornecedores: 1, atualizados: 0, falhas: ["Alfa"] });
  });

  it("não chama upsert quando não há lote com fornecedor", async () => {
    const upsert = vi.fn();
    mockFrom.mockImplementation((tabela: string) => {
      if (tabela === "lotes") {
        return {
          select: () => ({ not: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) }),
        };
      }
      if (tabela === "eventos_triagem") {
        return { select: () => ({ limit: () => Promise.resolve({ data: [], error: null }) }) };
      }
      return { upsert };
    });

    await expect(recalcularFornecedorScores()).resolves.toEqual({
      fornecedores: 0,
      atualizados: 0,
      falhas: [],
    });
    expect(upsert).not.toHaveBeenCalled();
  });
});
