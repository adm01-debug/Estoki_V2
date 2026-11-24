import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SearchInput } from "../SearchInput";
import { TextareaCounter } from "../TextareaCounter";
import { DateTimePicker } from "@/components/ui/date-time-picker";

/**
 * Prova em DOM real (E-172): o rótulo chega ao campo pelo nome acessível e duas
 * instâncias do mesmo componente não compartilham `id` (por isso os ids passaram
 * a vir de `useId()`).
 */
describe("E-172: nome acessível dos campos", () => {
  it("getByLabelText encontra o campo pelo texto do rótulo", () => {
    render(
      <>
        <SearchInput label="Buscar produto" value="" />
        <TextareaCounter label="Observação da conferência" value="" />
        <DateTimePicker label="Data da coleta" setDate={() => {}} />
      </>
    );

    expect(screen.getByLabelText("Buscar produto")).toBeInTheDocument();
    expect(screen.getByLabelText("Observação da conferência")).toBeInTheDocument();
    expect(screen.getByLabelText("Data da coleta")).toBeInTheDocument();
  });

  it("instâncias repetidas do mesmo componente geram ids distintos", () => {
    const { container } = render(
      <>
        <SearchInput label="Primeiro" value="" />
        <SearchInput label="Segundo" value="" />
        <TextareaCounter label="Terceiro" value="" />
        <TextareaCounter label="Quarto" value="" />
      </>
    );

    const ids = Array.from(container.querySelectorAll("[id]")).map((el) => el.id);
    expect(ids.length).toBeGreaterThanOrEqual(4);
    expect(new Set(ids).size).toBe(ids.length);
  });
});
