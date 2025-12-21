import { describe, it, expect } from "vitest";
import { formatDate, formatRelativeTime, isSameDay, addDays } from "@/utils/date";

describe("date utils", () => {
  it("should format date in pt-BR", () => {
    const date = new Date("2025-01-15");
    expect(formatDate(date)).toContain("15");
  });

  it("should format relative time", () => {
    const now = new Date();
    expect(formatRelativeTime(now.toISOString())).toBe("agora");
  });

  it("should check same day", () => {
    const d1 = new Date("2025-01-15T10:00:00");
    const d2 = new Date("2025-01-15T15:00:00");
    expect(isSameDay(d1, d2)).toBe(true);
  });

  it("should add days", () => {
    const date = new Date("2025-01-15");
    const result = addDays(date, 5);
    expect(result.getDate()).toBe(20);
  });
});
