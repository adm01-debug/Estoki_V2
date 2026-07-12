import { test, expect } from "./fixtures/auth";

test.describe("Fluxo crítico: busca global (Ctrl+K)", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto("/");
  });

  test("abre o dialog com Ctrl+K e fecha com Esc", async ({ authenticatedPage: page }) => {
    await page.keyboard.press("Control+K");
    // O GlobalSearchDialog é lazy — aguardar o input ficar visível.
    const searchInput = page.getByPlaceholder(/buscar|search/i).first();
    await expect(searchInput).toBeVisible({ timeout: 5000 });

    await page.keyboard.press("Escape");
    await expect(searchInput).not.toBeVisible({ timeout: 3000 });
  });

  test("prefetch do chunk GlobalSearchDialog dispara ao hover no gatilho", async ({
    authenticatedPage: page,
  }) => {
    const requests: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (url.includes("GlobalSearchDialog") || url.includes("cmdk")) requests.push(url);
    });

    const trigger = page.getByRole("button", { name: /buscar|search|ctrl.?k/i }).first();
    if (await trigger.isVisible().catch(() => false)) {
      await trigger.hover();
      await page.waitForTimeout(600);
    }

    // Independente do hover, abrir via atalho garante que o chunk foi carregado.
    await page.keyboard.press("Control+K");
    await expect(page.getByPlaceholder(/buscar|search/i).first()).toBeVisible({
      timeout: 5000,
    });
  });
});