import { describe, it, expect } from "vitest";
import { rateLimiter } from "@/lib/rateLimiter";

describe("RateLimiter", () => {
  it("should allow requests within limit", () => {
    expect(rateLimiter.canProceed("test1", 5, 1000)).toBe(true);
    expect(rateLimiter.canProceed("test1", 5, 1000)).toBe(true);
  });

  it("should block requests over limit", () => {
    const key = "test2";
    for (let i = 0; i < 5; i++) {
      rateLimiter.canProceed(key, 5, 60000);
    }
    expect(rateLimiter.canProceed(key, 5, 60000)).toBe(false);
  });

  it("should track remaining requests", () => {
    const key = "test3";
    rateLimiter.canProceed(key, 5, 60000);
    rateLimiter.canProceed(key, 5, 60000);
    expect(rateLimiter.getRemainingRequests(key, 5, 60000)).toBe(3);
  });
});
