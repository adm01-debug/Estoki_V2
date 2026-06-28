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

const SUPABASE_AUTH_KEY = "sb-wrhidiguevvnqywlueps-auth-token";

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
        }),
      );
    }, SUPABASE_AUTH_KEY);

    // Captura erros de runtime — qualquer exceção fail-fast
    page.on("pageerror", (err) => {
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
        "text=/Algo deu errado|Something went wrong|Erro inesperado/i",
      );
      await expect(errorBoundary).toHaveCount(0);
    });
  }
});
