import { test, expect } from '@playwright/test';

test.describe('Packing Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/shipping/packing');
  });

  test('should display packing station', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /embalagem|packing/i })).toBeVisible();
  });

  test('should scan order for packing', async ({ page }) => {
    await page.getByPlaceholder(/pedido|order/i).fill('ORD-001');
    await page.getByPlaceholder(/pedido|order/i).press('Enter');
    await expect(page.getByText(/itens para embalar|items to pack/i)).toBeVisible();
  });

  test('should add package dimensions', async ({ page }) => {
    await page.getByRole('button', { name: /nova caixa|new box/i }).click();
    await page.getByLabel(/comprimento|length/i).fill('30');
    await page.getByLabel(/largura|width/i).fill('20');
    await page.getByLabel(/altura|height/i).fill('15');
    await page.getByLabel(/peso|weight/i).fill('2.5');
    await page.getByRole('button', { name: /adicionar|add/i }).click();
    await expect(page.getByText(/caixa adicionada|box added/i)).toBeVisible();
  });

  test('should complete packing', async ({ page }) => {
    await page.getByRole('button', { name: /finalizar|finish/i }).click();
    await expect(page.getByText(/embalagem concluída|packing completed/i)).toBeVisible();
  });
});
