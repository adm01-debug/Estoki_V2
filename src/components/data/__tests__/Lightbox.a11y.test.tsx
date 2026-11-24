import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom";
import { Lightbox } from "../Lightbox";

describe("Lightbox acessível", () => {
  it("expõe nome acessível no diálogo via DialogTitle sr-only", () => {
    render(<Lightbox images={["a.png", "b.png"]} isOpen onClose={vi.fn()} />);

    expect(screen.getByRole("dialog", { name: "Visualizador de imagens" })).toBeInTheDocument();
  });
});
