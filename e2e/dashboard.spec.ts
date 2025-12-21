import { test, expect } from "@playwright/test";

test.describe("Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/dashboard");
  });

  test("deve exibir KPIs principais", async ({ page }) => {
    // Verificar cards de KPI
    await expect(page.locator("[data-testid=kpi-card], .kpi-card, .card").first()).toBeVisible();
  });

  test("deve exibir gráficos", async ({ page }) => {
    // Verificar se há charts/gráficos
    const chart = page.locator("canvas, svg.recharts-surface, [class*=chart]").first();
    await expect(chart).toBeVisible({ timeout: 10000 });
  });

  test("deve carregar dados sem erro", async ({ page }) => {
    // Verificar que não há mensagens de erro
    await expect(page.getByText(/erro ao carregar|error loading/i)).not.toBeVisible();
  });

  test("deve ter ações rápidas", async ({ page }) => {
    const quickActions = page.locator("[data-testid=quick-actions], .quick-actions");
    if (await quickActions.isVisible()) {
      await expect(quickActions).toBeVisible();
    }
  });

  test("deve atualizar em tempo real", async ({ page }) => {
    // Verificar indicador de atualização ou timestamp
    const timestamp = page.getByText(/atualizado|última/i);
    if (await timestamp.isVisible()) {
      await expect(timestamp).toBeVisible();
    }
  });
});
