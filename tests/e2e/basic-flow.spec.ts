import { test, expect } from "./fixtures/auth";

/**
 * Fluxos críticos do sistema WMS mapeados contra a UI real.
 *
 * Estratégia: com sessão mock (sem Supabase real) as páginas com dados
 * renderizam seus estados de erro/loading próprios ("Erro ao carregar X"
 * + "Tentar novamente", ou ErrorState). O teste valida roteamento,
 * seletores estáveis (sidebar/breadcrumb/título) e resiliência — nunca
 * depende de dados reais que exigiriam RLS.
 */

test.describe("E2E: Fluxos Críticos do Sistema WMS", () => {
  test("Módulo: Inventário (estoque) - navegação e renderização", async ({
    authenticatedPage: page,
  }) => {
    await page.goto("/");

    // Navega pelo sidebar (rota real: /estoque → EstoquePage)
    const nav = page.locator("[data-tour='estoque']").first();
    await nav.click();
    await expect(page).toHaveURL(/\/estoque$/);

    // A página monta sem cair no Error Boundary global nem em 404 —
    // com ou sem dados, o breadcrumb "Estoque" está presente no shell.
    await expect(page.getByRole("navigation", { name: /breadcrumb/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(page.getByText("Estoque", { exact: true }).first()).toBeVisible({
      timeout: 10_000,
    });
  });

  test("Módulo: Recebimento - renderização do módulo", async ({ authenticatedPage: page }) => {
    await page.goto("/");

    const nav = page.locator("[data-tour='recebimento']").first();
    await nav.click();
    await expect(page).toHaveURL(/\/recebimento$/);

    // Renderização íntegra: breadcrumb do módulo aparece (não 404 nem boundary);
    // com query falhando (sem dados), a UI expõe estado de erro com retry.
    await expect(page.getByRole("navigation", { name: /breadcrumb/i })).toBeVisible({
      timeout: 10_000,
    });
    await expect(
      page.getByText(/tentar novamente|importar nf-e|novo recebimento/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Módulo: Romaneios - verificação de entrega", async ({ authenticatedPage: page }) => {
    await page.goto("/");

    const nav = page.locator("[data-tour='romaneios']").first();
    await nav.click();
    await expect(page).toHaveURL(/\/romaneios$/);

    // Renderiza o módulo (não caiu no Error Boundary nem 404)
    await expect(
      page.getByText(/romaneios de entrega|erro ao carregar romaneios/i).first()
    ).toBeVisible({ timeout: 10_000 });
  });

  test("Resiliência: Erro 404 e Navegação Segura", async ({ authenticatedPage: page }) => {
    await page.goto("/rota-inexistente", { waitUntil: "domcontentloaded" });
    await expect(page.getByRole("heading", { name: "404" })).toBeVisible({ timeout: 8000 });
    const homeLink = page.getByRole("link", { name: "Return to Home" });
    await expect(homeLink).toBeVisible();

    // Link real leva de volta para a home
    await homeLink.click();
    await expect(page).toHaveURL(/\/$/);
  });
});
