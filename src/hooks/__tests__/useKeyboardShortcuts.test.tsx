import { render, screen, fireEvent } from "@testing-library/react";
import { MemoryRouter, useLocation } from "react-router-dom";
import { useKeyboardShortcuts } from "../useKeyboardShortcuts";

function Probe() {
  useKeyboardShortcuts();
  const location = useLocation();
  return (
    <div>
      <span data-testid="path">{location.pathname}</span>
      <input aria-label="campo de texto" />
      <div role="textbox" tabIndex={0} data-testid="caixa-rica" />
    </div>
  );
}

function setup(initial = "/estoque") {
  render(
    <MemoryRouter initialEntries={[initial]}>
      <Probe />
    </MemoryRouter>
  );
  return screen.getByTestId("path");
}

/** E-176: atalhos globais não podem sequestrar a digitação nem exigir combinações erradas. */
describe("useKeyboardShortcuts", () => {
  it("navega com Ctrl+H quando o foco está fora de campos", () => {
    const path = setup();
    fireEvent.keyDown(document.body, { key: "h", ctrlKey: true });
    expect(path).toHaveTextContent("/");
  });

  it("não dispara enquanto o usuário digita em input", () => {
    const path = setup();
    const input = screen.getByLabelText("campo de texto");
    input.focus();
    fireEvent.keyDown(input, { key: "r", ctrlKey: true });
    expect(path).toHaveTextContent("/estoque");
  });

  it("não dispara dentro de área com role=textbox", () => {
    const path = setup();
    fireEvent.keyDown(screen.getByTestId("caixa-rica"), { key: "d", ctrlKey: true });
    expect(path).toHaveTextContent("/estoque");
  });

  it("Ctrl+S só abre o scanner com Shift", () => {
    const path = setup();
    fireEvent.keyDown(document.body, { key: "s", ctrlKey: true });
    expect(path).toHaveTextContent("/estoque");

    fireEvent.keyDown(document.body, { key: "s", ctrlKey: true, shiftKey: true });
    expect(path).toHaveTextContent("/scanner");
  });
});
