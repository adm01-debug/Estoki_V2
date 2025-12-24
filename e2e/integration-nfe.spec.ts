import { test, expect } from '@playwright/test';

test.describe('NFe Integration', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/integracoes/nfe');
  });

  test('should display NFe import page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /nf-e|nota fiscal/i })).toBeVisible();
  });

  test('should import NFe from XML', async ({ page }) => {
    const fileInput = page.locator('input[type="file"]');
    await fileInput.setInputFiles({
      name: 'nfe.xml',
      mimeType: 'application/xml',
      buffer: Buffer.from('<nfeProc><NFe><infNFe></infNFe></NFe></nfeProc>')
    });
    await expect(page.getByText(/importado|imported/i)).toBeVisible();
  });

  test('should search NFe by access key', async ({ page }) => {
    await page.getByPlaceholder(/chave de acesso|access key/i).fill('35210612345678000199550010000001231234567890');
    await page.getByRole('button', { name: /buscar|search/i }).click();
    await expect(page.getByRole('table')).toBeVisible();
  });

  test('should validate NFe', async ({ page }) => {
    await page.getByRole('row').first().getByRole('button', { name: /validar|validate/i }).click();
    await expect(page.getByText(/válida|valid/i)).toBeVisible();
  });

  test('should generate DANFE', async ({ page }) => {
    await page.getByRole('row').first().getByRole('button', { name: /danfe/i }).click();
    await expect(page.getByText(/pdf gerado|pdf generated/i)).toBeVisible();
  });
});
