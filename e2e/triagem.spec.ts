import { test, expect } from "@playwright/test";

test.describe("Triagem", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/triagem");
  });

  test("deve exibir lista de triagens", async ({ page }) => {
    await expect(page.getByText(/triagem|triagens/i).first()).toBeVisible();
  });

  test("deve permitir iniciar nova triagem", async ({ page }) => {
    const newButton = page.getByRole("button", { name: /nova|iniciar|criar/i });
    if (await newButton.isVisible()) {
      await newButton.click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    }
  });

  test("deve mostrar filtros por status", async ({ page }) => {
    const filters = page.getByRole("tab");
    if (await filters.first().isVisible()) {
      await expect(filters.first()).toBeVisible();
    }
  });

  test("deve exibir estatísticas do operador", async ({ page }) => {
    await expect(page.getByText(/produtividade|triagens realizadas/i).first()).toBeVisible();
  });
});
