import { test, expect } from '@playwright/test';

test.describe('Reports Export', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/relatorios');
  });

  test('should display reports page', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /relatórios|reports/i })).toBeVisible();
  });

  test('should generate inventory report', async ({ page }) => {
    await page.getByRole('button', { name: /estoque|inventory/i }).click();
    await page.getByLabel(/data inicial|start date/i).fill('2024-01-01');
    await page.getByLabel(/data final|end date/i).fill('2024-12-31');
    await page.getByRole('button', { name: /gerar|generate/i }).click();
    await expect(page.getByText(/relatório gerado|report generated/i)).toBeVisible();
  });

  test('should export to PDF', async ({ page }) => {
    await page.getByRole('button', { name: /exportar pdf|export pdf/i }).click();
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('.pdf');
  });

  test('should export to Excel', async ({ page }) => {
    await page.getByRole('button', { name: /exportar excel|export excel/i }).click();
    const download = await page.waitForEvent('download');
    expect(download.suggestedFilename()).toContain('.xlsx');
  });

  test('should filter report by warehouse', async ({ page }) => {
    await page.getByLabel(/armazém|warehouse/i).selectOption({ index: 1 });
    await page.getByRole('button', { name: /aplicar|apply/i }).click();
    await expect(page.locator('[data-testid="report-table"]')).toBeVisible();
  });

  test('should schedule recurring report', async ({ page }) => {
    await page.getByRole('button', { name: /agendar|schedule/i }).click();
    await page.getByLabel(/frequência|frequency/i).selectOption('weekly');
    await page.getByLabel(/email/i).fill('test@example.com');
    await page.getByRole('button', { name: /salvar|save/i }).click();
    await expect(page.getByText(/agendado|scheduled/i)).toBeVisible();
  });
});
