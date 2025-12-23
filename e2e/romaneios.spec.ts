import { test, expect } from '@playwright/test';

test.describe('Romaneios', () => {
  test('should load romaneios page', async ({ page }) => {
    await page.goto('/romaneios');
    await expect(page.locator('body')).toBeVisible();
  });
});
