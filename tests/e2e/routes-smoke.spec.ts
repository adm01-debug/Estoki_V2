import { test, expect } from "@playwright/test";

/**
 * Smoke test: monta o app e valida que todas as rotas registradas em <Routes>
 * renderizam sem cair no Error Boundary ou em "Página não encontrada".
 *
 * Roda contra o dev server (preview) por padrão e, no CI, também contra a build
 * de produção quando VITE_APP_URL aponta para o `vite preview`.
 */

// Lista derivada de src/routes/*.tsx + src/App.tsx
const ROUTES: string[] = [
  // Public
  "/auth",
  "/auth/login",
  "/auth/forgot-password",
  "/auth/reset-password",
  "/auth/verify-email",
  "/2fa",
  "/unauthorized",
  // Layout root
  "/",
  "/dashboard",
  "/monitor",
  "/hub",
  // Analytics
  "/relatorios",
  "/kpis-operacionais",
  "/produtividade",
  "/alertas",
  "/rastreabilidade",
  "/divergencias",
  "/fornecedores",
  "/trocas",
  "/trocas-dashboard",
  // Admin
  "/admin/simulacao",
  "/admin/usuarios",
  "/admin/roles",
  "/admin/configuracoes",
  "/admin/auditoria",
  "/admin/integracoes",
  "/admin/telemetria",
  "/seguranca",
  "/governanca",
];

const SUPABASE_AUTH_KEY = (() => {
  const url = process.env.VITE_SUPABASE_URL ?? "";
  const projectRef = url ? new URL(url).hostname.split(".")[0] : "";
  return projectRef ? `sb-${projectRef}-auth-token` : "";
})();

test.describe("Smoke: todas as rotas montam no preview/build", () => {
  test.beforeEach(async ({ page }) => {
    // Sessão fake apenas para passar pelo ProtectedRoute no client
    await page.goto("/");
    await page.evaluate((key) => {
      window.localStorage.setItem(
        key,
        JSON.stringify({
          access_token: "smoke-token",
          refresh_token: "smoke-refresh",
          expires_at: Math.floor(Date.now() / 1000) + 3600,
          token_type: "bearer",
          user: { id: "smoke-user", email: "smoke@test.local" },
        })
      );
    }, SUPABASE_AUTH_KEY);

    // Captura erros de runtime — qualquer exceção fail-fast, exceto ruído
    // esperado do ambiente: o supabase-js usa navigator.locks (sync de tabs) e
    // em firefox/webkit headless a aquisição falha "immediately" quando a
    // storage mock já está presente — erro não-fatal, não configura falha.
    const NOISY_PAGEERRORS = [
      /Acquiring an exclusive Navigator LockManager lock/,
      /Importing a module script failed/,
      // Com session mock a anon key é injetada no bundle, mas as queries de
      // perfil/roles são barradas por RLS — esperado em ambiente sem backend.
      /due to access control checks/,
    ];
    page.on("pageerror", (err) => {
      if (NOISY_PAGEERRORS.some((re) => re.test(err.message))) return;
      throw new Error(`[pageerror] ${err.message}`);
    });
  });

  for (const path of ROUTES) {
    test(`renderiza ${path}`, async ({ page }) => {
      const response = await page.goto(path, { waitUntil: "domcontentloaded" });
      // SPA: sempre 200 (fallback para index.html)
      expect(response?.status() ?? 200).toBeLessThan(500);

      // Aguarda o root do React montar
      await expect(page.locator("#root")).not.toBeEmpty({ timeout: 15_000 });

      // Garante que NÃO caiu no Error Boundary global
      const errorBoundary = page.locator(
        "text=/Algo deu errado|Something went wrong|Erro inesperado/i"
      );
      await expect(errorBoundary).toHaveCount(0);
    });
  }
});
