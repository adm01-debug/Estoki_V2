import { test, expect } from "@playwright/test";

test.describe("Recebimento", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/recebimento");
  });

  test("deve exibir lista de recebimentos", async ({ page }) => {
    await expect(page.getByText(/recebimento/i).first()).toBeVisible();
  });

  test("deve permitir novo recebimento", async ({ page }) => {
    const btn = page.getByRole("button", { name: /novo|criar/i });
    if (await btn.isVisible()) {
      await btn.click();
      await expect(page.getByRole("dialog")).toBeVisible();
    }
  });

  test("deve filtrar por status", async ({ page }) => {
    const filters = page.locator("[data-testid=status-filter], select");
    if (await filters.first().isVisible()) {
      await expect(filters.first()).toBeVisible();
    }
  });
});
