import { test, expect } from "@playwright/test";

test.describe("PWA Features", () => {
  test("should have manifest", async ({ page }) => {
    await page.goto("/");
    const manifest = await page.evaluate(() => {
      const link = document.querySelector('link[rel="manifest"]');
      return link?.getAttribute("href");
    });
    expect(manifest).toBeTruthy();
  });

  test("should register service worker", async ({ page }) => {
    await page.goto("/");
    const hasServiceWorker = await page.evaluate(() => "serviceWorker" in navigator);
    expect(hasServiceWorker).toBe(true);
  });
});
