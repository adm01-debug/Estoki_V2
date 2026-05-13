import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

test.describe("Acessibilidade", () => {
  test("a página inicial deve estar em conformidade com as diretrizes de acessibilidade", async ({ page }) => {
    await page.goto("/");
    
    // Aguarda o carregamento inicial do conteúdo
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });

  test("a página de estoque deve estar em conformidade com as diretrizes de acessibilidade", async ({ page }) => {
    // Nota: Pode precisar de autenticação se a página for protegida
    await page.goto("/estoque");
    await page.waitForLoadState("networkidle");
    
    const accessibilityScanResults = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    expect(accessibilityScanResults.violations).toEqual([]);
  });
});