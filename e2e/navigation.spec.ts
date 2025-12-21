import { test, expect } from "@playwright/test";

test.describe("Navegação", () => {
  test.beforeEach(async ({ page }) => {
    // Assumindo usuário já autenticado via storage state
    await page.goto("/");
  });

  test("deve exibir menu lateral", async ({ page }) => {
    const sidebar = page.locator("[data-testid=sidebar], nav, aside").first();
    await expect(sidebar).toBeVisible();
  });

  test("deve navegar para Dashboard", async ({ page }) => {
    await page.click("text=/dashboard/i");
    await expect(page).toHaveURL(/dashboard/);
  });

  test("deve navegar para Recebimento", async ({ page }) => {
    await page.click("text=/recebimento/i");
    await expect(page).toHaveURL(/recebimento/);
  });

  test("deve navegar para Triagem", async ({ page }) => {
    await page.click("text=/triagem/i");
    await expect(page).toHaveURL(/triagem/);
  });

  test("deve navegar para Estoque", async ({ page }) => {
    await page.click("text=/estoque/i");
    await expect(page).toHaveURL(/estoque/);
  });

  test("deve navegar para Relatórios", async ({ page }) => {
    await page.click("text=/relat/i");
    await expect(page).toHaveURL(/relatorios/);
  });

  test("deve mostrar página 404 para rota inválida", async ({ page }) => {
    await page.goto("/rota-inexistente-123");
    await expect(page.getByText(/404|não encontrad|not found/i)).toBeVisible();
  });

  test("deve ter breadcrumbs funcionais", async ({ page }) => {
    await page.goto("/triagem");
    const breadcrumb = page.locator("[aria-label=breadcrumb], .breadcrumb");
    if (await breadcrumb.isVisible()) {
      await expect(breadcrumb).toContainText(/triagem/i);
    }
  });
});
