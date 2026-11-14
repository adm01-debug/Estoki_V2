import { test as base, expect, type Page } from "@playwright/test";

/**
 * Fixtures compartilhados para testes E2E autenticados.
 *
 * Estratégia:
 * 1. Se `LOVABLE_BROWSER_SUPABASE_SESSION_JSON` e `LOVABLE_BROWSER_SUPABASE_STORAGE_KEY`
 *    estiverem definidos (execução via sandbox Lovable), injeta a sessão real no
 *    localStorage antes da navegação.
 * 2. Caso contrário, faz fallback para um token mock na storage key do projeto —
 *    suficiente para hidratar o AuthContext em CI onde não há Supabase real.
 *
 * A storage key é derivada do VITE_SUPABASE_URL real (mesmo algoritmo do
 * supabase-js: `sb-<project-ref>-auth-token`), para que a sessão mock seja
 * encontrada independentemente do projeto Supabase usado no ambiente.
 */
const SUPABASE_STORAGE_KEY =
  process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY ??
  (() => {
    const url = process.env.VITE_SUPABASE_URL ?? "";
    const hostname = url ? new URL(url).hostname : "";
    const projectRef = hostname.split(".")[0];
    return projectRef ? `sb-${projectRef}-auth-token` : "";
  })();

const MOCK_SESSION = JSON.stringify({
  access_token: "e2e-mock-access-token",
  refresh_token: "e2e-mock-refresh-token",
  expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
  token_type: "bearer",
  user: {
    id: "00000000-0000-0000-0000-0000000000e2",
    email: "e2e@estoki.dev",
    role: "authenticated",
  },
});

/**
 * Torna os testes determinísticos com sessão mock: sem backend real, as
 * queries PostgREST/edge functions do mock falham com retry (tanstack-query
 * `retry: 1` + backoff) e a UI fica presa no PageLoader por ~16s em runner
 * lento — enquanto os asserts usam timeout de 10s (causa-raiz do flaky do
 * basic-flow/wms-flow). O abort falha cada tentativa em milissegundos e expõe
 * o estado de erro próprio de cada página (validação de resiliência mantida).
 *
 * Registrado no `injectSession`, cobre a fixture `authenticatedPage` e os
 * specs que injetam a sessão manualmente. O route handler roda antes de toda
 * navegação; handlers registrados depois (ex.: stress.spec) têm prioridade
 * LIFO e chamam abort também — mesmo efeito, sem conflito.
 */
function mockSupabaseNetwork(page: Page): void {
  page.route("**/rest/v1/**", (route) => route.abort("failed"));
  page.route("**/functions/v1/**", (route) => route.abort("failed"));
  // O logout (POST /auth/v1/logout) também não deve depender do backend real:
  // responde 200 imediato para o fluxo "Sair" navegar sem travar no assert de URL.
  page.route("**/auth/v1/logout", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  );
}

export async function injectSession(page: Page): Promise<void> {
  mockSupabaseNetwork(page);

  const sessionJson = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON ?? MOCK_SESSION;

  // Precisa estabelecer a origem antes de escrever no localStorage.
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => {
      window.localStorage.setItem(key, value);
    },
    [SUPABASE_STORAGE_KEY, sessionJson] as const
  );
}

type AuthFixtures = {
  authenticatedPage: Page;
};

export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    await injectSession(page);
    await use(page);
  },
});

export { expect };

/**
 * Navega até uma rota pelo data-tour, funcionando em desktop (sidebar aside
 * sempre visível) e mobile (sidebar oculta; abre o drawer "Abrir menu").
 * Não valida URL — o caller decide o assert.
 */
export async function clickNavByTour(page: Page, tour: string): Promise<void> {
  // Abre o menu mobile primeiro se houver botão; em desktop o botão não existe.
  const openMenu = page.getByRole("button", { name: "Abrir menu" });
  if (await openMenu.count()) {
    await openMenu.click();
    // Espera o drawer (motion.aside) terminar a animação de entrada.
    await page.waitForTimeout(400);
  }
  const link = page.locator(`[data-tour='${tour}']`).locator("visible=true").first();
  await link.click();
  // Fecha o drawer se abriu (overlay claro ou navegação fecha via handleNavigate).
  await page.waitForTimeout(300);
}
