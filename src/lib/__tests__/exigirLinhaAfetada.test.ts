import { describe, it, expect } from "vitest";
import { exigirLinhaAfetada } from "../exigirLinhaAfetada";

describe("exigirLinhaAfetada", () => {
  it("aceita quando ao menos uma linha foi afetada", () => {
    expect(() => exigirLinhaAfetada({ data: [{ id: "1" }], error: null }, "editar")).not.toThrow();
  });
  it("0 linhas (bloqueado pela RLS) vira erro de permissão", () => {
    expect(() => exigirLinhaAfetada({ data: [], error: null }, "remover a categoria")).toThrow(
      "Sem permissão para remover a categoria"
    );
    expect(() => exigirLinhaAfetada({ data: null, error: null }, "editar")).toThrow(
      "Sem permissão"
    );
  });
  it("repassa o erro do PostgREST", () => {
    const error = {
      message: "violação",
      details: "",
      hint: "",
      code: "42501",
      name: "PostgrestError",
    };
    expect(() => exigirLinhaAfetada({ data: null, error: error as never }, "editar")).toThrow(
      "violação"
    );
  });
});
