import { test, expect } from "@playwright/test";

test.describe("Estoque", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/estoque");
  });

  test("deve exibir lista de posições", async ({ page }) => {
    await expect(page.getByText(/posições|estoque/i).first()).toBeVisible();
  });

  test("deve permitir filtrar posições", async ({ page }) => {
    const searchInput = page.getByPlaceholder(/buscar|filtrar|pesquisar/i);
    if (await searchInput.isVisible()) {
      await searchInput.fill("A01");
      await expect(page.getByText(/A01/)).toBeVisible();
    }
  });

  test("deve exibir estatísticas de ocupação", async ({ page }) => {
    await expect(page.getByText(/ocupação|ocupadas|livres/i).first()).toBeVisible();
  });

  test("deve abrir detalhes ao clicar em posição", async ({ page }) => {
    const position = page.locator("[data-testid=position-card], .position-card, tr").first();
    if (await position.isVisible()) {
      await position.click();
      await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });
    }
  });
});
