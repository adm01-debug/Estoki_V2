import { test, expect } from '@playwright/test';

test.describe('Full Receiving Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/recebimento');
  });

  test('should create new receiving', async ({ page }) => {
    await page.getByRole('button', { name: /novo|new/i }).click();
    await page.getByLabel(/fornecedor|supplier/i).selectOption({ index: 1 });
    await page.getByRole('button', { name: /criar|create/i }).click();
    await expect(page.getByText(/recebimento criado|receiving created/i)).toBeVisible();
  });

  test('should add items to receiving', async ({ page }) => {
    await page.getByRole('row').first().click();
    await page.getByRole('button', { name: /adicionar item|add item/i }).click();
    await page.getByLabel(/produto|product/i).selectOption({ index: 1 });
    await page.getByLabel(/quantidade|quantity/i).fill('100');
    await page.getByRole('button', { name: /salvar|save/i }).click();
    await expect(page.getByText(/item adicionado|item added/i)).toBeVisible();
  });

  test('should confirm receiving', async ({ page }) => {
    await page.getByRole('row').first().click();
    await page.getByRole('button', { name: /confirmar|confirm/i }).click();
    await expect(page.getByText(/confirmado|confirmed/i)).toBeVisible();
  });

  test('should complete putaway', async ({ page }) => {
    await page.goto('/recebimento/putaway');
    await page.getByRole('row').first().getByRole('button', { name: /armazenar|putaway/i }).click();
    await page.getByLabel(/localização|location/i).selectOption({ index: 1 });
    await page.getByRole('button', { name: /confirmar|confirm/i }).click();
    await expect(page.getByText(/armazenado|stored/i)).toBeVisible();
  });
});
