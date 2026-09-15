import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ExportButton } from "../ExportButton";

describe("ExportButton", () => {
  beforeEach(() => vi.clearAllMocks());

  it("renderiza label default 'Exportar' e não fica busy", () => {
    render(<ExportButton onExport={vi.fn()} />);
    const btn = screen.getByRole("button", { name: /exportar/i });
    expect(btn).toBeInTheDocument();
    expect(btn).toHaveAttribute("aria-busy", "false");
  });

  it("respeita a prop disabled", () => {
    render(<ExportButton onExport={vi.fn()} disabled />);
    expect(screen.getByRole("button", { name: /exportar/i })).toBeDisabled();
  });

  it("exibe spinner e texto 'Exportando...' quando isExporting=true", () => {
    render(<ExportButton onExport={vi.fn()} isExporting />);
    const btn = screen.getByRole("button");
    expect(btn).toBeDisabled();
    expect(btn).toHaveAttribute("aria-busy", "true");
    expect(btn.textContent).toMatch(/exportando/i);
  });

  it("lista apenas os formatos passados via prop", async () => {
    const user = userEvent.setup();
    render(<ExportButton onExport={vi.fn()} formats={["csv", "json"]} />);
    await user.click(screen.getByRole("button", { name: /exportar/i }));
    expect(await screen.findByText(/Exportar CSV/i)).toBeInTheDocument();
    expect(screen.getByText(/Exportar JSON/i)).toBeInTheDocument();
    expect(screen.queryByText(/Exportar Excel/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/Exportar PDF/i)).not.toBeInTheDocument();
  });

  it("chama onExport com o formato correto ao clicar em cada item", async () => {
    const onExport = vi.fn().mockResolvedValue(undefined);
    const user = userEvent.setup();
    render(<ExportButton onExport={onExport} formats={["csv", "xlsx", "pdf"]} />);

    await user.click(screen.getByRole("button", { name: /exportar/i }));
    await user.click(await screen.findByText(/Exportar CSV/i));
    await waitFor(() => expect(onExport).toHaveBeenCalledWith("csv"));

    await user.click(screen.getByRole("button", { name: /exportar/i }));
    await user.click(await screen.findByText(/Exportar Excel/i));
    await waitFor(() => expect(onExport).toHaveBeenCalledWith("xlsx"));

    await user.click(screen.getByRole("button", { name: /exportar/i }));
    await user.click(await screen.findByText(/Exportar PDF/i));
    await waitFor(() => expect(onExport).toHaveBeenCalledWith("pdf"));
  });

  it("mostra texto 'Preparando XLSX...' enquanto onExport está pendente", async () => {
    let resolveExport: (() => void) | undefined;
    const onExport = vi.fn(() => new Promise<void>((resolve) => (resolveExport = resolve)));
    const user = userEvent.setup();
    render(<ExportButton onExport={onExport} formats={["xlsx"]} />);

    await user.click(screen.getByRole("button", { name: /exportar/i }));
    await user.click(await screen.findByText(/Exportar Excel/i));

    await waitFor(() => expect(screen.getByRole("button")).toHaveTextContent(/Preparando XLSX/i));
    expect(screen.getByRole("button")).toBeDisabled();

    resolveExport?.();
    await waitFor(() =>
      expect(screen.getByRole("button")).not.toHaveAttribute("aria-busy", "true")
    );
  });
});
