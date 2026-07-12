import { test, expect, injectSession } from "./fixtures/auth";

test.describe("Fluxo crítico: autenticação", () => {
  test("redireciona rotas protegidas para /auth quando deslogado", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/\/auth/);
    await expect(page.locator("#login-email")).toBeVisible();
  });

  test("sessão persistida no localStorage mantém acesso após reload", async ({ page }) => {
    await injectSession(page);
    await page.goto("/wms/inventory");
    await expect(page).toHaveURL(/inventory/);
    await page.reload();
    await expect(page).toHaveURL(/inventory/);
  });

  test("credenciais inválidas exibem mensagem de erro", async ({ page }) => {
    await page.goto("/auth/login");
    await page.fill("#login-email", "invalido@estoki.dev");
    await page.fill("#login-password", "senha-errada-999");
    await page.click('button[type="submit"]');
    // Erro pode aparecer como toast (sonner) ou texto na tela.
    await expect(page.locator("body")).toContainText(/inválid|incorret|erro|invalid/i, {
      timeout: 8000,
    });
  });
});