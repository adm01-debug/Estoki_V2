import { describe, expect, it } from "vitest";
import {
  calcularScoreFornecedor,
  calcularTendencia,
  classificacaoPorScore,
  diferencaEmDias,
  estrelasPorScore,
  formatarPercentual,
} from "@/lib/fornecedorScore";

describe("calcularScoreFornecedor", () => {
  it("sem entregas não inventa score", () => {
    expect(
      calcularScoreFornecedor({ totalEntregas: 0, entregasConformes: 0, desviosDias: [] })
    ).toEqual({ conformidade: null, leadTimeMedioDias: null, score: null });
  });

  it("penaliza atraso médio em dobro sobre a conformidade", () => {
    // conformidade 100%, desvio médio 3 dias => 100 - 3*2 = 94
    expect(
      calcularScoreFornecedor({ totalEntregas: 4, entregasConformes: 4, desviosDias: [3, 3] })
    ).toEqual({ conformidade: 100, leadTimeMedioDias: 3, score: 94 });
  });

  it("usa o valor absoluto do desvio (adiantamento também é desvio)", () => {
    const { leadTimeMedioDias } = calcularScoreFornecedor({
      totalEntregas: 2,
      entregasConformes: 2,
      desviosDias: [-4, 2],
    });
    expect(leadTimeMedioDias).toBe(3);
  });

  it("nunca passa de 100 nem fica abaixo de 0", () => {
    expect(
      calcularScoreFornecedor({ totalEntregas: 3, entregasConformes: 3, desviosDias: [] }).score
    ).toBe(100);
    expect(
      calcularScoreFornecedor({ totalEntregas: 10, entregasConformes: 0, desviosDias: [60] }).score
    ).toBe(0);
  });

  it("limita conformes ao total de entregas", () => {
    const { conformidade } = calcularScoreFornecedor({
      totalEntregas: 2,
      entregasConformes: 9,
      desviosDias: [],
    });
    expect(conformidade).toBe(100);
  });
});

describe("classificacaoPorScore", () => {
  it.each([
    [100, "A"],
    [90, "A"],
    [89.9, "B"],
    [75, "B"],
    [74.9, "C"],
    [60, "C"],
    [59.9, "D"],
    [0, "D"],
    [null, null],
  ])("score %s => %s", (score, esperado) => {
    expect(classificacaoPorScore(score as number | null)).toBe(esperado);
  });
});

describe("estrelasPorScore", () => {
  it("não dá estrela para quem não tem score", () => {
    expect(estrelasPorScore(null)).toBeNull();
    expect(estrelasPorScore(95)).toBe(5);
    expect(estrelasPorScore(49)).toBe(1);
  });
});

describe("formatarPercentual", () => {
  it("mostra travessão quando não há medição", () => {
    expect(formatarPercentual(null)).toBe("—");
    expect(formatarPercentual(88.456)).toBe("88.5%");
  });
});

describe("diferencaEmDias", () => {
  it("positivo é atraso, negativo é adiantamento", () => {
    expect(diferencaEmDias("2026-01-10", "2026-01-08")).toBe(2);
    expect(diferencaEmDias("2026-01-08", "2026-01-10")).toBe(-2);
    expect(diferencaEmDias("2026-01-10", "2026-01-10")).toBe(0);
  });

  it("ignora datas ausentes ou inválidas", () => {
    expect(diferencaEmDias(null, "2026-01-10")).toBeNull();
    expect(diferencaEmDias("2026-01-10", undefined)).toBeNull();
    expect(diferencaEmDias("data-invalida", "2026-01-10")).toBeNull();
  });

  it("compara só a data, sem sofrer com fuso", () => {
    expect(diferencaEmDias("2026-01-10T23:00:00-03:00", "2026-01-10T01:00:00Z")).toBe(0);
  });
});

describe("calcularTendencia", () => {
  it("sem as duas janelas não há tendência", () => {
    expect(calcularTendencia(100, null)).toBe("sem_dados");
    expect(calcularTendencia(null, 100)).toBe("sem_dados");
  });

  it("5 pontos percentuais definem a virada", () => {
    expect(calcularTendencia(95, 90)).toBe("subindo");
    expect(calcularTendencia(90, 95)).toBe("descendo");
    expect(calcularTendencia(92, 90)).toBe("estavel");
  });
});
