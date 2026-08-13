import { expect } from "@playwright/test";
import { test } from "./fixtures/auth";

/**
 * Smoke E2E do fluxo operacional crítico do WMS.
 *
 * Escopo: navegação e renderização dos módulos de recebimento → triagem →
 * picking → romaneio → entrega. Valida que as rotas carregam sob sessão
 * autenticada e que a UI não crasha (sem crash de React, sem erros no console
 * de nível error com origem no app).
 *
 * Este teste NÃO cria dados — foco em regressão de renderização e roteamento,
 * que é o modo mais comum de quebra silenciosa no WMS.
 */

const WMS_ROUTES = [
  { path: "/recebimento", heading: /recebimento/i },
  { path: "/triagem", heading: /triagem/i },
  { path: "/picking", heading: /picking|separa/i },
  { path: "/shipping", heading: /expedi|romaneio/i },
  { path: "/kanban-pipeline", heading: /kanban|pipeline/i },
] as const;

for (const route of WMS_ROUTES) {
  test(`WMS: rota ${route.path} renderiza sem crash`, async ({ authenticatedPage: page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") {
        const text = msg.text();
        // Ignora ruído esperado (net::ERR_ABORTED, warnings de dev)
        if (!/net::ERR_ABORTED|Warning:|DevTools|Download the React DevTools/.test(text)) {
          consoleErrors.push(text);
        }
      }
    });

    await page.goto(route.path, { waitUntil: "networkidle", timeout: 20_000 });

    // Se a UI tiver crash boundary, ele exibe "Algo deu errado"
    const crashText = page.getByText(/algo deu errado|something went wrong/i);
    await expect(crashText).toHaveCount(0);

    // Deve renderizar um heading identificável do módulo
    const heading = page.locator("h1, h2").filter({ hasText: route.heading }).first();
    await expect(heading).toBeVisible({ timeout: 10_000 });

    expect(consoleErrors, `Console errors em ${route.path}: ${consoleErrors.join("\n")}`).toEqual([]);
  });
}

test("WMS: fluxo picking → romaneio (navegação sequencial)", async ({ authenticatedPage: page }) => {
  await page.goto("/picking", { waitUntil: "networkidle", timeout: 20_000 });
  await expect(page.locator("h1, h2").first()).toBeVisible();

  await page.goto("/shipping", { waitUntil: "networkidle", timeout: 20_000 });
  await expect(page.locator("h1, h2").first()).toBeVisible();

  // Volta pela navegação do browser — valida transições
  await page.goBack({ waitUntil: "networkidle" });
  await expect(page).toHaveURL(/picking/);
});