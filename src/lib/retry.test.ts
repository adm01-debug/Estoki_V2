// @ts-nocheck
import { describe, it, expect, vi } from "vitest";
import { withRetry } from "@/lib/retry";

describe("withRetry", () => {
  it("should return result on success", async () => {
    const fn = vi.fn().mockResolvedValue("success");
    const result = await withRetry(fn);
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it("should retry on failure", async () => {
    const fn = vi.fn()
      .mockRejectedValueOnce(new Error("fail"))
      .mockResolvedValue("success");
    
    const result = await withRetry(fn, { maxRetries: 2, baseDelayMs: 10 });
    expect(result).toBe("success");
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it("should throw after max retries", async () => {
    const fn = vi.fn().mockRejectedValue(new Error("fail"));
    
    await expect(withRetry(fn, { maxRetries: 2, baseDelayMs: 10 }))
      .rejects.toThrow("fail");
    expect(fn).toHaveBeenCalledTimes(3);
  });
});
