import { test, expect } from "@playwright/test";

test.describe("Autenticação", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auth");
  });

  test("deve exibir formulário de login", async ({ page }) => {
    await expect(page.getByRole("heading", { name: /login|entrar/i })).toBeVisible();
    await expect(page.getByLabel(/email/i)).toBeVisible();
    await expect(page.getByLabel(/senha|password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /entrar|login/i })).toBeVisible();
  });

  test("deve mostrar erro para credenciais inválidas", async ({ page }) => {
    await page.getByLabel(/email/i).fill("invalid@test.com");
    await page.getByLabel(/senha|password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /entrar|login/i }).click();

    await expect(page.getByText(/inválid|erro|invalid/i)).toBeVisible({ timeout: 5000 });
  });

  test("deve validar campos obrigatórios", async ({ page }) => {
    await page.getByRole("button", { name: /entrar|login/i }).click();
    
    // Verificar se há indicação de campos obrigatórios
    const emailInput = page.getByLabel(/email/i);
    await expect(emailInput).toHaveAttribute("required");
  });

  test("deve ter link para recuperar senha", async ({ page }) => {
    const forgotLink = page.getByText(/esquec|forgot|recuperar/i);
    await expect(forgotLink).toBeVisible();
  });

  test("deve redirecionar após login bem-sucedido", async ({ page }) => {
    // Este teste precisa de credenciais válidas de teste
    // Configurar em variáveis de ambiente para CI
    test.skip(!process.env.TEST_USER_EMAIL, "Credenciais de teste não configuradas");

    await page.getByLabel(/email/i).fill(process.env.TEST_USER_EMAIL!);
    await page.getByLabel(/senha|password/i).fill(process.env.TEST_USER_PASSWORD!);
    await page.getByRole("button", { name: /entrar|login/i }).click();

    await expect(page).toHaveURL("/", { timeout: 10000 });
  });
});
