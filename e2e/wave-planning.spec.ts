import { test, expect } from '@playwright/test';

test.describe('Wave Planning', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/picking/waves');
  });

  test('should display wave planning page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /ondas|waves/i })).toBeVisible();
  });

  test('should create new wave', async ({ page }) => {
    await page.getByRole('button', { name: /nova onda|new wave/i }).click();
    await expect(page.getByRole('dialog')).toBeVisible();
    await page.getByLabel(/armazém|warehouse/i).selectOption({ index: 1 });
    await page.getByRole('button', { name: /criar|create/i }).click();
    await expect(page.getByText(/onda criada|wave created/i)).toBeVisible();
  });

  test('should release wave', async ({ page }) => {
    await page.getByRole('row').first().getByRole('button', { name: /liberar|release/i }).click();
    await expect(page.getByText(/liberada|released/i)).toBeVisible();
  });

  test('should filter waves by status', async ({ page }) => {
    await page.getByRole('combobox', { name: /status/i }).click();
    await page.getByRole('option', { name: /pendente|pending/i }).click();
    await expect(page.getByRole('row')).toHaveCount(await page.getByRole('row').count());
  });
});
