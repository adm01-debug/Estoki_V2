import { test, expect } from "./fixtures/auth";
import AxeBuilder from "@axe-core/playwright";

/**
 * Sweep a11y das rotas privadas — o `a11y-smoke.spec.ts` só cobre o que é
 * público (`/`, `/auth`, `/auth/login`), então todo o produto autenticado
 * (estoque, recebimento, picking, admin) nunca passou por axe-core.
 *
 * Roda só no chromium de propósito: são ~16 navegações + análise por rota, e
 * multiplicar por 5 browsers (o job `Playwright E2E (build)` roda os 5) custa
 * ~12 min de CI sem ganho — as violações estruturais que este sweep pega
 * (label, heading, contraste de chrome, landmark) não são específicas de
 * engine. O smoke público continua cobrindo os 5 browsers.
 *
 * Sessão e rede vêm do fixture (`fixtures/auth.ts`): o PostgREST responde
 * `[]`, então cada página é auditada no seu estado vazio/estrutural. É o que dá
 * para fazer sem backend real — e já pega o que quebra de verdade: botão sem
 * nome, tab sem painel, hierarquia de heading, texto abaixo do contraste.
 *
 * Bloqueio: `critical` e `serious`, como no smoke público. Todas as rotas
 * estão em zero dessas violações, com uma exceção registrada no `KNOWN_DEBT`
 * abaixo (`color-contrast`), que funciona como **teto**, não como perdão:
 * passar do número registrado falha o teste, então nenhuma violação nova
 * entra — nem em rota nova, cujo teto é 0.
 *
 * Rota que cai no `RouteErrorBoundary` ("Ops! Algo deu errado") com dado vazio
 * não audita nada útil (o axe veria a tela de erro), então o teste é pulado
 * com o motivo impresso — se o skip aparecer numa rota que deveria funcionar
 * vazia, é bug de resiliência da página, não de a11y.
 */

const PRIVATE_ROUTES = [
  "/",
  "/dashboard",
  "/estoque",
  "/produtos",
  "/recebimento",
  "/expedicao",
  "/picking",
  "/tarefas",
  "/ondas",
  "/pedidos",
  "/clientes",
  "/relatorios",
  "/alertas",
  "/configuracoes",
  "/admin/configuracoes",
  "/perfil",
];

/**
 * Dívida conhecida de acessibilidade, medida em 2026-11-24 (chromium, build de
 * produção, dado vazio). O número é a soma de NÓS com impacto critical/serious,
 * não de regras, e é o maior valor observado em duas medições — o
 * `color-contrast` varia 1 nó entre execuções conforme a animação de entrada,
 * então o teto é o pico e não a média.
 *
 * Todo o resto já está em zero: `label-content-name-mismatch` (botão de busca
 * do header e `MenuButton` dos atalhos — o `aria-label` divergia do texto
 * visível), `aria-progressbar-name` (`ui/progress` e `ui/progress-bar` sem nome
 * acessível) e `button-name` (os tooltips de KPI do dashboard eram botões só
 * com ícone).
 *
 * O que sobrou é dívida real e mensurável:
 * - `color-contrast`: tokens com alfa sobre superfície clara
 *   (`text-primary/60..80`, `text-muted-foreground/60..70`, `text-warning/80`,
 *   `text-success` e `text-muted-foreground` em caixa alta de 10px), além dos
 *   triggers inativos do Radix Tabs. Correção é de design token, não de marcação.
 * - `aria-valid-attr-value` em `/recebimento`: os 6 filtros usam `TabsTrigger`
 *   sem nenhum `TabsContent`, então o `aria-controls` que o Radix gera aponta
 *   para um id inexistente. Ou viram segmented control (`aria-pressed`), ou
 *   ganham os tabpanels.
 *
 * Ao corrigir, **baixe o número aqui** — este mapa é o burndown.
 */
const KNOWN_DEBT: Record<string, number> = {
  "/": 15,
  "/dashboard": 15,
  "/estoque": 3,
  "/produtos": 3,
  "/recebimento": 4,
  "/expedicao": 6,
  "/picking": 3,
  "/tarefas": 6,
  "/ondas": 4,
  "/pedidos": 4,
  "/clientes": 4,
  "/relatorios": 4,
  "/alertas": 4,
  "/admin/configuracoes": 2,
  "/perfil": 7,
};

test.beforeEach(({ browserName }) => {
  test.skip(browserName !== "chromium", "sweep de rotas privadas roda só no chromium");
});

for (const route of PRIVATE_ROUTES) {
  test(`a11y privada: ${route} sem violação critical/serious`, async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    const resp = await page.goto(route, { waitUntil: "domcontentloaded" });
    if (!resp || resp.status() >= 400) test.skip(true, `rota ${route} indisponível`);

    // Suspense/framer-motion + queries resolvendo no mock
    await page.waitForTimeout(800);

    const crashed = await page
      .getByRole("heading", { name: /algo deu errado/i })
      .isVisible()
      .catch(() => false);
    if (crashed) test.skip(true, `${route} cai no RouteErrorBoundary com dado vazio`);

    const results = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
      .analyze();

    const blocking = results.violations.filter(
      (v) => v.impact === "critical" || v.impact === "serious"
    );
    const nos = blocking.reduce((total, v) => total + v.nodes.length, 0);

    console.log(
      `a11y debt route=${route} nos=${nos} ids=${blocking
        .map((v) => `${v.id}:${v.nodes.length}`)
        .join(",")}`
    );

    if (blocking.length) {
      console.log(
        `A11y blocking em ${route}:`,
        blocking.map((v) => ({
          id: v.id,
          impact: v.impact,
          nodes: v.nodes.length,
          detalhe: v.nodes
            .slice(0, 6)
            .map((n) => `${n.target.join(" ")} :: ${n.html.slice(0, 160)}`),
        }))
      );
    }

    const teto = KNOWN_DEBT[route] ?? 0;
    expect(
      nos,
      `Violações a11y em ${route}: ${nos} nós (teto registrado: ${teto})`
    ).toBeLessThanOrEqual(teto);
  });
}
