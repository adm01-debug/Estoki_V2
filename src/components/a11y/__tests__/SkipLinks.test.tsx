import { render, screen } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom";
import { SkipLinks } from "../SkipLinks";

describe("SkipLinks", () => {
  it("expõe os alvos existentes no AppLayout: #main-content e #main-nav", () => {
    render(<SkipLinks />);

    const main = screen.getByRole("link", { name: "Pular para conteúdo principal" });
    const nav = screen.getByRole("link", { name: "Pular para navegação" });

    expect(main).toHaveAttribute("href", "#main-content");
    expect(nav).toHaveAttribute("href", "#main-nav");
  });

  it("usa um landmark de navegação rotulado", () => {
    render(<SkipLinks />);

    expect(screen.getByRole("navigation", { name: "Links de atalho" })).toBeInTheDocument();
  });

  it("respeita alvos customizados", () => {
    render(<SkipLinks links={[{ id: "conteudo", label: "Ir ao conteúdo" }]} />);

    const custom = screen.getByRole("link", { name: "Ir ao conteúdo" });
    expect(custom).toHaveAttribute("href", "#conteudo");
    expect(screen.queryByRole("link", { name: "Pular para navegação" })).not.toBeInTheDocument();
  });
});
