import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { EmptyState, ErrorState, PageLoader } from "../AsyncStates";

/** E-181: os tres estados precisam ser anunciados e o erro precisa permitir nova tentativa. */
describe("estados de tela (E-181)", () => {
  it("erro e anunciado como alert e o botao repete a busca", async () => {
    const onRetry = vi.fn();
    const user = userEvent.setup();
    render(<ErrorState message="Sem rede" onRetry={onRetry} />);

    expect(screen.getByRole("alert")).toHaveTextContent("Sem rede");
    await user.click(screen.getByRole("button", { name: /tentar novamente/i }));
    expect(onRetry).toHaveBeenCalledOnce();
  });

  it("erro sem onRetry nao mostra botao morto", () => {
    render(<ErrorState message="Sem rede" />);
    expect(screen.queryByRole("button", { name: /tentar novamente/i })).toBeNull();
  });

  it("vazio e carregamento sao anunciados (role=status)", () => {
    const { unmount } = render(<EmptyState title="Nada aqui" description="Sem registros" />);
    expect(screen.getByRole("status")).toHaveTextContent("Nada aqui");
    unmount();

    render(<PageLoader message="Carregando logs" />);
    expect(screen.getByRole("status")).toHaveTextContent("Carregando logs");
  });
});
