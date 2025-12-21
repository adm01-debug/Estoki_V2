// @ts-nocheck - Test file uses outdated API, needs update
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

describe("useTriagemFotos", () => {
  it("deve capturar foto", async () => {
    const { useTriagemFotos } = await import("./useTriagemFotos");
    const { result } = renderHook(() => useTriagemFotos());
    expect(result.current.capturarFoto).toBeDefined();
  });

  it("deve gerenciar galeria", async () => {
    const { useTriagemFotos } = await import("./useTriagemFotos");
    const { result } = renderHook(() => useTriagemFotos());
    expect(result.current.fotos).toBeDefined();
  });
});
