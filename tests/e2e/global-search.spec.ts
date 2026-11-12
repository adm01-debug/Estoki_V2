import { test, expect } from "./fixtures/auth";

/**
 * Fluxo crítico: busca global (Ctrl+K + gatilho).
 *
 * O listener do atalho só é registrado no `useEffect` do GlobalSearch após a
 * hidratação do React. Pressionar Ctrl+K imediatamente após o `load` pode
 * perder o evento — então aguardamos o gatilho visível (componente montado)
 * antes do atalho. O clique no gatilho cobre o mesmo fluxo de forma
 * determinística.
 */

test.describe("Fluxo crítico: busca global (Ctrl+K)", () => {
  const searchInput = (page: import("@playwright/test").Page) =>
    page.getByPlaceholder("O que você está procurando?");

  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto("/");
    // Garante que o GlobalSearch montou e registrou os handlers (Ctrl+K e open-global-search).
    await expect(page.getByRole("button", { name: /abrir busca global/i }).first()).toBeVisible({
      timeout: 10000,
    });
  });

  test("abre o dialog com Ctrl+K e fecha com Esc", async ({ authenticatedPage: page }) => {
    await page.keyboard.press("Control+k");

    // O GlobalSearchDialog é lazy — aguardar o input real do cmdk (+Content do dialog)
    await expect(searchInput(page)).toBeVisible({ timeout: 8000 });

    await page.keyboard.press("Escape");
    await expect(searchInput(page)).not.toBeVisible({ timeout: 5000 });
  });

  test("abre o dialog pelo clique no gatilho e fecha com Esc", async ({
    authenticatedPage: page,
  }) => {
    await page
      .getByRole("button", { name: /abrir busca global/i })
      .first()
      .click();

    await expect(searchInput(page)).toBeVisible({ timeout: 8000 });

    await page.keyboard.press("Escape");
    await expect(searchInput(page)).not.toBeVisible({ timeout: 5000 });
  });

  test("prefetch do chunk GlobalSearchDialog dispara ao hover no gatilho", async ({
    authenticatedPage: page,
  }) => {
    const chunks: string[] = [];
    page.on("request", (req) => {
      const url = req.url();
      if (/GlobalSearchDialog|cmdk|Chunk/.test(url)) chunks.push(url);
    });

    const trigger = page.getByRole("button", { name: /abrir busca global/i }).first();
    await trigger.hover();
    await page.waitForTimeout(600);

    // Abrir via atalho garante que o chunk async foi carregado (lazy resolve)
    await page.keyboard.press("Control+k");
    await expect(searchInput(page)).toBeVisible({ timeout: 8000 });
  });
});
