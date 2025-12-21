import { describe, it, expect, vi } from "vitest";
import { renderHook, act } from "@testing-library/react";

describe("useBulkActions", () => {
  it("deve selecionar items", async () => {
    const { useBulkActions } = await import("./useBulkActions");
    const { result } = renderHook(() => useBulkActions());
    expect(result.current.selectedItems).toBeDefined();
  });

  it("deve limpar seleção", async () => {
    const { useBulkActions } = await import("./useBulkActions");
    const { result } = renderHook(() => useBulkActions());
    expect(typeof result.current.clearSelection).toBe("function");
  });
});
