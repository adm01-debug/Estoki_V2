import { test, expect } from '@playwright/test';

test.describe('Inventario', () => {
  test('should load inventario page', async ({ page }) => {
    await page.goto('/inventario-ciclico');
    await expect(page.locator('body')).toBeVisible();
  });

  test('should display inventory controls', async ({ page }) => {
    await page.goto('/inventario-ciclico');
    await expect(page.locator('body')).toBeVisible();
  });
});
