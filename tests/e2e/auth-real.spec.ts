import { test, expect } from "@playwright/test";

/**
 * Fluxo autenticado REAL contra o Supabase do ambiente.
 *
 * Diferente dos demais specs, NÃO usa o fixture de sessão mock
 * (`fixtures/auth.ts`, que responde todo `rest/v1/**` com `[]`): faz login de
 * verdade e valida, com o JWT real, que as consultas chegam ao PostgREST e que
 * as RPCs de picking estão autorizadas para `authenticated`.
 *
 * Sem `E2E_USER_EMAIL`/`E2E_USER_PASSWORD` o arquivo inteiro é ignorado, então o
 * gate padrão do CI não muda de comportamento.
 */
const EMAIL = process.env.E2E_USER_EMAIL ?? "";
const PASSWORD = process.env.E2E_USER_PASSWORD ?? "";
const SUPABASE_URL = process.env.VITE_SUPABASE_URL ?? "";
const ANON_KEY = process.env.VITE_SUPABASE_ANON_KEY ?? "";

test.skip(!EMAIL || !PASSWORD, "E2E_USER_EMAIL/E2E_USER_PASSWORD não definidos");

test.describe("fluxo logado real (sem mocks)", () => {
  test("login, sessão real e RPCs de picking autorizadas", async ({ page, request }) => {
    await page.goto("/auth");
    await page.fill("#login-email", EMAIL);
    await page.fill("#login-password", PASSWORD);
    await page.locator('form button[type="submit"]').first().click();

    const loggedIn = await page
      .waitForURL((u) => !u.pathname.startsWith("/auth"), { timeout: 25_000 })
      .then(() => true)
      .catch(() => false);

    if (!loggedIn) {
      const alerts = await page
        .locator('[role="alert"], [data-sonner-toast], .text-destructive')
        .allInnerTexts()
        .catch(() => [] as string[]);
      throw new Error(
        `login não redirecionou. url=${page.url()} mensagens=${JSON.stringify(alerts)}`
      );
    }

    const token = await page.evaluate(() => {
      const key = Object.keys(localStorage).find(
        (k) => k.startsWith("sb-") && k.endsWith("-auth-token")
      );
      if (!key) return null;
      try {
        return (
          (JSON.parse(localStorage.getItem(key) ?? "{}") as { access_token?: string })
            .access_token ?? null
        );
      } catch {
        return null;
      }
    });
    expect(token, "sessão real deve conter access_token").not.toBeNull();

    // system_settings: leitura autenticada passa pelo RLS do tenant.
    // As chamadas usam a API de request (fora do navegador): um fetch dentro da
    // pagina logo apos o login e abortado pela navegacao e vira "Failed to fetch".
    const settings = await request.get(`${SUPABASE_URL}/rest/v1/system_settings?select=*&limit=1`, {
      headers: { apikey: ANON_KEY, Authorization: `Bearer ${token}` },
    });
    const settingsBody = (await settings.text()).slice(0, 200);
    expect(
      settings.status(),
      `system_settings recusou o usuário logado: ${settingsBody}`
    ).toBeLessThan(400);

    // Erro de negócio (tarefa inexistente) é esperado; erro de PERMISSÃO não.
    const rpcs = [
      ["iniciar_tarefa_picking", { p_tarefa_id: "00000000-0000-0000-0000-000000000001" }],
      [
        "concluir_tarefa_picking",
        { p_tarefa_id: "00000000-0000-0000-0000-000000000001", p_quantidade: 1 },
      ],
    ] as const;

    for (const [fn, payload] of rpcs) {
      const res = await request.post(`${SUPABASE_URL}/rest/v1/rpc/${fn}`, {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: payload,
      });
      const out = { status: res.status(), body: (await res.text()).slice(0, 400) };
      expect(out.status, `${fn} recusou o usuário logado: ${out.body}`).not.toBe(401);
      expect(out.body, `${fn} devolveu erro de permissão: ${out.body}`).not.toContain(
        "permission denied"
      );
    }

    // Edges com sessao obrigatoria (`_shared/auth.ts`): o JWT real tem de
    // continuar passando — sem isso a guarda viraria regressao nas telas que
    // as chamam (Painel, Relatorios, Simulacao).
    for (const fn of ["abc-analysis", "calculate-kpis"]) {
      const res = await request.post(`${SUPABASE_URL}/functions/v1/${fn}`, {
        headers: {
          apikey: ANON_KEY,
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        data: {},
      });
      const out = { status: res.status(), body: (await res.text()).slice(0, 200) };
      expect(out.status, `${fn} recusou o usuário logado: ${out.body}`).toBeLessThan(400);
    }

    // Configurações: a tela abre com sessão real, sem estado de erro.
    await page.goto("/configuracoes");
    await expect(page.getByText("Ops! Algo deu errado")).toHaveCount(0);
    await expect(page.getByText("Configurações").first()).toBeVisible();

    // Picking: a rota carrega sem cair no RouteErrorBoundary E a consulta da
    // lista responde de fato — ou existe tarefa pendente com "Iniciar", ou o
    // vazio explícito aparece. Skeleton eterno, erro de RLS ou lista em branco
    // por falta de permissão não passam daqui.
    await page.goto("/picking");
    await expect(page.getByText("Ops! Algo deu errado")).toHaveCount(0);
    await expect(
      page
        .getByRole("button", { name: /^Iniciar/ })
        .first()
        .or(page.getByText("Nenhuma tarefa de picking pendente."))
    ).toBeVisible({ timeout: 25_000 });
  });

  test("edge com sessao obrigatoria recusa a chave publica sem login", async ({ request }) => {
    // A chave publica esta no bundle do site: se ela sozinha executar a funcao,
    // qualquer visitante consome IA, envia e-mail e le estoque com service role.
    for (const fn of ["abc-analysis", "calculate-kpis"]) {
      const r = await request.post(`${SUPABASE_URL}/functions/v1/${fn}`, {
        headers: { apikey: ANON_KEY, Authorization: `Bearer ${ANON_KEY}` },
        data: {},
      });
      expect(r.status(), `${fn} aceitou chamada sem sessão`).toBe(401);
    }
  });
});
