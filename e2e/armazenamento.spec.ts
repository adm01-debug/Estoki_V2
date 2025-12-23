import { test, expect } from '@playwright/test';

test.describe('Armazenamento', () => {
  test('should load armazenamento page', async ({ page }) => {
    await page.goto('/armazenamento');
    await expect(page.locator('body')).toBeVisible();
  });
});
