// @ts-nocheck
import { describe, it, expect, vi, beforeEach } from "vitest";
import { cache } from "@/lib/cache";

describe("CacheService", () => {
  beforeEach(() => {
    cache.clear();
  });

  it("should set and get value", () => {
    cache.set("key", "value");
    expect(cache.get("key")).toBe("value");
  });

  it("should return null for expired items", async () => {
    cache.set("key", "value", 10);
    await new Promise(r => setTimeout(r, 20));
    expect(cache.get("key")).toBeNull();
  });

  it("should delete items", () => {
    cache.set("key", "value");
    cache.delete("key");
    expect(cache.get("key")).toBeNull();
  });
});
