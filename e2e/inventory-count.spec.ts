import { test, expect } from '@playwright/test';

test.describe('Inventory Count', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/inventario');
  });

  test('should display cycle count page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /inventário|inventory/i })).toBeVisible();
  });

  test('should create new cycle count', async ({ page }) => {
    await page.getByRole('button', { name: /nova contagem|new count/i }).click();
    await page.getByLabel(/zona|zone/i).selectOption({ index: 1 });
    await page.getByRole('button', { name: /criar|create/i }).click();
    await expect(page.getByText(/contagem criada|count created/i)).toBeVisible();
  });

  test('should record count', async ({ page }) => {
    await page.getByRole('row').first().click();
    await page.getByPlaceholder(/quantidade|quantity/i).fill('50');
    await page.getByRole('button', { name: /salvar|save/i }).click();
    await expect(page.getByText(/contagem registrada|count recorded/i)).toBeVisible();
  });

  test('should show variance report', async ({ page }) => {
    await page.getByRole('tab', { name: /divergências|variances/i }).click();
    await expect(page.locator('[data-testid="variance-table"]')).toBeVisible();
  });

  test('should reconcile inventory', async ({ page }) => {
    await page.getByRole('button', { name: /reconciliar|reconcile/i }).click();
    await page.getByRole('button', { name: /confirmar|confirm/i }).click();
    await expect(page.getByText(/reconciliado|reconciled/i)).toBeVisible();
  });
});
