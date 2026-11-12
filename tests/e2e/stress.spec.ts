import { test, expect } from "./fixtures/auth";

/**
 * Testes de carga e resiliência.
 *
 * Estratégia com sessão mock (sem Supabase real):
 * 1. Navegações sequenciais a rotas pendentes de dados — evita 5 goto
 *    concorrentes no mesmo contexto (playwright aborta a 2ª+) e mede
 *    tempo de resposta real percebido.
 * 2. Abort de rede: interrompe as queries do dado e valida que a UI
 *    permanece íntegra (sem crash boundary). O tanstack-query (retry: 1)
 *    tenta a requisição com backoff exponencial antes de expor o erro —
 *    então o estado de erro próprio da página aparece após os retries
 *    esgotarem, ~16s na prática; por isso o timeout de 30s no assert.
 */

test.describe("Testes de Carga e Estresse", () => {
  // Teste 2 (abort) usa timeout próprio — o h2 de erro chega após os retries.
  test.describe.configure({ timeout: 70_000 });

  test("simulação de múltiplas cargas ao dashboard (sequencial)", async ({
    authenticatedPage: page,
  }) => {
    const urls = ["/dashboard", "/estoque", "/triagem", "/recebimento", "/romaneios"];
    const startTime = Date.now();

    for (const url of urls) {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20_000 });
      await expect(page.locator("#root")).not.toBeEmpty({ timeout: 15_000 });
      // Sem crash boundary após cada carga
      await expect(page.locator("text=/Something went wrong/i")).toHaveCount(0);
    }

    const duration = Date.now() - startTime;
    // 5 navegações completas (sem cache) devem ficar bem abaixo disso no preview/build
    expect(duration).toBeLessThan(30_000);
  });

  test("estabilidade sob erro de rede (abort das queries)", async ({
    authenticatedPage: page,
  }) => {
    await page.route("**/rest/v1/**", (route) => route.abort("failed"));
    await page.route("**/functions/v1/**", (route) => route.abort("failed"));

    await page.goto("/estoque", { waitUntil: "domcontentloaded", timeout: 20_000 });

    // A página renderiza seu estado de erro próprio (resiliência real),
    // com retry disponível — sem crash de React. O h2 de erro chega após
    // os retries com backoff esgotarem.
    const h2 = page.getByRole("heading", { name: "Erro ao carregar estoque" });
    await expect(h2).toBeVisible({ timeout: 30_000 });
    await expect(page.getByRole("button", { name: "Tentar novamente" })).toBeVisible();
  });
});
