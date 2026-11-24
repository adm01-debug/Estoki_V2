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
 * Bloqueio: `critical` e `serious`, como no smoke público, em **dois níveis**:
 *
 * - **Marcação — gate duro, teto 0.** Nome acessível faltando/divergente,
 *   atributo ARIA inválido ou proibido, hierarquia de heading. É determinístico
 *   e está em zero nas 16 rotas; o que não está (1 nó em `/recebimento`) tem
 *   diagnóstico e teto explícito em `KNOWN_DEBT_MARCACAO`. Um nó crítico novo
 *   falha o teste, sem depender do teto de contraste.
 * - **`color-contrast` — burndown, teto por rota.** `KNOWN_DEBT` guarda o pico
 *   observado (+1 nó de margem) e é um **teto, não um perdão**: passar dele
 *   falha o teste, e rota nova tem teto 0. Ao corrigir os tokens, baixe o
 *   número — este mapa é o burndown.
 *
 * A medição é feita com `reducedMotion: "reduce"` e depois que o app montou
 * (`.initial-loader` de `index.html` fora do DOM e skeletons resolvidos). Sem
 * as duas esperas o axe mede a tela de boot (0 violações — gate passaria sem
 * auditar nada) ou o primeiro frame da animação de entrada (contagem oscilando
 * ±37 nós, gate flaky).
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
const KNOWN_DEBT_MARCACAO: Record<string, Record<string, number>> = {
  // 6 `TabsTrigger` de filtro sem `TabsContent` → `aria-controls` órfão.
  "/recebimento": { "aria-valid-attr-value": 1 },
};

const KNOWN_DEBT: Record<string, number> = {
  "/": 12,
  "/dashboard": 18,
  "/estoque": 3,
  "/produtos": 4,
  "/recebimento": 4,
  "/expedicao": 7,
  "/picking": 4,
  "/tarefas": 6,
  "/ondas": 4,
  "/pedidos": 4,
  "/clientes": 4,
  "/relatorios": 4,
  "/alertas": 4,
  "/admin/configuracoes": 2,
  "/perfil": 8,
};

// Projetos auditados: desktop chromium (baseline do burndown) e "Mobile
// Chrome" (onde o layout esconde rótulo de botão e só o ícone fica). Os demais
// projetos não rodam este sweep: `Mobile Safari` duplica o markup do Mobile
// Chrome, e firefox/webkit já têm o smoke público.
const PROJETOS_GATE = ["chromium", "Mobile Chrome"];

// Playwright exige destructuring no 1o argumento do hook; o skip depende do projeto.
// eslint-disable-next-line no-empty-pattern
test.beforeEach(({}, testInfo) => {
  test.skip(
    !PROJETOS_GATE.includes(testInfo.project.name),
    `sweep de rotas privadas roda em ${PROJETOS_GATE.join(", ")}`
  );
});

for (const route of PRIVATE_ROUTES) {
  test(`a11y privada: ${route} sem violação critical/serious`, async ({ authenticatedPage }) => {
    const page = authenticatedPage;

    // O contraste é medido em elementos que o framer-motion anima: com a
    // animação ligada o axe pega o elemento em pleno fade e a contagem oscila
    // ±2 nós. O app usa `<MotionConfig reducedMotion="user">`, então desligar a
    // animação aqui torna a medição determinística.
    await page.emulateMedia({ reducedMotion: "reduce" });

    const resp = await page.goto(route, { waitUntil: "domcontentloaded" });
    if (!resp || resp.status() >= 400) test.skip(true, `rota ${route} indisponível`);

    // A rota só é auditável depois de montar: enquanto o `.initial-loader` do
    // `index.html` está no DOM o axe mede a tela de boot e devolve 0 violações,
    // o que passaria no gate sem auditar nada. Esperar a saída dele cobre os
    // two estados que geravam flake (loader presente e primeiro frame da
    // animação) e o settle das queries do mock.
    await expect(page.locator(".initial-loader")).toHaveCount(0, { timeout: 15000 });
    // Skeletons de carregamento usam cores "muted" que o axe reprova; esperar a
    // saída deles evita medir um frame de loading.
    await page
      .locator('[class*="animate-pulse"], .skeleton')
      .first()
      .waitFor({ state: "detached", timeout: 8000 })
      .catch(() => {});
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
    const contrasteNos = blocking
      .filter((v) => v.id === "color-contrast")
      .reduce((total, v) => total + v.nodes.length, 0);
    const outros = blocking.filter((v) => v.id !== "color-contrast");

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

    // Marcação é gate duro: nome faltando, atributo ARIA inválido e afins são
    // determinísticos e o teto é 0, exceto o que já está registrado com
    // diagnóstico em `KNOWN_DEBT_MARCACAO`. Deixá-los passar sob o teto de
    // contraste esconderia uma regressão (1 nó crítico novo "cabe" no teto).
    const marcacao = outros.map((v) => ({
      id: v.id,
      nos: v.nodes.length,
      teto: KNOWN_DEBT_MARCACAO[route]?.[v.id] ?? 0,
    }));
    expect(
      marcacao.filter((v) => v.nos > v.teto).map((v) => `${v.id}:${v.nos}/${v.teto}`),
      `Violação a11y de marcação em ${route}`
    ).toEqual([]);

    // Contraste é burndown: o teto é o pico observado + 1 nó de margem para a
    // variação de frame (não é perdão — rota nova tem teto 0). Só vale para o
    // desktop: no mobile o contraste muda com o layout (KPIs empilhados,
    // sidebar em sheet), então o teto não é transferível.
    if (test.info().project.name === "chromium") {
      const teto = KNOWN_DEBT[route] ?? 0;
      expect(
        contrasteNos,
        `Contraste em ${route}: ${contrasteNos} nós (teto registrado: ${teto})`
      ).toBeLessThanOrEqual(teto);
    }
  });
}
