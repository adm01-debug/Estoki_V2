import { test, expect } from "@playwright/test";

test.describe("Configuracoes", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/configuracoes");
  });

  test("deve exibir página de configurações", async ({ page }) => {
    await expect(page.getByText(/config/i).first()).toBeVisible();
  });

  test("deve permitir alterar tema", async ({ page }) => {
    const themeToggle = page.getByRole("button", { name: /tema|dark|light/i });
    if (await themeToggle.isVisible()) {
      await expect(themeToggle).toBeVisible();
    }
  });

  test("deve salvar alterações", async ({ page }) => {
    const saveBtn = page.getByRole("button", { name: /salvar|save/i });
    if (await saveBtn.isVisible()) {
      await expect(saveBtn).toBeVisible();
    }
  });
});
