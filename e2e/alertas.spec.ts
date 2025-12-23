import { test, expect } from '@playwright/test';

test.describe('Alertas', () => {
  test('should load alertas page', async ({ page }) => {
    await page.goto('/alertas');
    await expect(page.locator('body')).toBeVisible();
  });
});
