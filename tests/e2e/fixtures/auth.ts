import { test as base, expect, type Page } from "@playwright/test";

/**
 * Fixtures compartilhados para testes E2E autenticados.
 *
 * Estratégia:
 * 1. Se `LOVABLE_BROWSER_SUPABASE_SESSION_JSON` e `LOVABLE_BROWSER_SUPABASE_STORAGE_KEY`
 *    estiverem definidos (execução via sandbox Lovable), injeta a sessão real no
 *    localStorage antes da navegação.
 * 2. Caso contrário, faz fallback para um token mock no storage key do projeto —
 *    suficiente para hidratar o AuthContext em CI onde não há Supabase real.
 */
const SUPABASE_STORAGE_KEY =
  process.env.LOVABLE_BROWSER_SUPABASE_STORAGE_KEY ??
  "sb-wrhidiguevvnqywlueps-auth-token";

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

export async function injectSession(page: Page): Promise<void> {
  const sessionJson =
    process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON ?? MOCK_SESSION;

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