import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { RichTextEditor as FormRichTextEditor } from "../RichTextEditor";
import { RichTextEditor as UiRichTextEditor } from "@/components/ui/editor/RichTextEditor";

// Garante que o Tiptap está completo e alinhado (core + pm + react + starter-kit na
// mesma versão): antes, @tiptap/core/pm faltavam e qualquer tela que usasse o editor
// quebrava ao abrir.
describe("RichTextEditor (forms)", () => {
  it("renderiza o conteúdo inicial e a barra de formatação", async () => {
    const { container } = render(<FormRichTextEditor value="<p>Observação do ajuste</p>" />);
    expect(await screen.findByText("Observação do ajuste")).toBeInTheDocument();
    expect(container.querySelectorAll("button")).toHaveLength(4);
  });

  it("botão de negrito executa o comando sem erro", async () => {
    const { container } = render(<FormRichTextEditor value="<p>texto</p>" onChange={vi.fn()} />);
    await screen.findByText("texto");
    expect(() => fireEvent.click(container.querySelectorAll("button")[0])).not.toThrow();
  });
});

describe("RichTextEditor (ui/editor)", () => {
  it("renderiza conteúdo, placeholder configurado e 5 controles", async () => {
    const { container } = render(
      <UiRichTextEditor content="<p>Nota de recebimento</p>" onChange={vi.fn()} placeholder="Digite aqui" />
    );
    expect(await screen.findByText("Nota de recebimento")).toBeInTheDocument();
    expect(container.querySelectorAll("button")).toHaveLength(5);
  });
});
