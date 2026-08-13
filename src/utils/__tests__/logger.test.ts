import { describe, it, expect, vi, beforeEach } from "vitest";
import { logger } from "../logger";

describe("Logger utility", () => {
  beforeEach(() => {
    vi.spyOn(console, "info").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
    vi.spyOn(console, "error").mockImplementation(() => {});
  });

  it("should format info messages correctly", () => {
    logger.info("Test message", { key: "value" });
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining("[INFO] Test message"));
    expect(console.info).toHaveBeenCalledWith(expect.stringContaining('{"key":"value"}'));
  });

  it("should format error messages correctly", () => {
    const error = new Error("Original error");
    logger.error("Error occurred", error, { context: "test" });
    expect(console.error).toHaveBeenCalledWith(expect.stringContaining("[ERROR] Error occurred"));
  });
});
