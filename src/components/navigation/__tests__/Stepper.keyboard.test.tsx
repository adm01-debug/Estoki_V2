import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Stepper } from "../Stepper";

/** E-176: o passo precisa ser um botão de verdade para entrar na ordem de tabulação. */
describe("Stepper por teclado", () => {
  it("expõe cada passo como botão e marca o atual com aria-current", () => {
    render(<Stepper steps={["Triagem", "Coleta", "Conferência"]} current={1} />);

    const steps = screen.getAllByRole("button");
    expect(steps).toHaveLength(3);
    expect(steps[1]).toHaveAttribute("aria-current", "step");
    expect(steps[0]).not.toHaveAttribute("aria-current");
  });

  it("Tab alcança os passos e Enter/Espaço disparam onChange", async () => {
    const onChange = vi.fn();
    const user = userEvent.setup();
    render(<Stepper steps={["Triagem", "Coleta"]} current={0} onChange={onChange} />);

    await user.tab();
    const steps = screen.getAllByRole("button");
    expect(steps[0]).toHaveFocus();

    await user.keyboard("{Enter}");
    expect(onChange).toHaveBeenCalledWith(0);

    await user.tab();
    expect(steps[1]).toHaveFocus();
    await user.keyboard(" ");
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it("sem onChange os passos ficam desabilitados (nada de clique morto)", () => {
    render(<Stepper steps={["Triagem", "Coleta"]} current={0} />);
    for (const step of screen.getAllByRole("button")) expect(step).toBeDisabled();
  });
});
