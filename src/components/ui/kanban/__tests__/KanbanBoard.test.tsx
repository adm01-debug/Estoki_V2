import { describe, it, expect, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { KanbanBoard } from "../KanbanBoard";

const COLUNAS = [
  { id: "pendente", title: "Pendente" },
  { id: "em_separacao", title: "Picking" },
];

const ITENS = [
  { id: "p1", columnId: "pendente", title: "PED-1" },
  { id: "p2", columnId: "em_separacao", title: "PED-2" },
];

function arrastar(itemId: string, colunaId: string) {
  const item = screen.getByTestId(`kanban-item-${itemId}`);
  const coluna = screen.getByTestId(`kanban-coluna-${colunaId}`);
  const dataTransfer = { setData: vi.fn(), getData: () => itemId };
  fireEvent.dragStart(item, { dataTransfer });
  fireEvent.dragOver(coluna, { dataTransfer });
  fireEvent.drop(coluna, { dataTransfer });
}

describe("KanbanBoard", () => {
  it("mostra os itens na coluna certa e permite arrastar entre colunas", () => {
    const onMoveItem = vi.fn();
    render(<KanbanBoard columns={COLUNAS} items={ITENS} onMoveItem={onMoveItem} />);

    expect(screen.getByText("PED-1")).toBeInTheDocument();
    arrastar("p1", "em_separacao");

    expect(onMoveItem).toHaveBeenCalledWith("p1", "em_separacao");
  });

  it("não avisa movimento quando o card cai na mesma coluna", () => {
    const onMoveItem = vi.fn();
    render(<KanbanBoard columns={COLUNAS} items={ITENS} onMoveItem={onMoveItem} />);

    arrastar("p1", "pendente");

    expect(onMoveItem).not.toHaveBeenCalled();
  });

  it("sem onMoveItem o card não é arrastável", () => {
    render(<KanbanBoard columns={COLUNAS} items={ITENS} />);

    expect(screen.getByTestId("kanban-item-p1")).toHaveAttribute("draggable", "false");
  });
});
