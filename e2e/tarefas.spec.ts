import { test, expect } from '@playwright/test';

test.describe('Tarefas', () => {
  test('should load tarefas page', async ({ page }) => {
    await page.goto('/tarefas');
    await expect(page.locator('body')).toBeVisible();
  });
});
