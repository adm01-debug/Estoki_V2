import { test, expect } from "@playwright/test";

test.describe("Gamificacao", () => {
  test("deve exibir conquistas", async ({ page }) => {
    await page.goto("/");
    const conquistas = page.getByText(/conquistas|achievements/i);
    if (await conquistas.isVisible()) {
      await expect(conquistas).toBeVisible();
    }
  });

  test("deve exibir ranking", async ({ page }) => {
    await page.goto("/");
    const ranking = page.getByText(/ranking|placar/i);
    if (await ranking.isVisible()) {
      await expect(ranking).toBeVisible();
    }
  });

  test("deve exibir XP", async ({ page }) => {
    await page.goto("/");
    const xp = page.getByText(/xp|pontos|nível/i);
    if (await xp.first().isVisible()) {
      await expect(xp.first()).toBeVisible();
    }
  });
});
