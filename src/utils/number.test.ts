import { describe, it, expect } from "vitest";
import { formatCurrency, formatNumber, formatPercent, clamp, percentage } from "@/utils/number";

describe("number utils", () => {
  it("should format currency", () => {
    expect(formatCurrency(1234.56)).toContain("1.234");
  });

  it("should format number", () => {
    expect(formatNumber(1234567)).toContain("1.234.567");
  });

  it("should format percent", () => {
    expect(formatPercent(0.75)).toContain("75");
  });

  it("should clamp value", () => {
    expect(clamp(15, 0, 10)).toBe(10);
    expect(clamp(-5, 0, 10)).toBe(0);
    expect(clamp(5, 0, 10)).toBe(5);
  });

  it("should calculate percentage", () => {
    expect(percentage(25, 100)).toBe(25);
    expect(percentage(1, 4)).toBe(25);
  });
});
