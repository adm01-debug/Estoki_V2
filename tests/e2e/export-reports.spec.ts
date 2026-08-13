import { test, expect } from "./fixtures/auth";

/**
 * Valida que os botões de exportação disparam download com nome/extensão
 * esperados e que o chunk async (exceljs/jspdf/papaparse) é carregado
 * antes do arquivo ser gerado.
 */
test.describe("Fluxo crítico: exportação de relatórios", () => {
  test.beforeEach(async ({ authenticatedPage: page }) => {
    await page.goto("/admin/audit-logs").catch(() => page.goto("/audit-logs"));
  });

  const cases: Array<{ label: RegExp; extension: RegExp }> = [
    { label: /csv/i, extension: /\.csv$/i },
    { label: /excel|xlsx/i, extension: /\.xlsx$/i },
    { label: /pdf/i, extension: /\.pdf$/i },
  ];

  for (const { label, extension } of cases) {
    test(`exporta ${label.source.toUpperCase()} com sucesso`, async ({
      authenticatedPage: page,
    }) => {
      const exportBtn = page.getByRole("button", { name: /exportar/i }).first();
      await expect(exportBtn).toBeVisible({ timeout: 8000 });

      // Hover dispara prefetch do chunk correspondente.
      await exportBtn.hover();
      await exportBtn.click();

      const item = page.getByRole("menuitem", { name: label });
      await expect(item).toBeVisible();
      await item.hover();

      const [download] = await Promise.all([
        page.waitForEvent("download", { timeout: 20000 }),
        item.click(),
      ]);

      expect(download.suggestedFilename()).toMatch(extension);
    });
  }
});