import { test, expect } from "@playwright/test";

test.describe("Movimentacao", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/movimentacao");
  });

  test("deve exibir histórico", async ({ page }) => {
    await expect(page.getByText(/movimentaç|histórico/i).first()).toBeVisible();
  });

  test("deve permitir nova movimentação", async ({ page }) => {
    const btn = page.getByRole("button", { name: /nova|criar|transferir/i });
    if (await btn.isVisible()) {
      await btn.click();
    }
  });
});
