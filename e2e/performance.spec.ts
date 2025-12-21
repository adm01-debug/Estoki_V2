import { test, expect } from "@playwright/test";

test.describe("Performance", () => {
  test("dashboard should load within 3 seconds", async ({ page }) => {
    const start = Date.now();
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    const loadTime = Date.now() - start;
    expect(loadTime).toBeLessThan(3000);
  });

  test("should have no console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", msg => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    expect(errors.filter(e => !e.includes("favicon"))).toEqual([]);
  });

  test("images should have width and height", async ({ page }) => {
    await page.goto("/dashboard");
    const images = page.locator("img");
    const count = await images.count();
    for (let i = 0; i < count; i++) {
      const img = images.nth(i);
      const width = await img.getAttribute("width");
      const height = await img.getAttribute("height");
      if (!width || !height) {
        const style = await img.getAttribute("style");
        expect(style).toContain("width");
      }
    }
  });
});
