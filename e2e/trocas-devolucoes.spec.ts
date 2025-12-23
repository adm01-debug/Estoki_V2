import { test, expect } from '@playwright/test';

test.describe('Trocas e Devoluções', () => {
  test('should load trocas page', async ({ page }) => {
    await page.goto('/trocas-devolucoes');
    await expect(page.locator('body')).toBeVisible();
  });
});
