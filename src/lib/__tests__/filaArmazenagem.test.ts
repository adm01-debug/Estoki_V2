import { describe, expect, it } from "vitest";
import { mapearTarefasArmazenagem } from "../filaArmazenagem";

describe("mapearTarefasArmazenagem", () => {
  it("mapeia as tarefas reais para a fila", () => {
    const fila = mapearTarefasArmazenagem([
      {
        id: "t1",
        prioridade: "alta",
        quantidade: 10,
        produto: { sku: "BRINDE-001", nome: "Caneca" },
        destino: { codigo: "PWA-S01-N1-B1" },
      },
    ]);

    expect(fila).toEqual([
      {
        id: "t1",
        sku: "BRINDE-001",
        nome: "Caneca",
        quantidade: 10,
        prioridade: "alta",
        destino: "PWA-S01-N1-B1",
      },
    ]);
  });

  it("nao inventa dados quando produto ou posicao estao ausentes", () => {
    const [tarefa] = mapearTarefasArmazenagem([
      { id: "t2", prioridade: null, quantidade: null, produto: null, destino: null },
    ]);

    expect(tarefa).toEqual({
      id: "t2",
      sku: "—",
      nome: "Produto sem cadastro",
      quantidade: 0,
      prioridade: "media",
      destino: null,
    });
  });

  it("devolve fila vazia quando a consulta nao retorna nada", () => {
    expect(mapearTarefasArmazenagem(null)).toEqual([]);
    expect(mapearTarefasArmazenagem(undefined)).toEqual([]);
  });
});
