import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { AlertasConfigTable, type ConfigAlerta } from "@/components/alertas/AlertasConfigTable";

const config: ConfigAlerta[] = [
  {
    id: "c1",
    tipo: "divergencia_inventario",
    descricao: "Alerta quando divergência excede threshold",
    threshold_valor: 5,
    threshold_dias: null,
    severidade: "critico",
    ativo: true,
  },
  {
    id: "c2",
    tipo: "posicao_ociosa",
    descricao: "Alerta para posições sem movimentação",
    threshold_valor: null,
    threshold_dias: 30,
    severidade: "info",
    ativo: false,
  },
];

describe("AlertasConfigTable", () => {
  it("mostra o limiar na unidade certa e o estado ativo de cada regra", () => {
    render(<AlertasConfigTable configAlertas={config} podeEditar onSalvar={vi.fn()} />);

    expect(screen.getByLabelText("Limiar de divergencia_inventario")).toHaveValue(5);
    expect(screen.getAllByText("un.").length).toBe(1);
    expect(screen.getByLabelText("Limiar de posicao_ociosa")).toHaveValue(30);
    expect(screen.getByText("dias")).toBeInTheDocument();
    expect(screen.getByLabelText("Ativar posicao_ociosa")).not.toBeChecked();
  });

  it("liga e desliga a regra direto no switch", async () => {
    const onSalvar = vi.fn().mockResolvedValue(true);
    render(<AlertasConfigTable configAlertas={config} podeEditar onSalvar={onSalvar} />);

    await userEvent.click(screen.getByLabelText("Ativar divergencia_inventario"));

    expect(onSalvar).toHaveBeenCalledWith("divergencia_inventario", { ativo: false });
  });

  it("so habilita o salvar depois de mudar limiar ou severidade", async () => {
    const onSalvar = vi.fn().mockResolvedValue(true);
    render(<AlertasConfigTable configAlertas={config} podeEditar onSalvar={onSalvar} />);

    const salvar = screen.getAllByRole("button", { name: "Salvar" })[0];
    expect(salvar).toBeDisabled();

    await userEvent.clear(screen.getByLabelText("Limiar de divergencia_inventario"));
    await userEvent.type(screen.getByLabelText("Limiar de divergencia_inventario"), "7");
    expect(salvar).toBeEnabled();

    await userEvent.click(salvar);
    expect(onSalvar).toHaveBeenCalledWith("divergencia_inventario", { threshold_valor: 7 });
  });

  it("sem permissao a tela vira leitura: sem salvar e sem switch clicavel", () => {
    render(<AlertasConfigTable configAlertas={config} />);

    expect(screen.queryByRole("button", { name: "Salvar" })).not.toBeInTheDocument();
    expect(screen.getByLabelText("Ativar divergencia_inventario")).toBeDisabled();
    expect(screen.getByText("critico")).toBeInTheDocument();
  });
});
