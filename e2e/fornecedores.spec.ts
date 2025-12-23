import { test, expect } from '@playwright/test';

test.describe('Fornecedores', () => {
  test('should load fornecedores page', async ({ page }) => {
    await page.goto('/relatorio-fornecedores');
    await expect(page.locator('body')).toBeVisible();
  });
});
