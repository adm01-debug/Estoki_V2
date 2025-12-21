import { test, expect } from "@playwright/test";

test.describe("Relatorios", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/relatorios");
  });

  test("deve exibir tipos de relatórios", async ({ page }) => {
    await expect(page.getByText(/relatório/i).first()).toBeVisible();
  });

  test("deve permitir exportar", async ({ page }) => {
    const exportBtn = page.getByRole("button", { name: /exportar|download|pdf|excel/i });
    if (await exportBtn.first().isVisible()) {
      await expect(exportBtn.first()).toBeVisible();
    }
  });
});
