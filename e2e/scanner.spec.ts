import { test, expect } from '@playwright/test';

test.describe('Scanner', () => {
  test('should load scanner page', async ({ page }) => {
    await page.goto('/scanner');
    await expect(page).toHaveURL(/scanner/);
  });

  test('should display scanner interface', async ({ page }) => {
    await page.goto('/scanner');
    await expect(page.locator('body')).toBeVisible();
  });
});
