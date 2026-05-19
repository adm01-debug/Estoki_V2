import { test, expect } from '@playwright/test';

test.describe('Fluxo Principal do Usuário', () => {
  test.beforeEach(async ({ page }) => {
    // Em produção real, faríamos login aqui. No sandbox, assumimos sessão ou mockamos.
    await page.goto('/');
  });

  test('deve navegar para a página de estoque e filtrar resultados', async ({ page }) => {
    await page.click('text=Estoque');
    await expect(page).toHaveURL(/.*estoque/);

    const searchInput = page.locator('input[placeholder*="Buscar"]');
    await expect(searchInput).toBeVisible();
    await searchInput.fill('PRODUTO_TESTE');
    
    // Validar se o estado de carregamento/vazio aparece corretamente
    await expect(page.locator('text=Nenhum item encontrado').or(page.locator('.lucide-package'))).toBeVisible();
  });

  test('deve abrir o menu de configurações', async ({ page }) => {
    await page.click('text=Configurações');
    await expect(page).toHaveURL(/.*configuracoes/);
    await expect(page.locator('h1')).toContainText('Configurações');
  });

  test('deve validar comportamento responsivo do sidebar', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    const menuButton = page.locator('button[aria-label*="menu"]');
    if (await menuButton.isVisible()) {
      await menuButton.click();
      await expect(page.locator('aside')).toBeVisible();
    }
  });
});
