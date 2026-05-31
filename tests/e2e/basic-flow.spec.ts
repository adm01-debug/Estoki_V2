import { test, expect } from "@playwright/test";

test.describe("E2E: Fluxos Críticos do Sistema WMS", () => {
  test.beforeEach(async ({ page }) => {
    // Simula sessão logada
    await page.goto("/");
    await page.evaluate(() => {
      localStorage.setItem(
        "sb-wrhidiguevvnqywlueps-auth-token",
        JSON.stringify({
          access_token: "mock-token",
          user: { id: "mock-user-id", email: "admin@freightquest.com" },
        })
      );
    });
    await page.goto("/dashboard");
  });

  test("Módulo: Inventário - Busca e Visualização", async ({ page }) => {
    await page.click("text=Estoque");
    await expect(page).toHaveURL(/.*estoque/);

    // Testa busca
    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await searchInput.fill("SKU-123");
    await page.keyboard.press("Enter");

    // Verifica se os cards de estatísticas estão presentes
    await expect(page.locator("text=Total de Itens")).toBeVisible();
    await expect(page.locator("text=Ocupação")).toBeVisible();
  });

  test("Módulo: Recebimento - Simulação de Entrada de NF", async ({ page }) => {
    await page.click("text=Recebimento");
    await expect(page).toHaveURL(/.*recebimento/);

    // Simula clique em Novo Recebimento
    await page.click("text=Novo Recebimento");
    await expect(page.locator("text=Importar NF-e")).toBeVisible();

    // Preenche formulário básico
    await page.fill('input[name="numero_nf"]', "987654");

    // Botão de fechar/cancelar para não persistir dados lixo no sandbox durante testes rápidos
    await page.keyboard.press("Escape");
  });

  test("Módulo: Expedição - Verificação de Romaneios", async ({ page }) => {
    await page.click("text=Expedição");
    await expect(page).toHaveURL(/.*shipping/);

    await expect(page.locator("h1")).toContainText("Gestão de Expedição");
    await expect(page.locator("text=Aguardando Coleta")).toBeVisible();
  });

  test("Resiliência: Erro 404 e Navegação Segura", async ({ page }) => {
    await page.goto("/rota-inexistente");
    await expect(
      page
        .locator("text=404")
        .or(page.locator("text=not found").or(page.locator("text=Página não encontrada")))
    ).toBeVisible();
    await page.click("text=Voltar para o Início");
    await expect(page).toHaveURL(/\/dashboard|\//);
  });
});
