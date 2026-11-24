import { test, expect } from "@playwright/test";
import { test as authenticatedTest } from "./fixtures/auth";
import AxeBuilder from "@axe-core/playwright";

/**
 * Smoke a11y sweep — roda axe-core nas rotas públicas estáveis.
 * Falha em qualquer violação com impacto 'critical' ou 'serious'.
 *
 * Escopo: rotas públicas. `/auth/login` voltou a ser auditada depois do
 * ajuste de contraste da E-170: os textos do painel escuro usavam
 * `text-sidebar-foreground/30..50` (2.21–4.05:1 sobre #0d1016) e agora usam
 * `/70..80` (>= 6.8:1); o amber de marca ganhou o token `primary-bright`
 * para superfícies escuras. `text-primary` no tema claro foi escurecido
 * para 24 90% 37% (#b84f0a), que fecha 5.03:1 sobre branco.
 *
 * Aguardamos as animações (framer-motion) e o React terminar de hidratar
 * antes de rodar o axe, para não gerar falsos positivos de color-contrast
 * em estados `opacity: 0`.
 */

const PUBLIC_ROUTES = ["/", "/auth", "/auth/login"];

for (const route of PUBLIC_ROUTES) {
  test(`a11y: ${route} has no critical/serious violations`, async ({ page }) => {
    const resp = await page.goto(route, { waitUntil: "domcontentloaded" });
    if (!resp || resp.status() >= 400) test.skip(true, `route ${route} not available`);

    // Deixa suspenses/framer-motion resolverem antes da auditoria
    await page.waitForTimeout(800);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );

    if (blocking.length) {
      console.log(
        "A11y violations:",
        blocking.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length }))
      );
    }
    expect(blocking, `Blocking a11y issues on ${route}`).toEqual([]);
  });
}

/**
 * E-173 — o skip link precisa ser o primeiro elemento focável e mover o foco
 * para o `<main tabIndex={-1}>`; sem o tabIndex o hash muda mas o foco fica no
 * `<body>` (quem usa teclado/leitor de tela continua no começo da página).
 */
authenticatedTest("a11y: skip link foca o conteúdo principal", async ({ authenticatedPage }) => {
  const page = authenticatedPage;
  await page.goto("/", { waitUntil: "domcontentloaded" });

  await page.keyboard.press("Tab");

  const skipLink = page.getByRole("link", { name: "Pular para conteúdo principal" });
  await expect(skipLink).toBeVisible({ timeout: 10_000 });
  await expect(skipLink).toBeFocused();

  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
});
