import { test, expect } from '@playwright/test';

test.describe('Curva ABC', () => {
  test('should load curva abc page', async ({ page }) => {
    await page.goto('/curva-abc');
    await expect(page.locator('body')).toBeVisible();
  });
});
