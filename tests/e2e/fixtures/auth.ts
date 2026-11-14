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
 * queries PostgREST do mock resolvem instantaneamente com lista vazia
 * (`[]`), então a UI renderiza o estado vazio/estrutural de cada página —
 * nunca fica presa no PageLoader. Abort NÃO é usado aqui por causa do
 * QueryClient global (`AppProviders.tsx`): `networkMode: "offlineFirst"` põe
 * a query em paused em falha de rede e nunca expõe o erro → `isLoading` fica
 * `true` para sempre e o assert de 10s estoura (causa-raiz do flaky do
 * basic-flow/wms-flow).
 *
 * O estado de erro REAL continua validado pelo stress.spec, que registra
 * handlers depois (prioridade LIFO) e chama abort — mesmo efeito de antes,
 * sem conflito com este behave de sucesso.
 */
/**
 * Stub do Navigator LockManager para browsers que não liberam o lock do
 * auto-refresh do supabase-js de forma determinística (firefox headless).
 *
 * CAUSA-RAIZ: o supabase-js chama `navigator.locks.request(name,
 * { mode: 'exclusive', ifAvailable: true })` no auto-refresh do token. No
 * firefox headless o lock `lock:sb-<ref>-auth-token` fica momentaneamente
 * indisponível em cold start (concorrência de ticks do
 * `_onVisibilityChanged`/`_startAutoRefresh`), o callback recebe `lock ===
 * null` e o supabase lança `NavigatorLockAcquireTimeoutError` ("Acquiring an
 * exclusive Navigator LockManager lock ... immediately failed"). Esse
 * pageerror coincide 100% com runs que caem no RouteErrorBoundary
 * ("Ops! Algo deu errado") no firefox — flaky esporádico em `/estoque`,
 * nunca reproduzido em português/warm.
 *
 * O stub muta APENAS o método `navigator.locks.request` (não substitui o
 * objeto `navigator.locks`): em firefox a atribuição `navigator.locks = stub`
 * é silenciosamente ignorada (getter do prototype), então a forma que
 * funciona é reatribuir o método no objeto existente. Todo request sempre
 * concede o lock imediatamente com `{ name }`, i.e. `ifAvailable` nunca
 * retorna nulo — o auto-refresh prossegue e nenhum pageerror é lançado.
 * O compilador Vite (swc) não toca em `navigator.locks`; único efeito é em
 * teste, comportamento de produção inalterado.
 */
function stubNavigatorLocks(page: Page): void {
  page.addInitScript(() => {
    const request = navigator.locks?.request;
    navigator.locks.request = function (
      name: unknown,
      options: unknown,
      callback: ((lock: unknown) => unknown) | undefined
    ) {
      const cb = typeof options === "function" ? options : callback;
      return Promise.resolve().then(() => (cb ? cb({ name }) : cb));
    };
    try {
      // query() é usado pelo supabase apenas em log de debug; mantém o original
      // se disponível, senão um valor vazio suficiente.
      navigator.locks.query = navigator.locks.query ?? (() => Promise.resolve({ held: [], pending: [] }));
    } catch {
      /* navegador sem query — irrelevante para o fluxo de teste */
    }
  });
}

function mockSupabaseNetwork(page: Page): void {
  // Listagens PostgREST resolvem com array vazio (estado vazio/UI estrutural).
  page.route("**/rest/v1/**", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "[]" })
  );
  // Edge functions permanecem abortadas (falha rápida; páginas que as usam já
  // tratam o erro próprio — nenhum teste E2E depende do corpo delas).
  page.route("**/functions/v1/**", (route) => route.abort("failed"));
  // O logout (POST /auth/v1/logout) também não deve depender do backend real:
  // responde 200 imediato para o fluxo "Sair" navegar sem travar no assert de URL.
  page.route("**/auth/v1/logout", (route) =>
    route.fulfill({ status: 200, contentType: "application/json", body: "{}" })
  );
  // O auto-refresh do token (POST /auth/v1/token?grant_type=refresh_token) roda
  // no cold start assim que o stub de lock acima concede a exclusividade.
  // Sem este mock o fetch cai no preview server (HTML, não JSON) e a sessão
  // mock é descartada no meio do render -> logout/redirect /auth ->
  // RouteErrorBoundary (causa-raiz comprovada do flaky /estoque firefox).
  // Responde 200 com um token novo válido para manter a sessão hidratada.
  page.route("**/auth/v1/token?*", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        access_token: "e2e-refreshed-access-token",
        refresh_token: "e2e-refreshed-refresh-token",
        expires_at: Math.floor(Date.now() / 1000) + 60 * 60,
        token_type: "bearer",
        user: {
          id: "00000000-0000-0000-0000-0000000000e2",
          email: "e2e@estoki.dev",
          role: "authenticated",
        },
      }),
    })
  );
  // GET /auth/v1/user é chamado após o refresh (revalidação da sessão);
  // responde o mesmo usuário mock para o AuthContext permanecer hidratado.
  page.route("**/auth/v1/user", (route) =>
    route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        id: "00000000-0000-0000-0000-0000000000e2",
        email: "e2e@estoki.dev",
        role: "authenticated",
      }),
    })
  );
}

export async function injectSession(page: Page): Promise<void> {
  stubNavigatorLocks(page);
  mockSupabaseNetwork(page);

  const sessionJson = process.env.LOVABLE_BROWSER_SUPABASE_SESSION_JSON ?? MOCK_SESSION;

  // Precisa estabelecer a origem antes de escrever no localStorage.
  await page.goto("/", { waitUntil: "domcontentloaded" });
  await page.evaluate(
    ([key, value]) => {
      window.localStorage.setItem(key, value);
      // Impede o auto-start do OnboardingTour (2s após o mount): seu overlay
      // fixed inset-0 intercepta cliques e causa click-timeout embaralhado
      // em browsers lentos (firefox/webkit/mobile). Em CI o tour fica off.
      window.localStorage.setItem("onboarding-tour-completed", "true");
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
  // Usa auto-wait (não count()): em Mobile Safari a hidratação do header é
  // mais lenta e o botão pode não existir no primeiro instante — count()==0
  // pulava o click e o drawer nunca abria (timeout de 30s no link data-tour).
  const openMenu = page.getByRole("button", { name: "Abrir menu" });
  try {
    await openMenu.waitFor({ state: "visible", timeout: 5_000 });
    await openMenu.click();
    // Espera o drawer (motion.aside) terminar a animação de entrada.
    await page.waitForTimeout(400);
  } catch {
    // Desktop: botão não existe (lg:hidden) — segue direto para o link.
  }
  const link = page.locator(`[data-tour='${tour}']`).locator("visible=true").first();
  await link.click();
  // Fecha o drawer se abriu (overlay claro ou navegação fecha via handleNavigate).
  await page.waitForTimeout(300);
}
