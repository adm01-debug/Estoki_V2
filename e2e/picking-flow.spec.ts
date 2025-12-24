import { test, expect } from '@playwright/test';

test.describe('Picking Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/picking');
  });

  test('should display picking dashboard', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /separação|picking/i })).toBeVisible();
  });

  test('should show pending pick lists', async ({ page }) => {
    await page.getByRole('tab', { name: /pendentes|pending/i }).click();
    await expect(page.locator('[data-testid="pick-list-card"]')).toBeVisible();
  });

  test('should start picking process', async ({ page }) => {
    await page.getByRole('button', { name: /iniciar|start/i }).first().click();
    await expect(page.getByText(/em andamento|in progress/i)).toBeVisible();
  });

  test('should confirm item pick', async ({ page }) => {
    await page.goto('/picking/active');
    const scanInput = page.getByPlaceholder(/código|barcode/i);
    await scanInput.fill('PROD001');
    await scanInput.press('Enter');
    await expect(page.getByText(/confirmado|confirmed/i)).toBeVisible();
  });

  test('should complete pick list', async ({ page }) => {
    await page.goto('/picking/active');
    await page.getByRole('button', { name: /concluir|complete/i }).click();
    await expect(page.getByText(/concluído|completed/i)).toBeVisible();
  });
});
