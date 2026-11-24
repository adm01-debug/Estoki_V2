import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { KPIMetasTable } from "./KPIMetasTable";
import type { MetaKPI } from "@/features/analytics/hooks/useKPIsOperacionais";

vi.mock("@/components/ui/alert-dialog", async () => {
  const { createContext, useContext } = await import("react");
  const CloseContext = createContext<() => void>(() => {});
  const Close = ({ children, onClick }: any) => {
    const close = useContext(CloseContext);
    return (
      <button
        onClick={() => {
          onClick?.();
          close();
        }}
      >
        {children}
      </button>
    );
  };

  return {
    AlertDialog: ({ open, onOpenChange, children }: any) =>
      open ? (
        <CloseContext.Provider value={() => onOpenChange?.(false)}>
          <div role="alertdialog">{children}</div>
        </CloseContext.Provider>
      ) : null,
    AlertDialogContent: ({ children }: any) => <div>{children}</div>,
    AlertDialogHeader: ({ children }: any) => <div>{children}</div>,
    AlertDialogFooter: ({ children }: any) => <div>{children}</div>,
    AlertDialogTitle: ({ children }: any) => <h2>{children}</h2>,
    AlertDialogDescription: ({ children }: any) => <p>{children}</p>,
    AlertDialogCancel: Close,
    AlertDialogAction: Close,
  };
});

const meta = {
  id: "meta-1",
  nome: "Pedidos por dia",
  metrica: "pedidos_separados",
  tipo: "maior_melhor",
  valor_meta: 100,
  unidade: "un",
} as MetaKPI;

function setup(onDelete = vi.fn()) {
  render(<KPIMetasTable metas={[meta]} onEdit={vi.fn()} onDelete={onDelete} onNew={vi.fn()} />);
  return { onDelete };
}

describe("KPIMetasTable — exclusão com confirmação (E-156)", () => {
  it("não exclui ao clicar na lixeira: pede confirmação primeiro", () => {
    const { onDelete } = setup();

    fireEvent.click(screen.getByLabelText("Excluir meta Pedidos por dia"));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    expect(screen.getByText(/Pedidos por dia será removida/)).toBeInTheDocument();
  });

  it("exclui somente depois de confirmar", () => {
    const { onDelete } = setup();

    fireEvent.click(screen.getByLabelText("Excluir meta Pedidos por dia"));
    fireEvent.click(screen.getByRole("button", { name: "Excluir" }));

    expect(onDelete).toHaveBeenCalledTimes(1);
    expect(onDelete).toHaveBeenCalledWith("meta-1");
  });

  it("cancelar fecha o diálogo sem excluir", () => {
    const { onDelete } = setup();

    fireEvent.click(screen.getByLabelText("Excluir meta Pedidos por dia"));
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }));

    expect(onDelete).not.toHaveBeenCalled();
    expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
  });
});
