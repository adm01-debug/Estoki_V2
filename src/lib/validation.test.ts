import { describe, it, expect } from "vitest";
import { validate, validationRules } from "@/lib/validation";

describe("validation utils", () => {
  it("should validate required", () => {
    expect(validationRules.required("")).not.toBeNull();
    expect(validationRules.required("test")).toBeNull();
  });

  it("should validate email", () => {
    expect(validationRules.email("invalid")).not.toBeNull();
    expect(validationRules.email("test@test.com")).toBeNull();
  });

  it("should validate minLength", () => {
    expect(validationRules.minLength(5)("abc")).not.toBeNull();
    expect(validationRules.minLength(5)("abcdef")).toBeNull();
  });

  it("should validate min/max", () => {
    expect(validationRules.min(10)(5)).not.toBeNull();
    expect(validationRules.max(10)(15)).not.toBeNull();
    expect(validationRules.min(10)(15)).toBeNull();
  });
});
