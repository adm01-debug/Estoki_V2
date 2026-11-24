import { describe, it, expect } from "vitest";
import { rowsToCSV } from "@/lib/export";

describe("rowsToCSV", () => {
  it("escapa aspas duplas dobrando o caractere dentro das aspas", () => {
    const csv = rowsToCSV(["Nome"], [['Mochila Notebook 15.6"']]);
    expect(csv).toBe('Nome\n"Mochila Notebook 15.6"""');
  });

  it("escapa virgula, ponto e virgula e quebra de linha", () => {
    const csv = rowsToCSV(["A", "B"], [["x,y", "linha\nquebrada"]]);
    expect(csv).toBe('A,B\n"x,y","linha\nquebrada"');
  });

  it("neutraliza formula ao abrir no Excel", () => {
    const csv = rowsToCSV(["SKU"], [["=1+1"]]);
    expect(csv).toBe("SKU\n'=1+1");
  });

  it("mantem valores numericos e vazios sem aspas", () => {
    const csv = rowsToCSV(["Min", "Max"], [[0, null]]);
    expect(csv).toBe("Min,Max\n0,");
  });
});
