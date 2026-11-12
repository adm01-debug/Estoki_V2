import { expect } from "@playwright/test";
import { test } from "./fixtures/auth";

/**
 * Smoke E2E do fluxo operacional crítico do WMS.
 *
 * Escopo: navegação e renderização dos módulos de recebimento → triagem →
 * estoque → picking → romaneio → expedição → kanban. Valida que as rotas
 * carregam sob sessão autenticada (mock) e que a UI não crasha (sem crash de
 * React, sem mensagens de erro no nível error com origem no app).
 *
 * Este teste NÃO cria dados — foco em regressão de renderização e roteamento.
 * Com sessão mock, páginas que consultam o Supabase renderizam o estado de
 * erro próprio da página (ex.: "Erro ao carregar triagem", "Algo deu errado")
 * — ambos são estados INTENCIONAIS da UI e não configuram falha do teste.
 * Requisições 401/PGRST301 do painel Supabase e falha do WebSocket do realtime
 * são esperadas sem sessão/anon key real — não configuram falha.
 */

const WMS_ROUTES = [
  { path: "/recebimento", label: "recebimento" },
  { path: "/triagem", label: "triagem" },
  { path: "/estoque", label: "estoque" },
  { path: "/picking", label: "picking" },
  { path: "/romaneios", label: "romaneios" },
  { path: "/expedicao", label: "expedi" },
  { path: "/kanban", label: "kanban|pipeline" },
] as const;

const CONSOLE_OK_WHITELIST = [
  /net::ERR_ABORTED/,
  /Warning:/,
  /DevTools/,
  /React DevTools/,
  /404/,
  /Failed to load resource/,
  // Realtime tenta conectar com a anon key do bundle; sem sessão real o
  // WebSocket falha com "no valid credentials" — esperado no ambiente mock.
  /WebSocket connection to 'wss:\/\/[\w-]+\.supabase\.co\/realtime\/v1\/websocket.*failed/i,
  /HTTP Authentication failed; no valid credentials/,
  /apikey=fake-anon-key/,
  // Perfil/permissões são buscados com a anon key fake do ambiente mock:
  // falham com "Invalid API key" e o app loga o erro no console — esperado.
  /Erro ao buscar perfil do usuário/,
  /Erro ao buscar permissões do usuário/,
];

function isIgnorable(text: string): boolean {
  return CONSOLE_OK_WHITELIST.some((re) => re.test(text));
}

for (const route of WMS_ROUTES) {
  test(`WMS: rota ${route.path} renderiza sem crash`, async ({ authenticatedPage: page }) => {
    const consoleErrors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error" && !isIgnorable(msg.text())) {
        consoleErrors.push(msg.text());
      }
    });
    page.on("pageerror", (err) => consoleErrors.push(`[pageerror] ${err.message}`));

    await page.goto(route.path, { waitUntil: "domcontentloaded", timeout: 20_000 });

    // Root montou (Suspense do lazy resolveu ou apresentou estado de erro próprio)
    await expect(page.locator("#root")).not.toBeEmpty({ timeout: 15_000 });

    // NÃO caiu no Error Boundary global
    const boundary = page.locator("text=/Algo deu errado|Something went wrong/i").first();
    await expect(boundary).toHaveCount(0, { timeout: 5_000 });

    // NÃO caiu na página 404
    const notFound = page.locator("text=/Página não encontrada|Page not found/i").first();
    await expect(notFound).toHaveCount(0);

    expect(consoleErrors, `Console errors em ${route.path}: ${consoleErrors.join("\n")}`).toEqual(
      []
    );
  });
}

test("WMS: fluxo picking → expedição (navegação sequencial)", async ({
  authenticatedPage: page,
}) => {
  await page.goto("/picking", { waitUntil: "domcontentloaded", timeout: 20_000 });
  await expect(page.locator("h1, h2").first()).toBeVisible();

  await page.goto("/expedicao", { waitUntil: "domcontentloaded", timeout: 20_000 });
  await expect(page.locator("h1, h2").first()).toBeVisible();

  // Volta pela navegação do browser — valida transições
  await page.goBack({ waitUntil: "domcontentloaded" });
  await expect(page).toHaveURL(/picking/);
});
