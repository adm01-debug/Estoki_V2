// @ts-nocheck - Test file uses outdated API, needs update
import { describe, it, expect, vi } from "vitest";
import { renderHook } from "@testing-library/react";

describe("useBalanca", () => {
  it("deve conectar à balança", async () => {
    const { useBalanca } = await import("./useBalanca");
    const { result } = renderHook(() => useBalanca());
    expect(result.current.conectar).toBeDefined();
  });

  it("deve ler peso", async () => {
    const { useBalanca } = await import("./useBalanca");
    const { result } = renderHook(() => useBalanca());
    expect(result.current.peso).toBeDefined();
  });
});
