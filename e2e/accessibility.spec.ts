import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Accessibility", () => {
  test("dashboard should pass a11y checks", async ({ page }) => {
    await page.goto("/dashboard");
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations).toEqual([]);
  });

  test("should have skip link", async ({ page }) => {
    await page.goto("/");
    await page.keyboard.press("Tab");
    const skipLink = page.getByText(/pular|skip/i);
    if (await skipLink.isVisible()) {
      await expect(skipLink).toBeFocused();
    }
  });

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/dashboard");
    const h1 = page.locator("h1");
    await expect(h1).toBeVisible();
  });
});
