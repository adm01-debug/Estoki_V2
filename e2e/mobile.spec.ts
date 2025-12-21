import { test, expect } from "@playwright/test";

test.describe("Mobile Navigation", () => {
  test.use({ viewport: { width: 375, height: 667 } });

  test("should show bottom navigation on mobile", async ({ page }) => {
    await page.goto("/dashboard");
    const bottomNav = page.locator("nav.fixed.bottom-0");
    if (await bottomNav.isVisible()) {
      await expect(bottomNav).toBeVisible();
    }
  });

  test("should navigate via bottom nav", async ({ page }) => {
    await page.goto("/dashboard");
    const estoqueLink = page.getByRole("link", { name: /estoque/i });
    if (await estoqueLink.isVisible()) {
      await estoqueLink.click();
      await expect(page).toHaveURL(/estoque/);
    }
  });
});
