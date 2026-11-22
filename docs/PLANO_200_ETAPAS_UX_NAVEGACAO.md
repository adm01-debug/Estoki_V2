# Plano de 200 etapas — Navegabilidade e Usabilidade (Estoki V2)

**Data:** 22/11/2026
**Escopo:** navegação, transição entre telas, fluxos multi-etapa, acessibilidade de navegação, busca/modais/multi-tarefa.
**Repo:** `/home/user/Estoki_V2` (somente leitura nesta análise).

## Método (o que foi lido e medido)

Leitura direta de código (arquivo:linha citado em cada etapa): `src/App.tsx`, `src/routes/{publicRoutes,adminRoutes,wmsRoutes,analyticsRoutes,featureRoutes}.tsx`,
`src/components/layout/AppLayout.tsx`, `src/components/organisms/layout/{Header,Sidebar,MobileNavigation}.tsx`,
`src/components/layout/{Header.tsx,header/Header.tsx,Breadcrumbs.tsx,MobileNavigation.tsx,SidebarContent.tsx,PageTransition.tsx}`,
`src/components/layout/sidebar/{sidebarNavData.ts,SidebarNavButton.tsx,SidebarAccordionGroup.tsx}`,
`src/components/common/{Breadcrumbs,GlobalSearch,GlobalSearchDialog,RouteErrorBoundary,RouteLoadingFallback,GlobalLoadingBar,ShortcutsHUD,SkipLink,StepProgress,PersistentStepper,LeaveGuard,OnboardingTour,AppProviders}.tsx`,
`src/components/molecules/navigation/BackButton.tsx`, `src/components/ui/page-header.tsx`, `src/components/templates/BasePageTemplate.tsx`,
`src/components/navigation/*` (Stepper, Steps, Wizard, Spotlight, ContextMenu, Navbar), `src/components/mobile/*` (BottomNav, PullToRefresh, SwipeableListItem),
`src/contexts/TransitionContext.tsx`, `src/lib/transitions/{presets,registry}.ts`, `src/lib/prefetch.ts`,
`src/hooks/{useAppLayoutState,useSwipeBack,usePageTransition,useKeyboardShortcuts,use-keyboard-shortcuts,useNavigationGuard,useUnsavedChanges,useHistory,useRoutePreload,useReducedMotion,use-mobile}.ts`,
`src/utils/haptics.ts`, `src/config/analytics.ts`, `src/lib/init.ts`, `src/main.tsx`, `src/pages/NotFound.tsx`, `src/pages/Unauthorized.tsx`, `src/pages/Hub.tsx`,
e os fluxos reais `src/features/quality/pages/{TriagemPage,FormularioTriagem}.tsx`, `src/features/receiving/pages/{RecebimentoPage,ConferenciaRecebimento}.tsx`,
`src/features/picking/pages/PickingPage.tsx`, `src/features/shipping/pages/ShippingPage.tsx`.

Medições executadas nesta sessão (comando → resultado):

| Comando                                              | Resultado                                                                |
| ---------------------------------------------------- | ------------------------------------------------------------------------ |
| `grep -rn "navigate(-1)" src \| wc -l`               | **4**                                                                    |
| `grep -rn "navigate(" src \| wc -l`                  | **69**                                                                   |
| `grep -rn "<Link" src \| wc -l`                      | **13**                                                                   |
| `grep -rln "useNavigate" src \| wc -l`               | **33 arquivos**                                                          |
| `grep -rn "useSearchParams" src`                     | **6 linhas em 3 arquivos** (TriagemPage, RecebimentoPage, Armazenamento) |
| `grep -rn "window.history" src`                      | **3** (BackButton.tsx:36-37, useAppLayoutState.ts:35)                    |
| `grep -rn "useBlocker\|usePrompt\|beforeunload" src` | **9** (useUnsavedChanges, useNavigationGuard, analytics.ts:235)          |
| `grep -rn "ScrollRestoration\|scrollTo(0" src`       | **1** (usePreventScroll.ts:14) — **nenhum `ScrollRestoration`**          |
| `grep -rn "<Tabs" src \| wc -l`                      | **265** tags Tabs\* em **36 arquivos**; **33** `<Tabs ` raiz             |
| `grep -rn "AnimatePresence" src \| wc -l`            | **122**                                                                  |
| `grep -rln "<AppLayout" src \| wc -l`                | **53 arquivos**                                                          |
| `grep -rln "DialogContent" src \| wc -l`             | **51**; Sheet **5**, Drawer **1**                                        |
| `grep -rn "h-screen" src \| wc -l` / `100vh` / `dvh` | **25 / 3 / 0**                                                           |
| `grep -rn "aria-current" src \| wc -l`               | **8** (3 em código morto)                                                |
| `grep -rn "createBrowserRouter\|RouterProvider" src` | **0**                                                                    |
| `grep -n "react-router" package.json`                | `"react-router-dom": "^7.18.5"` (package.json:162)                       |

## Como usar este plano

- **1 etapa = 1 PR pequena.** Branch `claude/<fix|feat|chore|ci>-<slug>-<AAMMDD-HHMM>`, commit atômico PT-BR, corpo da PR com causa + evidência.
- Antes de cada PR: `npx eslint <arquivos>`, `npm run typecheck` (**atenção:** hoje é no-op — `achados-C-arq.md`), `npx vitest run <caminho>`.
- Etapas marcadas **⚠️ regra 8** mexem em CI/workflow/banco/segredo/arquitetura: **PR aberta, chamar o dono**, não mergear sozinho.
- Ordem sugerida nos 10 lotes no fim do arquivo. Nenhuma etapa depende de dependência nova salvo onde dito.
- `npm ci` está quebrado neste repo (`achados-C-arq.md`): nenhuma etapa aqui exige instalar pacote novo, exceto as marcadas.

---

## Diagnóstico de navegação hoje

**Existe e funciona:**

- Shell único: `App.tsx:27` monta tudo sob `<Route path="/" element={<AppLayout/>}>`; 86 paths, 82 lazy, cada rota com `RouteErrorBoundary` + `Suspense` + `RouteLoadingFallback` tipado (`featureRoutes.tsx`, `RouteLoadingFallback.tsx:30-80`).
- Voltar em 3 lugares: `BackButton.tsx:29-49` (header, via `organisms/layout/Header.tsx:77`), `Breadcrumbs.tsx:143` (barra de breadcrumb) e `MobileNavigation.tsx:100-113` (bottom bar). Todos com haptics (`BackButton.tsx:31`, `haptics.ts:9`) e fallback para rota-pai.
- Atalho `Alt+←` (`useAppLayoutState.ts:77`), swipe-back a 30px da borda (`useSwipeBack.ts:19,35`), `Ctrl+K` busca global (`GlobalSearch.tsx:29`), prefetch de rota no hover da sidebar (`SidebarNavButton.tsx:90,111` → `lib/prefetch.ts:37`).
- `GlobalLoadingBar.tsx:4-20` barra de progresso global ligada a `useIsFetching`/`useIsMutating`.
- `LeaveGuard` em 3 telas de ação irreversível (`FormularioTriagem.tsx:246`, `ConferenciaRecebimento.tsx:256`, `Configuracoes.tsx:114`).

**Está morto (código que não roda):**

- `src/components/mobile/BottomNav.tsx`, `PullToRefresh.tsx` — nenhum import fora de `mobile/index.ts`.
- `src/components/navigation/*` inteiro: `Stepper`, `Steps`, `Wizard`, `Spotlight`, `ContextMenu`, `Navbar` — **zero** importadores.
- Duplicatas não importadas: `layout/Header.tsx`, `layout/header/Header.tsx`, `layout/Breadcrumbs.tsx`, `layout/MobileNavigation.tsx`, `layout/SidebarContent.tsx`, `SimpleSidebar` (só em `layout/index.ts`). O real é `organisms/layout/*` + `common/Breadcrumbs.tsx`.
- `exit` de todas as transições: `PageTransition.tsx:26` define `exit`, mas `AppLayout.tsx:108` renderiza `{children || <Outlet/>}` **sem `AnimatePresence`** → saída nunca anima; 30+ páginas pagam framer-motion por nada.
- `useHistory.ts` (histórico multi-passo com undo/redo) — zero uso. `useNavigationGuard.ts` — zero uso (só `useUnsavedChanges` é consumido).
- Telemetria de navegação: `analytics.ts:226-230` instrumenta `history.pushState`, mas só roda via `initPerformanceTracking()` dentro de `lib/init.ts:38`, e **`initializeApp` nunca é importado** (`main.tsx` não o chama) → **0 page_view de SPA**.

**Falta / está errado:**

- **`useBlocker` sem data router:** `useUnsavedChanges.ts:23` e `useNavigationGuard.ts:13` usam `useBlocker` de `react-router-dom@^7`, mas `App.tsx:22` usa `<BrowserRouter>`/`<Routes>` e não existe `createBrowserRouter` em `src`. Em v7 `useBlocker` exige data router → a guarda das 3 telas irreversíveis é **NÃO VERIFICADO em runtime** e é a hipótese nº 1 de "saiu e perdeu tudo".
- **Props `title`/`showBack` de `AppLayout` são inertes em 51 páginas:** `AppLayout.tsx:52` faz `if (isNested) return <>{children}</>` — logo `<AppLayout title="Conferência" showBack>` (`ConferenciaRecebimento.tsx:255`, `PickingPage.tsx:82,184`) descarta título e Voltar.
- **Telas sem URL:** `PickingPage.tsx:80` troca a tela inteira por `activeTask` em `useState` → Voltar do browser sai do Picking em vez de voltar à lista; `FormularioTriagem.tsx:66` guarda `activeStep` (5 etapas, 641 linhas) em state → F5/Voltar perde a etapa; 33 `<Tabs>` raiz e só `RecebimentoPage.tsx:196` e `TriagemPage.tsx:74-77` leem `searchParams`.
- **Dois Voltar diferentes:** `BackButton` usa `ChevronLeft` + `navigate(parentRoute, {replace:true})` no fallback; `MobileNavigation.tsx:110` usa `ArrowLeft` + `handleBack` que faz `navigate(parentRoute)` **sem** replace (`useAppLayoutState.ts:40`); `page-header.tsx:32` é um terceiro Voltar, `ArrowLeft`, que ignora histórico e sempre faz `navigate(backUrl)`.
- **Breadcrumb duplicado:** `AppLayout.tsx:107` já renderiza `Breadcrumbs`, e `BasePageTemplate.tsx:45` renderiza outro — as 8 páginas que usam o template mostram dois breadcrumbs (`TriagemPage`, `RecebimentoPage`, `EstoquePage`, `Dashboard`, `BackendHealthPage`, `SimulationPage`, `HelpPage`, `ModoOffline`).
- **Breadcrumb cego a detalhe:** `Breadcrumbs.tsx:9-72` é um mapa estático de 72 rotas; `/recebimento/:id`, `/triagem/:id`, `/clientes/:id`, `/pedidos/:id`, `/armazens/:id` caem em `label = segment` ou "Detalhes" (`:99-101`), e o último item não tem `aria-current="page"` (`:181`).
- **Rotas sem porta de entrada:** registradas em `src/routes/*` e ausentes de `sidebarNavData.ts`: `admin/api`, `admin/auditoria-critica`, `admin/circuit-breakers`, `admin/saude-backend`, `admin/telemetria`, `ajustes`, `conferencia`, `formulario-triagem`, `triador`, `inventory/movements`, `hub`, `configuracoes`.
- **Sem restauração de scroll** (`ScrollRestoration` = 0) e **sem foco movido** ao trocar de rota → leitor de tela continua no item clicado.
- **404 fora do shell e em inglês:** `NotFound.tsx:16-19` "Oops! Page not found" + `<a href="/">` (reload total), dentro de `h-screen bg-muted` sem header/sidebar.
- Navegação é 69 `navigate(` imperativos contra 13 `<Link>`: não há "abrir em nova aba", e o `<button>` da sidebar (`SidebarNavButton.tsx:108`) não é link.
- Contraste do Voltar/ativo: `--primary: 24 95% 53%` com `--primary-foreground: 0 0% 100%` (`index.css:27-28` e `:91-92`) = **2,85:1**, abaixo de 4,5:1 (WCAG 2.2 1.4.3) — e é a cor do indicador ativo da sidebar e do estado de breadcrumb atual.
- `confirm()` nativo em 5 telas (`achados-A-ui.md`) apesar de `ui/confirm-dialog.tsx` existir; `Spotlight.tsx` sem `DialogTitle`.

---

## Matriz impacto × esforço

| Quadrante                                             | Perfil                                                                                                                                              | Etapas                                                                                                                                                                                                                                                                                                                                                                                                                                                                                            |
| ----------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Q1 — Alto impacto, baixo esforço (fazer já)**       | Corrige quebra real com diff pequeno: Voltar unificado, breadcrumb duplicado, URL em abas, 404, SkipLink, foco na troca de rota, contraste do foco. | U-001, U-002, U-003, U-004, U-005, U-006, U-008, U-009, U-010, U-012, U-013, U-016, U-020, U-023, U-030, U-051, U-052, U-053, U-054, U-056, U-060, U-063, U-086, U-087, U-088, U-089, U-090, U-093, U-096, U-101, U-106, U-121, U-122, U-151, U-152, U-171, U-172, U-176, U-191, U-192                                                                                                                                                                                                            |
| **Q2 — Alto impacto, esforço médio/alto (projeto)**   | Mexe em arquitetura de rota, fluxo multi-etapa, persistência e telemetria.                                                                          | U-007, U-011, U-014, U-015, U-017, U-018, U-019, U-021, U-022, U-024, U-025, U-026, U-027, U-028, U-029, U-031, U-032, U-033, U-034, U-035, U-036, U-037, U-038, U-039, U-040, U-123, U-124, U-125, U-126, U-127, U-128, U-129, U-130, U-131, U-132, U-133, U-134, U-135, U-136, U-137, U-138, U-139, U-140, U-141, U-142, U-143, U-144, U-145, U-153, U-154, U-155, U-156, U-157, U-158, U-159, U-160, U-173, U-174, U-175, U-177, U-178, U-179, U-180, U-181, U-193, U-194, U-195, U-196, U-197 |
| **Q3 — Impacto médio, baixo esforço (polimento)**     | Consistência visual, micro-interação, rótulo, atalho, ícone, haptics.                                                                               | U-041, U-042, U-043, U-044, U-045, U-046, U-047, U-048, U-049, U-050, U-055, U-057, U-058, U-059, U-061, U-062, U-064, U-065, U-066, U-067, U-068, U-069, U-070, U-071, U-072, U-073, U-074, U-075, U-091, U-092, U-094, U-095, U-097, U-098, U-099, U-100, U-102, U-103, U-104, U-105, U-107, U-108, U-146, U-147, U-161, U-162, U-163, U-182, U-183, U-184, U-198                                                                                                                               |
| **Q4 — Impacto a provar, esforço alto (medir antes)** | Depende de dado que hoje não existe: KPI, A/B, heatmap, multi-janela, voz/som.                                                                      | U-076, U-077, U-078, U-079, U-080, U-081, U-082, U-083, U-084, U-085, U-109, U-110, U-111, U-112, U-113, U-114, U-115, U-116, U-117, U-118, U-119, U-120, U-148, U-149, U-150, U-164, U-165, U-166, U-167, U-168, U-169, U-170, U-185, U-186, U-187, U-188, U-189, U-190, U-199, U-200                                                                                                                                                                                                            |

---

## 1 · Navegação e controle de fluxo (U-001 a U-050)

### 1.1 Botão Voltar: posição, visibilidade e comportamento

**U-001 · Hook único `useBackNavigation`** — Hoje há três lógicas de Voltar divergentes

(`BackButton.tsx:29-49`, `useAppLayoutState.ts:26-42`, `page-header.tsx:32`); duas checam
`window.history.state.idx`, uma não, e só uma usa `replace`. Exemplo prático: criar
`src/hooks/useBackNavigation.ts` exportando `{ goBack, canGoBack, backLabel }` com a lógica de
`BackButton.tsx:37-48` (idx>0 → `navigate(-1)`; senão rota-pai; senão `fallbackPath`), e passar
`BackButton` e `useAppLayoutState.handleBack` a consumi-lo. Benefício: um comportamento só, testável
em um arquivo. Impacto: Alto · Esforço: M · Ref.: NN/g "Consistency and standards"

**U-002 · `page-header.tsx` passa a usar o Voltar real** — `page-header.tsx:32` faz `navigate(backUrl)`

direto, ignorando o histórico: quem chegou de 3 telas diferentes volta sempre para o mesmo lugar.
Exemplo prático: em `src/components/ui/page-header.tsx` trocar o `<Button>` interno por
`<BackButton fallbackPath={backUrl} />` e manter `backUrl` apenas como fallback. Benefício: Voltar
deixa de ser um atalho fixo e passa a respeitar de onde o usuário veio. Impacto: Alto · Esforço: P ·
Ref.: Material Design "Navigation: up vs back"

**U-003 · Ícone único do Voltar** — `BackButton.tsx:66` usa `ChevronLeft`, `MobileNavigation.tsx:110`

usa `ArrowLeft`, `page-header.tsx:4` usa `ArrowLeft`: três ícones para a mesma ação. Exemplo prático:
padronizar `ArrowLeft` (mais explícito que chevron fora de listas) nos três arquivos e documentar na
skill `estoki-v2`. Benefício: o usuário reconhece o Voltar sem reler a tela. Impacto: Médio · Esforço:
P · Ref.: Apple HIG "Consistency"

**U-004 · Cor e peso iguais nos três Voltar** — `BackButton.tsx:63` tem borda + `bg-background/50` +

sombra; `MobileNavigation.tsx:107` é texto `text-muted-foreground` sem moldura. Exemplo prático:
extrair as classes do `BackButton` para um `backButtonVariants` em
`src/components/molecules/navigation/BackButton.tsx` e aplicar no botão mobile. Benefício: mesmo
affordance em desktop e mobile. Impacto: Médio · Esforço: P · Ref.: Material Design "Component
consistency"

**U-005 · Voltar sempre visível, nunca condicional, exceto na home** — `AppLayout.tsx:49` esconde o

Voltar em `/` e `/dashboard`, mas `/dashboard` não é raiz de nada: quem entra via `Ctrl+D`
(`useKeyboardShortcuts.ts:29-36`) fica sem saída visível. Exemplo prático: em `AppLayout.tsx:49`
trocar a condição por `showBack || !isHome`, mantendo apenas `/` sem Voltar. Benefício: elimina tela
sem saída no segundo dashboard mais usado. Impacto: Alto · Esforço: P · Ref.: NN/g "User control and
freedom"

**U-006 · Rótulo textual no Voltar em telas largas** — `BackButton.tsx:59-67` é só ícone; em desktop há

espaço para dizer para onde volta. Exemplo prático: aceitar prop `label?: string` e renderizar
`<span className="hidden lg:inline">{label ?? "Voltar"}</span>`; `organisms/layout/Header.tsx:77`
passa o label do crumb anterior calculado por `Breadcrumbs.tsx:87-109`. Benefício: destino previsível,
menos cliques exploratórios. Impacto: Médio · Esforço: M · Ref.: NN/g "Visibility of system status"

**U-007 · Voltar contextual em fluxo de execução** — Em `PickingPage.tsx:85` existe um segundo "Voltar

para lista" interno, concorrendo com o Voltar do header que sai do Picking inteiro. Exemplo prático:
ao transformar `activeTask` em rota (U-014), o Voltar do header passa a voltar à lista e o botão
interno de `PickingPage.tsx:85` é removido. Benefício: um Voltar só por tela, com destino óbvio.
Impacto: Alto · Esforço: M · Ref.: Material Design "Back navigation"

**U-008 · Voltar não volta para tela de sucesso** — `FormularioTriagem.tsx:175` faz

`setTimeout(() => navigate("/triagem"), 3000)` depois de concluir; Voltar reabre o formulário já
submetido. Exemplo prático: trocar por `navigate("/triagem", { replace: true })` em
`FormularioTriagem.tsx:175` e `:182`, e o mesmo em `ConferenciaRecebimento.tsx:175`. Benefício: acaba
o "Voltar me devolveu um formulário que já salvei". Impacto: Alto · Esforço: P · Ref.: NN/g "Error
prevention"

**U-009 · Voltar após login não retorna ao `/auth`** — `useAppLayoutState.ts:46` faz `navigate("/auth")`

no logout e `AppLayout.tsx:54` usa `<Navigate to="/auth" replace/>`, mas o login em si não usa
`replace`. Exemplo prático: em `src/pages/auth/Login.tsx` e `src/pages/Auth.tsx`, trocar o
`navigate(destino)` pós-sucesso por `{ replace: true }`. Benefício: Voltar depois de entrar não joga o
operador na tela de login. Impacto: Alto · Esforço: P · Ref.: NN/g "User control and freedom"

**U-010 · Logout com `replace` e limpeza de histórico** — `useAppLayoutState.ts:44-47` empilha `/auth`

sobre todo o histórico autenticado; Voltar depois do logout mostra telas em cache. Exemplo prático:
`navigate("/auth", { replace: true })` em `useAppLayoutState.ts:46`. Benefício: sem vazamento visual
de tela autenticada após sair. Impacto: Alto · Esforço: P · Ref.: WCAG 2.2 3.2.3 (navegação
consistente)

**U-011 · Fallback do Voltar por módulo, não `/dashboard` fixo** — `BackButton.tsx:23` tem

`fallbackPath="/dashboard"` global; quem abre `/recebimento/conferencia/:id` por link direto cai no
dashboard. Exemplo prático: criar `src/lib/navigation/parents.ts` mapeando prefixo → pai
(`/recebimento/*` → `/recebimento`, `/triagem/*` → `/triagem`, `/admin/*` → `/admin/usuarios`) e usar
em `useBackNavigation` antes do fallback. Benefício: deep link compartilhado por WhatsApp volta para o
módulo certo. Impacto: Alto · Esforço: M · Ref.: Material Design "Up navigation"

**U-012 · Gesto de swipe-back não dispara dentro de listas horizontais** — `useSwipeBack.ts:42` escuta

no `document` com `passive:true`; `TabsList` com `overflow-x-auto` (`RecebimentoPage.tsx:197`) e
carrosséis competem pelo gesto. Exemplo prático: em `useSwipeBack.ts:17`, abortar se
`e.target.closest("[data-no-swipe-back]")` e marcar `RecebimentoPage.tsx:197` e `Breadcrumbs.tsx:148`
com esse atributo. Benefício: fim do "arrastei a aba e saí da tela". Impacto: Alto · Esforço: P ·
Ref.: Apple HIG "Gestures"

**U-013 · Swipe-back desligado em fluxo com alteração não salva** — `useSwipeBack.ts:35` chama

`navigate(-1)` sem consultar nada; em `FormularioTriagem` (`hasChanges` em `:75`) um arrasto acidental
perde a triagem. Exemplo prático: dar ao hook um parâmetro `guard?: () => boolean` e passar
`!hasChanges` em `AppLayout.tsx:50` via contexto novo `NavigationGuardContext`. Benefício: gesto deixa
de ser caminho de perda de dado. Impacto: Alto · Esforço: M · Ref.: NN/g "Error prevention"

**U-014 · `activeTask` do Picking vira rota `/picking/:taskId`** — `PickingPage.tsx:32,80` troca de tela

por state: Voltar do browser sai do módulo e F5 perde a tarefa em execução. Exemplo prático: registrar
`picking/:taskId` em `src/routes/wmsRoutes.tsx`, ler `useParams` em `PickingPage.tsx:30`, e
`handleStartTask` (`:60`) passar a `navigate(\`/picking/${task.id}\`)`. Benefício: tarefa em execução
é compartilhável, recarregável e o Voltar funciona. Impacto: Alto · Esforço: M · Ref.: NN/g "Match
between system and the real world"

**U-015 · Etapa do formulário de triagem na URL** — `FormularioTriagem.tsx:66`guarda`activeStep` (0..4) em`useState`; recarregar perde a etapa de um formulário de 641 linhas. Exemplo prático: usar `useSearchParams`em`FormularioTriagem.tsx:66` (`?etapa=3`), com `setSearchParams({etapa}, {replace:true})`nos botões de`:523`e`:534`. Benefício: F5, Voltar e link compartilhado respeitam a etapa. Impacto: Alto · Esforço: M · Ref.: Material Design "Deep linking"

**U-016 · Voltar dentro do stepper vai uma etapa, não uma rota** — `FormularioTriagem.tsx:523` recua a etapa, mas o Voltar do header (`organisms/layout/Header.tsx:77`) sai da tela inteira: dois Voltar com significados diferentes na mesma viewport. Exemplo prático: com U-015 aplicado, `setSearchParams`sem

`replace`nas idas para frente faz`navigate(-1)`recuar etapa naturalmente; remover o botão
"Anterior" duplicado de`:523`ou mantê-lo chamando`goBack`. Benefício: um modelo mental de Voltar
por tela. Impacto: Alto · Esforço: M · Ref.: Apple HIG "Navigation"

**U-017 · Etapa da conferência de recebimento na URL** — `ConferenciaRecebimento.tsx:223`monta`steps` e deriva`currentStep`de`itemScanned`/`locationScanned` (`:48-49`) em state puro. Exemplo prático: espelhar as flags em `?etapa=`com`useSearchParams`em`ConferenciaRecebimento.tsx:42-52`, mantendo os dados em state. Benefício: o conferente que trocou de aba volta na etapa certa. Impacto: Alto · Esforço: M · Ref.: Material Design "Deep linking"

**U-018 · Estado das 33 `<Tabs>`raiz na query string** — Só`RecebimentoPage.tsx:196`e

`TriagemPage.tsx:74-77`leem`searchParams`; as outras 31 perdem a aba ao recarregar e o Voltar pula a
tela toda. Exemplo prático: criar `src/hooks/useTabParam.ts`
(`const [tab,setTab]=useTabParam("tab","geral")`sobre`useSearchParams`) e aplicar primeiro em
`ProfilePage.tsx`, `SettingsPage.tsx`, `KPIsPage.tsx`, `EstoquePage.tsx`. Benefício: aba virou
endereço; suporte consegue pedir "manda o link". Impacto: Alto · Esforço: G · Ref.: NN/g "Visibility
of system status"

**U-019 · Filtros de lista na URL com `replace`** — `RecebimentoPage.tsx:76-77`e

`TriagemPage.tsx:74-78`inicializam de`searchParams`mas gravam a cada tecla, enchendo o histórico:
Voltar passa a desfazer letra por letra. Exemplo prático: no`useTabParam`/`useFilterParams`, usar
`setSearchParams(next, { replace: true })`para busca e paginação e sem`replace`só para troca de
aba. Benefício: Voltar volta de tela, não de caractere. Impacto: Alto · Esforço: M · Ref.: NN/g "User
control and freedom"

**U-020 ·`navigate(-1)`nunca sai do app** — Os 4`navigate(-1)` (`BackButton.tsx:40`, `useAppLayoutState.ts:36`, `useSwipeBack.ts:36`, e o de `PickingPage`) confiam em `history.state.idx`, que é `null`quando o usuário chegou por link externo. Exemplo prático: centralizar em

`useBackNavigation`(U-001) a checagem`window.history.state?.idx > 0`já presente em
`BackButton.tsx:37`e cobrir com teste unitário simulando`idx` ausente. Benefício: nunca mais "Voltar
fechou a aba". Impacto: Alto · Esforço: P · Ref.: NN/g "User control and freedom"

### 1.2 Histórico, breadcrumbs e hierarquia

**U-021 · Breadcrumb duplicado nas 8 páginas com `BasePageTemplate`** — `AppLayout.tsx:107` já renderiza

`<Breadcrumbs/>`; `BasePageTemplate.tsx:45` renderiza outro. Exemplo prático: trocar o default de
`showBreadcrumbs` para `false` em `BasePageTemplate.tsx:26` e remover o `<Breadcrumbs/>` de `:45`,
deixando o do layout como fonte única. Benefício: 8 telas param de mostrar a trilha duas vezes.
Impacto: Alto · Esforço: P · Ref.: NN/g "Aesthetic and minimalist design"

**U-022 · Breadcrumb dinâmico para rotas `:id`** — `Breadcrumbs.tsx:96-101` resolve label por mapa

estático e devolve "Detalhes" ou o próprio segmento para `/recebimento/:id`, `/triagem/:id`,
`/clientes/:id`, `/pedidos/:id`, `/armazens/:id`. Exemplo prático: criar
`src/components/common/BreadcrumbTitleContext.tsx` onde a página publica
`setCrumbTitle("Lote 2291 — Acme")` e `Breadcrumbs.tsx:103` consome; ligar em
`ConferenciaRecebimento.tsx` e `FormularioTriagem.tsx`. Benefício: trilha informa o registro aberto,
não "Detalhes". Impacto: Alto · Esforço: M · Ref.: Material Design "Breadcrumbs"

**U-023 · `aria-current="page"` no último crumb** — `Breadcrumbs.tsx:181-183` renderiza o item atual

como `<span>` sem marcação semântica (a versão com `aria-current` está em `layout/Breadcrumbs.tsx:61`,
arquivo morto). Exemplo prático: adicionar `aria-current="page"` ao `<span>` de
`common/Breadcrumbs.tsx:181`. Benefício: leitor de tela anuncia onde o usuário está. Impacto: Médio ·
Esforço: P · Ref.: WCAG 2.2 4.1.2

**U-024 · Breadcrumb colapsável em caminho longo** — `Breadcrumbs.tsx:148` resolve excesso com

`overflow-x-auto`, o que esconde o início da trilha em telas estreitas sem indicar que há mais.
Exemplo prático: se `crumbs.length > 4`, renderizar `Início › … › pai › atual` com `DropdownMenu` nos
itens omitidos, em `Breadcrumbs.tsx:149`. Benefício: hierarquia legível no celular do operador.
Impacto: Médio · Esforço: M · Ref.: Material Design "Breadcrumb truncation"

**U-025 · Mapa de rótulos de rota deriva das rotas, não de lista paralela** — `Breadcrumbs.tsx:9-72` tem

72 entradas escritas à mão contra 86 paths reais em `src/routes/*`, logo 14 rotas aparecem com o slug
cru. Exemplo prático: criar `src/routes/routeMeta.ts` com
`{ path, label, icon, group, parent, roles }` e fazer `Breadcrumbs.tsx`, `sidebarNavData.ts` e
`GlobalSearchDialog.tsx` lerem a mesma fonte. Benefício: rota nova aparece no breadcrumb, no menu e na
busca sem três edições. Impacto: Alto · Esforço: G · Ref.: NN/g "Consistency and standards"

**U-026 · As 12 rotas órfãs ganham entrada de menu ou saem do roteador** — Sem item em

`sidebarNavData.ts`: `admin/api`, `admin/auditoria-critica`, `admin/circuit-breakers`,
`admin/saude-backend`, `admin/telemetria`, `ajustes`, `conferencia`, `formulario-triagem`, `triador`,
`inventory/movements`, `hub`, `configuracoes`. Exemplo prático: criar grupo "Operação avançada" e
"Diagnóstico" em `sidebarNavData.ts:85-160` para as que são telas finais (`ajustes`,
`inventory/movements`, `configuracoes`, `hub`, `triador`, as 5 de admin) e deixar
`conferencia`/`formulario-triagem` acessíveis só por fluxo. Benefício: função pronta deixa de ser
invisível. Impacto: Alto · Esforço: M · Ref.: NN/g "Recognition rather than recall"

**U-027 · `/hub` deixa de ser acessível só pelo bottom nav** — `MobileNavigation.tsx:87-99` só oferece o

Hub em `/` e `/dashboard` e no mobile; no desktop a rota `hub` (`App.tsx:62`) não tem porta. Exemplo
prático: adicionar `{ path: "/hub", icon: Box, label: "Hub" }` em `sidebarNavData.ts:70` (lista
principal) e um card no `DashboardPage`. Benefício: o índice de módulos fica alcançável de qualquer
lugar. Impacto: Médio · Esforço: P · Ref.: Material Design "Navigation hierarchy"

**U-028 · Histórico multi-passo navegável (`useHistory` ligado)** — `useHistory.ts` implementa pilha com

`back/forward/go/canBack/canForward` e tem **zero** uso. Exemplo prático: usar em
`src/components/common/RecentRoutes.tsx` novo, alimentado por um `useEffect` em `AppLayout.tsx` que
empurra `location.pathname`, exibido como dropdown "Telas recentes" no header ao lado do Voltar.
Benefício: voltar 3 telas sem clicar 3 vezes. Impacto: Médio · Esforço: M · Ref.: NN/g "Flexibility
and efficiency of use"

**U-029 · Voltar com pressão longa abre o histórico** — Com U-028 feito, o `BackButton` pode oferecer o

salto direto, como no Chrome. Exemplo prático: em `BackButton.tsx:59`, envolver em `ContextMenu`
(shadcn) listando as últimas 5 rotas de `RecentRoutes`, acionado por `onContextMenu` e por
`pointerdown` longo no touch. Benefício: fluxo de conferência ↔ lista ↔ detalhe sem 6 toques. Impacto:
Médio · Esforço: M · Ref.: Apple HIG "Long press"

**U-030 · Restauração de scroll por rota** — `grep ScrollRestoration` = 0 e o único `scrollTo` é em

`usePreventScroll.ts:14`: voltar de um detalhe recoloca a lista no topo. Exemplo prático: criar
`src/hooks/useScrollRestoration.ts` guardando `window.scrollY` por `location.key` em `sessionStorage`
e restaurando no `useEffect` de `AppLayout.tsx`; para listas longas (`Produtos.tsx`,
`EstoquePage.tsx`) salvar o offset do container virtualizado. Benefício: fim da reposição manual em
lista de 500 itens. Impacto: Alto · Esforço: M · Ref.: NN/g "Minimize user memory load"

**U-031 · Scroll ao topo em avanço de rota** — Sem restauração, hoje a nova rota herda o scroll da

anterior: entrar em um detalhe pode abrir "no meio". Exemplo prático: no mesmo `useScrollRestoration`,
distinguir `navigationType` (`useNavigationType()`) — `POP` restaura, `PUSH` vai a 0. Benefício: tela
nova começa do começo. Impacto: Alto · Esforço: P · Ref.: Material Design "Scroll behavior"

**U-032 · Posição da lista preservada ao voltar do detalhe de recebimento** — `RecebimentoPage.tsx:269`

navega para `/recebimento/:id` e `:380` para `/recebimento/conferencia/:id`; o retorno perde a linha
de origem. Exemplo prático: ao navegar, passar `state: { fromId: item.id }` e no retorno rolar até
`document.getElementById(\`recebimento-${fromId}\`)`com`scrollIntoView({block:"center"})`e um
realce de 1,2s. Benefício: o conferente reencontra a linha onde parou. Impacto: Alto · Esforço: M ·
Ref.: NN/g "Recognition rather than recall"

**U-033 · Página 404 dentro do shell e em PT-BR** —`NotFound.tsx:16`diz "Oops! Page not found" e`:17` usa`<a href="/">`(reload total do SPA), em`h-screen bg-muted`sem header. Exemplo prático: reescrever`src/pages/NotFound.tsx`com`BasePageTemplate`, texto PT-BR, `<Link to="/">`, `<BackButton/>` e 4 atalhos (`/recebimento`, `/triagem`, `/estoque`, busca global via `window.dispatchEvent(new CustomEvent("open-global-search"))`). Benefício: erro de URL deixa de ser beco sem saída. Impacto: Alto · Esforço: P · Ref.: NN/g "Help users recognize, diagnose, and recover from errors"

**U-034 · 404 sugere rota parecida** — `NotFound.tsx`não tenta nada com o path digitado. Exemplo prático: comparar`location.pathname`com as chaves de`routeMeta.ts`(U-025) por distância de Levenshtein simples e oferecer "Você quis dizer /recebimento?". Benefício: erro de digitação em URL colada resolve-se num clique. Impacto: Médio · Esforço: M · Ref.: NN/g "Error recovery"

**U-035 ·`/unauthorized`oferece voltar, não só sair** —`Unauthorized.tsx:17,20`só dá "ir para /auth" e "ir para /". Exemplo prático: adicionar`<BackButton fallbackPath="/" />`e a frase do papel exigido, lendo`location.state.requiredRole`enviado por`components/auth/ProtectedRoute.tsx`. Benefício: operador sem permissão retoma o que fazia em vez de reiniciar. Impacto: Médio · Esforço: P · Ref.: NN/g "User control and freedom"

**U-036 · Redirect pós-login volta ao destino pretendido** — `AppLayout.tsx:54`faz

`<Navigate to="/auth" replace/>`descartando a rota pedida; depois de entrar o usuário cai na home.
Exemplo prático:`<Navigate to="/auth" replace state={{ from: location }} />`em`AppLayout.tsx:54`e,
no login,`navigate(state?.from?.pathname ?? "/", { replace: true })`. Benefício: link de alerta por
e-mail leva ao registro certo mesmo com sessão expirada. Impacto: Alto · Esforço: M · Ref.: NN/g
"Flexibility and efficiency of use"

**U-037 · Sessão expirada no meio de um fluxo preserva o rascunho** — Com `persistSession`em

`localStorage` (`supabase/client.ts:19`) a expiração ocorre com formulário aberto; hoje nada é salvo.
Exemplo prático: `useDraft`(U-128) grava rascunho antes do`<Navigate>`de`AppLayout.tsx:54`, usando
`location.pathname`como chave. Benefício: expiração deixa de custar uma triagem inteira. Impacto:
Alto · Esforço: M · Ref.: NN/g "Error prevention"

**U-038 · Guarda de rota real para as 44 rotas sem`ProtectedRoute`** — `achados-C-arq.md`registra 44 rotas de feature/wms sem guarda; quem navega por URL entra e só descobre no erro de query. Exemplo prático: envolver os grupos em`src/routes/wmsRoutes.tsx`e`featureRoutes.tsx`com

`<ProtectedRoute allowedRoles={...}>`conforme`routeMeta.ts`(U-025). Benefício: menu, breadcrumb e
rota concordam sobre quem pode entrar. Impacto: Alto · Esforço: M · Ref.: WCAG 2.2 3.2.3 · **⚠️ regra
8** (arquitetura de autorização)

**U-039 · Menu esconde o que o papel não acessa** —`SidebarAccordionGroup.tsx:54`renderiza todos os itens; o operador vê "Config Admin" e recebe erro ao clicar. Exemplo prático: filtrar`group.items` por`roles`de`routeMeta.ts`usando`useAuth().role`em`organisms/layout/Sidebar.tsx`. Benefício: menos cliques em porta fechada. Impacto: Alto · Esforço: M · Ref.: NN/g "Error prevention"

**U-040 · Grupo do menu abre sozinho e lembra o estado** — `SidebarAccordionGroup.tsx:27-31`abre o grupo com filho ativo mas nunca persiste a escolha do usuário. Exemplo prático: guardar

`sidebar_groups_open`em`localStorage`, como já se faz com `sidebar_collapsed`em
`useAppLayoutState.ts:13-19`. Benefício: o operador reencontra o menu como deixou. Impacto: Médio ·
Esforço: P · Ref.: NN/g "User control and freedom"

### 1.3 Atalhos, feedback e micro-navegação

**U-041 · Atalhos de navegação deixam de colidir com o browser** — `useKeyboardShortcuts.ts:86-92`

captura `Ctrl+F` (busca da página) e `:46` captura `Ctrl+R` não, mas `Ctrl+T`/`Ctrl+L` (`:46,:65`) são
atalhos nativos do browser. Exemplo prático: migrar para `Alt+<letra>` ou `g` seguido de letra (padrão
Gmail/Linear) em `useKeyboardShortcuts.ts:17-98` e manter `Ctrl+K` para busca. Benefício: atalho do
app para de roubar o do navegador. Impacto: Alto · Esforço: M · Ref.: NN/g "Flexibility and efficiency
of use"

**U-042 · Um só sistema de atalhos** — Coexistem `useKeyboardShortcuts.ts` (lista fixa, consumida por

`ShortcutsHUD.tsx:10` e `Dashboard.tsx:38`) e `use-keyboard-shortcuts.ts` (genérico, com
`GLOBAL_SHORTCUTS` em `:27-38` usados só por `keyboard-shortcuts-help.tsx:12`), com mapeamentos
divergentes para a mesma tecla. Exemplo prático: manter o genérico, declarar a lista de navegação como
dados e apagar o duplicado. Benefício: a ajuda de atalhos passa a descrever o que realmente funciona.
Impacto: Alto · Esforço: M · Ref.: NN/g "Consistency and standards"

**U-043 · Painel de atalhos sem conflito de tecla `?`** — `ShortcutsHUD.tsx:16` abre o painel com `?` e

`useKeyboardShortcuts.ts:94` mostra um toast com a mesma tecla: pressionar `?` faz as duas coisas.
Exemplo prático: remover o atalho `?` de `useKeyboardShortcuts.ts:93-97`, deixando só o
`ShortcutsHUD`. Benefício: uma resposta por tecla. Impacto: Médio · Esforço: P · Ref.: NN/g
"Consistency and standards"

**U-044 · Painel de atalhos documenta `Alt+←` e o swipe** — `ShortcutsHUD.tsx:10` lista só o array de

`useKeyboardShortcuts`; `Alt+←` (`useAppLayoutState.ts:77`) e o swipe-back (`useSwipeBack.ts:35`) não
aparecem em lugar nenhum da UI além do tooltip de `BackButton.tsx:74`. Exemplo prático: acrescentar as
duas entradas à lista de dados de atalhos (U-042) e uma seção "Gestos". Benefício: o recurso existente
passa a ser descoberto. Impacto: Médio · Esforço: P · Ref.: NN/g "Help and documentation"

**U-045 · Toast de navegação só quando o destino não é óbvio** —

`useKeyboardShortcuts.ts:24,33,42,51,60,69,79` dispara `toast.info("Navegando para X")` a cada atalho,
redundante com a tela que já mudou. Exemplo prático: remover os `toast.info` de navegação e manter
apenas o anúncio em região `aria-live` (U-096). Benefício: menos ruído visual, mesmo feedback para
leitor de tela. Impacto: Médio · Esforço: P · Ref.: NN/g "Aesthetic and minimalist design"

**U-046 · Som de navegação é opt-in** — `SidebarNavButton.tsx:29` toca `play("notification", 0.1)` a

cada item de menu, sem preferência do usuário. Exemplo prático: condicionar a um flag `prefs.navSound`
persistido em `localStorage` e exposto em `/configuracoes`, default `false`. Benefício: WMS em sala
silenciosa deixa de apitar. Impacto: Médio · Esforço: P · Ref.: WCAG 2.2 1.4.2 (controle de áudio)

**U-047 · Haptics padronizados por tipo de navegação** — Há três padrões diferentes: `haptics.light()` =

5ms (`haptics.ts:9`), `BackButton.tsx:32` e `useAppLayoutState.ts:30` usam `[5,10,5]` à mão. Exemplo
prático: criar `haptics.back()` em `src/utils/haptics.ts` e usá-lo nos três Voltar; manter `light`
para seleção e `medium` para confirmar. Benefício: o pulso diz qual ação ocorreu. Impacto: Baixo ·
Esforço: P · Ref.: Apple HIG "Haptics"

**U-048 · Haptics respeitam `prefers-reduced-motion`** — `haptics.ts:5-41` vibra sempre;

`useReducedMotion.ts` existe e não é consultado. Exemplo prático: no módulo `haptics`, ler
`window.matchMedia("(prefers-reduced-motion: reduce)").matches` e sair cedo. Benefício: usuário
sensível a estímulo não é vibrado. Impacto: Médio · Esforço: P · Ref.: WCAG 2.2 2.3.3

**U-049 · Clique no item de menu já ativo não re-renderiza** — `useAppLayoutState.ts:51-54` já evita

navegar, mas no mobile fecha o menu sem avisar nada; o usuário acha que não funcionou. Exemplo
prático: quando `location.pathname === path`, rolar ao topo e piscar o título (`animate` de 300ms) em
vez de nada. Benefício: toque no item ativo tem resposta. Impacto: Baixo · Esforço: P · Ref.: NN/g
"Visibility of system status"

**U-050 · Prefetch cobre as rotas que o menu realmente tem** — `lib/prefetch.ts:11-30` mapeia 19 rotas

contra 86 registradas; os outros itens de menu não aproveitam o `onMouseEnter` de
`SidebarNavButton.tsx:111`. Exemplo prático: gerar `routeImports` a partir de `routeMeta.ts` (U-025)
ou acrescentar as 20 rotas mais usadas por `analytics` (U-076). Benefício: menos spinner na troca de
tela. Impacto: Médio · Esforço: M · Ref.: NN/g "Flexibility and efficiency of use"

## 2 · Consistência e padrões UI/UX (U-051 a U-085)

### 2.1 Transições e animação entre telas

**U-051 · `AnimatePresence` em volta do `Outlet`** — `PageTransition.tsx:26` define `exit`, mas

`AppLayout.tsx:108` renderiza `{children || <Outlet/>}` sem `AnimatePresence`: a saída nunca roda e
30+ páginas carregam framer-motion para nada. Exemplo prático: em `AppLayout.tsx:106-109`, envolver
com `<AnimatePresence mode="wait">` chaveado por `location.pathname`, usando o `location` já
disponível em `:36`. Benefício: a transição configurada passa a existir de fato. Impacto: Alto ·
Esforço: P · Ref.: Material Design "Motion: transitions"

**U-052 · Transição de rota no layout, não página por página** — Hoje cada página importa

`PageTransition` (30+ arquivos) e quem esquece não anima; o registro de presets
(`lib/transitions/registry.ts:7-20`) já é por rota. Exemplo prático: mover o `<PageTransition>` para
dentro do `AnimatePresence` de `AppLayout.tsx:108` e remover os imports das páginas em lotes de 5.
Benefício: animação uniforme e menos 30 imports. Impacto: Alto · Esforço: G · Ref.: NN/g "Consistency
and standards"

**U-053 · Direção da transição segue o sentido da navegação** — `registry.ts:7-20` fixa o preset por

rota: entrar e sair de `/estoque` desliza para o mesmo lado. Exemplo prático: usar
`useNavigationType()` em `usePageTransition.ts:19` e trocar `slide-left`↔`slide-right` quando for
`POP`. Benefício: o movimento confirma que o usuário voltou. Impacto: Médio · Esforço: M · Ref.: Apple
HIG "Navigation transitions"

**U-054 · Transição mais curta que 200ms em dispositivo de operação** — `presets.ts:15` usa 280ms e

`:69` (parallax, aplicado a `/hub`) 500ms com `anticipate`; em coletor Android isso atrasa cada troca
de tela. Exemplo prático: reduzir `base()` para 0.18 em `presets.ts:4` e trocar `/hub` de `parallax`
para `fade` em `registry.ts:11`. Benefício: percepção de app nativo em hardware fraco. Impacto: Médio
· Esforço: P · Ref.: Material Design "Motion duration"

**U-055 · `flip-x`/`flip-y` saem do catálogo** — `presets.ts:53-64` define rotação 3D de 450ms, nunca

usada em `registry.ts` e pesada em coletor. Exemplo prático: remover as duas chaves de `presets.ts` e
de `lib/transitions/types.ts`. Benefício: menos superfície de configuração errada. Impacto: Baixo ·
Esforço: P · Ref.: NN/g "Aesthetic and minimalist design"

**U-056 · `reduced-motion` desativa também as entradas de página** — `usePageTransition.ts:25` já

respeita o preset reduzido, mas `BasePageTemplate.tsx:40-84` e `Breadcrumbs.tsx:114-129` animam direto
com `motion` sem checar. Exemplo prático: envolver a app em `<MotionConfig reducedMotion="user">` em
`AppProviders.tsx:62` (framer-motion já é dependência). Benefício: uma linha cobre as 122
`AnimatePresence` e os 100 arquivos com `motion`. Impacto: Alto · Esforço: P · Ref.: WCAG 2.2 2.3.3

**U-057 · Breadcrumb não anima a cada rota** — `Breadcrumbs.tsx:114-124` usa `staggerChildren: 0.1` +

`delayChildren: 0.1`: a trilha se monta item a item em toda troca de tela. Exemplo prático: em
`Breadcrumbs.tsx:131-141`, trocar `initial="hidden"` por `initial={false}` e manter só a transição de
opacidade do item ativo. Benefício: 300ms a menos de distração por navegação. Impacto: Médio ·
Esforço: P · Ref.: Material Design "Motion restraint"

**U-058 · `BasePageTemplate` não escalona 3 animações em série** — `BasePageTemplate.tsx:43,72,84`

empilha `delay` 0.1 + 0.2 + 0.2: o conteúdo só aparece ~700ms depois do título. Exemplo prático:
reduzir para um único `motion.div` externo com 0.15s, sem delays em cascata. Benefício: conteúdo
visível antes, menos sensação de lentidão. Impacto: Médio · Esforço: P · Ref.: NN/g "Response time
limits"

**U-059 · `layoutId` compartilhado não pula entre telas** — `SidebarNavButton.tsx:45` e

`MobileNavigation.tsx:132,196` usam `layoutId="sidebar-indicator"`/`"mobile-indicator"`; com dois
grupos montados (sidebar desktop + sheet mobile em `AppLayout.tsx:126,165`) o indicador pode "voar" de
um para outro. Exemplo prático: sufixar o `layoutId` com `isMobile` em `SidebarNavButton.tsx:46` e com
a metade do nav em `MobileNavigation.tsx`. Benefício: fim do glitch do traço de ativo. Impacto: Médio
· Esforço: P · Ref.: Material Design "Shared axis"

**U-060 · `GlobalLoadingBar` montado uma vez** — Está em `App.tsx:23` e novamente em `AppLayout.tsx:71`:

duas barras sobrepostas, ambas `z-[9999]`. Exemplo prático: remover o de `AppLayout.tsx:71`, mantendo
o de `App.tsx:23` (cobre também as rotas públicas). Benefício: uma barra, animação correta. Impacto:
Médio · Esforço: P · Ref.: NN/g "Visibility of system status"

**U-061 · Barra de progresso de navegação cresce enquanto carrega, não em 800ms fixos** —

`GlobalLoadingBar.tsx:16` anima `width` de 0 a 100% em 800ms com `circIn`, chegando a 100% antes do
fim do fetch. Exemplo prático: animar até 90% com `ease` lento e só completar quando `isFetching`
zera, em `GlobalLoadingBar.tsx:12-18`. Benefício: a barra deixa de mentir sobre o progresso. Impacto:
Médio · Esforço: P · Ref.: NN/g "Visibility of system status"

**U-062 · Barra de navegação distinta da barra de dados** — `GlobalLoadingBar.tsx:7` acende para

qualquer fetch; o usuário não distingue "a tela está vindo" de "a tabela está atualizando". Exemplo
prático: acender também em `useNavigation()`-like (estado de `Suspense` do `RouteErrorBoundary`) com
cor `primary` e usar `muted` para refetch de dados. Benefício: dois sinais diferentes para duas
situações diferentes. Impacto: Médio · Esforço: M · Ref.: Material Design "Progress indicators"

**U-063 · Skeleton de rota com o tipo certo** — `RouteLoadingFallback.tsx:13` tem 8 tipos, mas

`App.tsx:32,42,52,65` passa `"dashboard"` até para `/monitor` e `/hub` (que tem skeleton próprio em
`:35-56`). Exemplo prático: corrigir `App.tsx:65` para `type="hub"` e auditar os `type=` de
`src/routes/*.tsx` contra o layout real de cada página. Benefício: o esqueleto corresponde ao que vai
aparecer, reduzindo o salto de layout. Impacto: Médio · Esforço: M · Ref.: NN/g "Visibility of system
status"

**U-064 · `AnimatePresence` desnecessário dentro do skeleton** — `RouteLoadingFallback.tsx:83` abre um

`AnimatePresence` em volta de um único filho chaveado por `type`, que nunca muda durante a vida do
componente. Exemplo prático: remover o `AnimatePresence` de `:83` e manter só o `motion.div`.
Benefício: um nó a menos no caminho crítico de cada rota lazy. Impacto: Baixo · Esforço: P · Ref.:
NN/g "Efficiency"

**U-065 · Transição entre skeleton e conteúdo sem flash** — Com o skeleton animando entrada

(`RouteLoadingFallback.tsx:87`) e a página animando entrada de novo (`PageTransition`), há dois fades
em sequência. Exemplo prático: dar ao skeleton `exit` com duração 0 e deixar só a página animar, na
mesma PR de U-051. Benefício: uma transição percebida em vez de duas. Impacto: Médio · Esforço: P ·
Ref.: Material Design "Motion continuity"

### 2.2 Hierarquia visual e padrões de layout

**U-066 · Um único componente de cabeçalho de página** — Coexistem `ui/page-header.tsx` (título + Voltar

- ações), `templates/BasePageTemplate.tsx:56` (título com `gradient-text` 3xl) e o `title` do
  `AppLayout`/`organisms/layout/Header.tsx:92` (xl, oculto abaixo de `sm`): três hierarquias de `h1`.
  Exemplo prático: eleger `PageHeader` como o padrão, fazer `BasePageTemplate` renderizá-lo em `:49-79`
  e remover a prop `title` inerte de `AppLayout`. Benefício: mesmo tamanho e posição de título em todas
  as telas. Impacto: Alto · Esforço: G · Ref.: WCAG 2.2 1.3.1 / NN/g "Consistency"

**U-067 · Remover a prop `title`/`showBack` inerte de `AppLayout`** — `AppLayout.tsx:52` descarta tudo quando aninhado, logo os 51 usos de `<AppLayout title=... showBack>` (ex. `ConferenciaRecebimento.tsx:255`, `PickingPage.tsx:82`) não fazem nada e enganam quem lê o código. Exemplo prático: tipar `AppLayoutProps` sem `title`/`showBack`/`rightAction` e remover das chamadas, usando `PageHeader` no lugar. Benefício: o que está escrito na página passa a ser o que aparece. Impacto: Alto · Esforço: G · Ref.: NN/g "Consistency and standards"

**U-068 · `h1` único por tela** — `BasePageTemplate.tsx:57`, `page-header.tsx:37` e `organisms/layout/Header.tsx:93` podem renderizar `h1` na mesma viewport. Exemplo prático: `Header` passa a `role="presentation"`/`<p>` para o título compacto e só `PageHeader` emite `h1`. Benefício: estrutura de cabeçalho correta para leitor de tela. Impacto: Médio · Esforço: M · Ref.: WCAG 2.2 1.3.1

**U-069 · Dois toasters deixam de competir** — `AppProviders.tsx:55-56` monta `Sonner` e `Toaster` juntos (55 arquivos usam `sonner`, 23 `useToast`), e o aviso de navegação pode sair em dois lugares. Exemplo prático: manter `Sonner`, remover `<Toaster/>` de `:56` e migrar os 23 consumidores de `useToast` em lotes. Benefício: um único canal de feedback, posição previsível. Impacto: Alto · Esforço: G · Ref.: NN/g "Consistency and standards"

**U-070 · Toast não cobre o bottom nav** — `MobileNavigation.tsx:81` ocupa a faixa inferior com `env(safe-area-inset-bottom)`; o Sonner default também fica embaixo. Exemplo prático: configurar `position="top-center"` com offset no `src/components/ui/sonner.tsx`, ou `offset` de 88px no mobile. Benefício: aviso e navegação param de se esconder um ao outro. Impacto: Médio · Esforço: P · Ref.: Apple HIG "Safe areas"

**U-071 · Breadcrumb sticky não colide com o stepper sticky** — `Breadcrumbs.tsx:138` é `sticky top-16 z-30` e `PersistentStepper.tsx:31` também é `sticky top-16`: nas telas de conferência os dois disputam a mesma faixa. Exemplo prático: nas telas de fluxo, ocultar o breadcrumb (`showBreadcrumbs={false}`) ou mover o stepper para `top-28` em `PersistentStepper.tsx:31`. Benefício: nada se sobrepõe no topo durante a conferência. Impacto: Alto · Esforço: P · Ref.: Material Design "Z-index / elevation"

**U-072 · Escala de `z-index` documentada** — Convivem `z-50` no header (`organisms/layout/Header.tsx:48`), `z-40` na sidebar (`AppLayout.tsx:122`), `z-50` no sheet (`:159`), `z-30` no breadcrumb, `z-[100]`/`z-[101]` no HUD (`ShortcutsHUD.tsx:38,45`) e `z-[9999]` na barra. Exemplo prático: criar tokens `--z-nav`, `--z-overlay`, `--z-modal`, `--z-toast` em `src/index.css` e substituir os literais. Benefício: overlay novo não entra na frente do menu por acidente. Impacto: Médio · Esforço: M · Ref.: Material Design "Elevation"

**U-073 · Indicador de ativo visível sem depender de cor** — `SidebarNavButton.tsx:37` marca ativo com `bg-primary/15 text-primary` e um traço de 3px; com `--primary` a 2,85:1 (`index.css:27-28`) a diferença é frágil. Exemplo prático: somar `font-semibold` (já em `:69`) a um `border-l-2` opaco e um ícone preenchido, e corrigir o token em U-087. Benefício: operador com baixa visão identifica onde está. Impacto: Alto · Esforço: P · Ref.: WCAG 2.2 1.4.1

**U-074 · Altura mínima de 44px em todo item de navegação** — `SidebarNavButton.tsx:35` usa `h-11` (44px) no colapsado mas `py-2.5` no expandido (~40px); o botão de recolher da sidebar (`AppLayout.tsx:138`) é `h-6 w-6` = 24px. Exemplo prático: aumentar o toggle de `AppLayout.tsx:138` para `h-8 w-8` com área de toque `after:absolute after:-inset-2` e padronizar `min-h-11` nos itens. Benefício: alvo alcançável com luva. Impacto: Alto · Esforço: P · Ref.: WCAG 2.2 2.5.8 (target size mínimo)

**U-075 · Larguras fixas da sidebar passam a token** — `AppLayout.tsx:60-61` tem `w-[70px]`/`w-[280px]` e `lg:pl-[70px]`/`lg:pl-[280px]` duplicados em 4 strings. Exemplo prático: definir `--sidebar-w` e `--sidebar-w-collapsed` em `src/index.css` e usar `w-[var(--sidebar-w)]`. Benefício: mudar a largura deixa de exigir 4 edições sincronizadas. Impacto: Baixo · Esforço: P · Ref.: NN/g "Consistency"

### 2.3 Paridade mobile / tablet / desktop

**U-076 · Faixa de tablet ganha layout próprio** — `AppLayout.tsx:122` mostra a sidebar só em `lg`

(1024px) e `MobileNavigation.tsx:81` esconde o bottom nav em `md` (768px): entre 768px e 1024px o
usuário fica **sem sidebar e sem bottom nav**, só com o botão de menu. Exemplo prático: trocar
`md:hidden` por `lg:hidden` em `MobileNavigation.tsx:81,33,45` para o bottom nav cobrir o tablet.
Benefício: tablet de 10", comum em doca, deixa de ficar sem navegação persistente. Impacto: Alto ·
Esforço: P · Ref.: Material Design "Responsive layout grid"

**U-077 · Breakpoint de "mobile" unificado** — `use-mobile.ts:7` usa `max-width: 768px`, `AppLayout`

decide por `lg`, `MobileNavigation` por `md`, `organisms/layout/Header.tsx:62` por `lg:hidden`.
Exemplo prático: criar `src/hooks/useBreakpoint.ts` com `sm/md/lg/xl` lidos do Tailwind e substituir
os literais nesses 4 arquivos. Benefício: o que é "mobile" passa a ser a mesma coisa em todo lugar.
Impacto: Alto · Esforço: M · Ref.: Material Design "Breakpoints"

**U-078 · `h-screen` → `dvh` nas telas de operação** — 25 `h-screen` + 3 `100vh` e **zero** `dvh` em

`src`: com a barra do Chrome Android o rodapé de ação some (ex. `PickingPage.tsx:168` fixa o botão de
confirmar em `bottom-0`). Exemplo prático: trocar por `min-h-[100dvh]` nos containers de fluxo
(`KanbanColumn.tsx:17`, `WarehouseMap.tsx:48`, `NotFound.tsx:13`) e validar no Android. Benefício:
botão de confirmar sempre alcançável. Impacto: Alto · Esforço: M · Ref.: Apple HIG "Layout / safe
area"

**U-079 · `BottomNav` morto removido ou unificado** — `mobile/BottomNav.tsx` tem 5 itens (`/dashboard`,

`/estoque`, `/triagem`, `/relatorios`, `/perfil`) divergentes dos 4 de `sidebarNavData.ts:56-59`
usados pelo nav real. Exemplo prático: apagar `src/components/mobile/BottomNav.tsx` e seu export em
`mobile/index.ts:1`, mantendo `organisms/layout/MobileNavigation.tsx` como único. Benefício: um menu
inferior só, sem risco de alguém montar o errado. Impacto: Médio · Esforço: P · Ref.: NN/g
"Consistency and standards"

**U-080 · Itens do bottom nav configuráveis por papel** — `MobileNavigation.tsx:115,179` fatia

`mobileNavItems.slice(0,2)` e `slice(2,4)`; o triador vê "Dashboard" em vez de "Triagem". Exemplo
prático: derivar os 4 itens de `routeMeta.ts` filtrando por `role` de `useAuth()`, com fallback para a
lista atual. Benefício: as 4 portas do celular são as que aquele papel usa. Impacto: Alto · Esforço: M
· Ref.: NN/g "Flexibility and efficiency of use"

**U-081 · `PullToRefresh` padronizado** — `mobile/PullToRefresh.tsx` está morto enquanto

`TriagemPage.tsx:3,87` usa `usePullToRefresh` de `hooks/useTouchGestures.ts:125` +
`PullToRefreshIndicator` de `mobile/SwipeableListItem.tsx`: duas implementações, uma só em uso.
Exemplo prático: apagar `mobile/PullToRefresh.tsx` e seu export, e aplicar o hook em `RecebimentoPage`
e `PickingPage`. Benefício: gesto de atualizar igual nas listas de operação. Impacto: Médio · Esforço:
M · Ref.: Material Design "Swipe to refresh"

**U-082 · `SwipeableListItem` aplicado nas listas que pedem ação rápida** — Só `TriagemPage` importa

algo de lá (`:4`, e apenas o indicador). Exemplo prático: usar `SwipeableListItem` nas linhas de
`RecebimentoPage.tsx:269` (ações "conferir"/"divergência") com rótulos textuais sob os ícones.
Benefício: ação de 1 gesto na doca, sem abrir o detalhe. Impacto: Médio · Esforço: M · Ref.: Apple HIG
"Swipe actions"

**U-083 · Swipe de item não conflita com swipe-back** — `useSwipeBack.ts:19` só ativa a 30px da borda,

mas um `SwipeableListItem` que começa perto da borda esquerda disputa o gesto. Exemplo prático: marcar
`SwipeableListItem` com `data-no-swipe-back` (U-012) e exigir `deltaX > 80` já presente em
`useSwipeBack.ts:35`. Benefício: os dois gestos coexistem sem surpresa. Impacto: Médio · Esforço: P ·
Ref.: Apple HIG "Gesture conflicts"

**U-084 · Sidebar mobile fecha com Esc e com o Voltar do browser** — `AppLayout.tsx:148-178` é um

`motion.aside` manual (não `Sheet`), fecha só por clique no overlay (`:156`) e no `useEffect` de troca
de rota (`useAppLayoutState.ts:71-73`). Exemplo prático: trocar por `<Sheet>` do shadcn (já usado em 5
arquivos), que dá Esc, foco preso e `aria-modal`; ou registrar `keydown Escape` + um
`history.pushState` sentinela. Benefício: menu mobile se comporta como diálogo, inclusive no botão
físico de voltar. Impacto: Alto · Esforço: M · Ref.: WCAG 2.2 2.1.2 (sem armadilha de teclado)

**U-085 · FAB não cobre o conteúdo da última linha** — `MobileNavigation.tsx:156` sobe o FAB com

`-mt-10` sobre a barra, e páginas sem `pb` suficiente ficam com conteúdo embaixo (`PickingPage.tsx:84`
usa `pb-24`, mas a maioria não). Exemplo prático: aplicar `pb-28 md:pb-6` no container de
`AppLayout.tsx:106` em vez de deixar para cada página. Benefício: nenhum botão de lista fica sob o
FAB. Impacto: Médio · Esforço: P · Ref.: Material Design "FAB placement"

## 3 · Acessibilidade e inclusão na navegação (U-086 a U-120)

### 3.1 Leitor de tela e foco

**U-086 · Foco move para o conteúdo ao trocar de rota** — `AppLayout.tsx:98-105` tem

`<main id="main-content">` mas nada move o foco na navegação: o leitor de tela continua lendo o item
de menu clicado. Exemplo prático: dar `tabIndex={-1}` ao `<main>` de `AppLayout.tsx:98` e, num
`useEffect` com `[location.pathname]`, chamar `mainRef.current?.focus({preventScroll:true})`.
Benefício: cada navegação recomeça a leitura no conteúdo novo. Impacto: Alto · Esforço: P · Ref.: WCAG
2.2 2.4.3 (ordem de foco)

**U-087 · Contraste do `--primary` corrigido (2,85:1 → ≥4,5:1)** — `index.css:27-28` e `:91-92` definem

`--primary: 24 95% 53%` com `--primary-foreground: 0 0% 100%`: é a cor do Voltar em hover, do
indicador ativo da sidebar e do crumb atual. Exemplo prático: escurecer para `24 95% 42%` (ou usar
`--primary-foreground: 0 0% 10%`), medir com `tests/e2e/a11y-smoke.spec.ts` e reavaliar a exclusão de
`/auth/login` em `:8-12`. Benefício: navegação legível para baixa visão e sob luz de galpão. Impacto:
Alto · Esforço: M · Ref.: WCAG 2.2 1.4.3

**U-088 · `aria-label` nos ícones de navegação sem texto** — `achados-A-ui.md` mediu 102/133

`Button size="icon"` sem rótulo; entre eles `page-header.tsx:32` (o Voltar!) e
`organisms/layout/Header.tsx` tem alguns ok (`:64`, `BackButton.tsx:64`). Exemplo prático: adicionar
`aria-label="Voltar"` em `page-header.tsx:32` e varrer `src/components/layout/**` e
`src/components/navigation/**` nesta PR. Benefício: o Voltar passa a ser anunciado. Impacto: Alto ·
Esforço: P · Ref.: WCAG 2.2 4.1.2

**U-089 · Descrição do Voltar diz o destino** — `BackButton.tsx:64` anuncia "Voltar para tela anterior",

genérico quando há 3 Voltar na tela. Exemplo prático: compor `aria-label={\`Voltar para
${destinoLabel}\`}`com o label resolvido em U-006/U-011 e manter o`kbd Alt+←` do tooltip (`:74`)
fora do nome acessível. Benefício: o usuário cego sabe para onde vai antes de ativar. Impacto: Alto ·
Esforço: P · Ref.: WCAG 2.2 2.4.6 (rótulos descritivos)

**U-090 · SkipLink efetivamente único e funcional** — `AppLayout.tsx:72-77` tem um skip link inline que funciona, enquanto `common/SkipLink.tsx` e `a11y/SkipLinks.tsx` nunca são renderizados (`achados-A-ui.md`). Exemplo prático: substituir o `<a>` inline de `AppLayout.tsx:72` por `<SkipLinks/>` e dar `id="main-nav"` ao `<aside>` de `:120`, que é o alvo que `SkipLink.tsx:43` espera. Benefício: pular para conteúdo **e** para navegação, com um componente só. Impacto: Alto · Esforço: P · Ref.: WCAG 2.2 2.4.1 (bypass blocks)

**U-091 · Landmarks nomeados e sem aninhamento errado** — `AppLayout.tsx:68` declara `role="application"` no wrapper, o que faz leitores de tela entrarem em modo de aplicação e perderem os atalhos de navegação por landmark. Exemplo prático: remover `role="application"` de `AppLayout.tsx:68`, mantendo `aria-label`, e garantir `<nav aria-label>` na sidebar (`:120` é `<aside>` sem `nav` interno nomeado). Benefício: navegação por landmarks volta a funcionar no NVDA/VoiceOver. Impacto: Alto · Esforço: P · Ref.: WCAG 2.2 1.3.1

**U-092 · `<nav>` da sidebar com `aria-label`** — `AppLayout.tsx:120` usa `<aside>` e `organisms/layout/Sidebar.tsx` não emite `<nav aria-label="Navegação principal">`. Exemplo prático: envolver a lista de grupos em `Sidebar.tsx` com `<nav aria-label="Navegação principal">`. Benefício: o leitor distingue menu principal de menu mobile (`MobileNavigation.tsx:82` já tem label). Impacto: Médio · Esforço: P · Ref.: WCAG 2.2 1.3.1

**U-093 · Grupo colapsável da sidebar anuncia expandido/recolhido** — `SidebarAccordionGroup.tsx:69` usa `Collapsible` com `CollapsibleTrigger asChild`, mas o estado não é exposto explicitamente em todos os caminhos. Exemplo prático: garantir `aria-expanded={open}` e `aria-controls` no trigger de `SidebarAccordionGroup.tsx:70`. Benefício: o usuário de teclado sabe se o grupo está aberto. Impacto: Médio · Esforço: P · Ref.: WCAG 2.2 4.1.2

**U-094 · Itens de menu são links, não botões** — `SidebarNavButton.tsx:87,108` usa `<button>` + `onClick` → `navigate`: sem `Ctrl+clique`, sem "abrir em nova aba", sem menu de contexto do browser. Exemplo prático: trocar por `<Link to={item.path}>` (ou `asChild`) mantendo `onMouseEnter` de prefetch (`:90,111`) e os haptics do `handleClick`. Benefício: navegação multi-aba volta a existir no menu. Impacto: Alto · Esforço: M · Ref.: WCAG 2.2 2.1.1 / NN/g "Flexibility"

**U-095 · Cards e linhas clicáveis viram links** — Dos 69 `navigate(`, casos como `RecebimentoPage.tsx:269` e `TriagemPage.tsx:659` são clique em linha; só 13 `<Link>` existem no projeto. Exemplo prático: nas listas de operação, envolver o título da linha em `<Link to={...}>` e manter o `onClick` no container apenas como atalho. Benefício: operador abre 3 recebimentos em abas e trabalha em paralelo. Impacto: Alto · Esforço: G · Ref.: NN/g "Flexibility and efficiency of use"

**U-096 · Anúncio de rota em região `aria-live`** — Há `aria-live` em 8 arquivos (`LiveRegion`, `Announce`, `AsyncStates` — `achados-A-ui.md`), nenhum ligado à navegação. Exemplo prático: em `AppLayout.tsx`, no `useEffect` de `location.pathname`, chamar o `Announce` existente com o label do crumb atual (`Breadcrumbs.tsx:87-109`): "Conferência de Recebimento, lote 2291". Benefício: troca de tela deixa de ser silenciosa para leitor de tela. Impacto: Alto · Esforço: M · Ref.: WCAG 2.2 4.1.3 (status messages)

**U-097 · Título do documento muda por rota** — Só 34/87 páginas definem título (`achados-A-ui.md`) e há dois hooks duplicados (`useHead`, `useDocumentTitle`) com 1 uso. Exemplo prático: num `useEffect` de `AppLayout.tsx`, setar `document.title = \`${crumbAtual} · Estoki\``a partir de`routeMeta.ts` (U-025), eliminando os dois hooks. Benefício: histórico do browser e troca de aba passam a ser legíveis. Impacto: Alto · Esforço: M · Ref.: WCAG 2.2 2.4.2 (page titled)

**U-098 ·`documentElement.lang`acompanha o i18next** —`achados-A-ui.md`: 0 ocorrências de `documentElement.lang`/`languageChanged`, com 3 locales ativos. Exemplo prático: em `src/i18n/index.ts`, no evento `languageChanged`, fazer `document.documentElement.lang = lng`. Benefício: leitor de tela pronuncia os rótulos de navegação no idioma certo. Impacto: Médio · Esforço: P · Ref.: WCAG 2.2 3.1.1

**U-099 · Ordem de tabulação: menu antes do conteúdo, header antes do menu** — No DOM de `AppLayout.tsx` o`<main>` (`:98`) vem **antes** do `<aside>` da sidebar (`:120`): a tabulação chega ao menu depois de todo o conteúdo. Exemplo prático: reordenar o JSX para `header → aside → main`em

`AppLayout.tsx:84-146`, mantendo o posicionamento visual por CSS fixo. Benefício: ordem de foco igual
à ordem visual. Impacto: Alto · Esforço: M · Ref.: WCAG 2.2 2.4.3

**U-100 · Foco visível em todo alvo de navegação** — `achados-A-ui.md`registra 5`outline-none`em

`ui/`; `SidebarNavButton.tsx:33-39`não declara`focus-visible:ring`. Exemplo prático: acrescentar
`focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2`ao`className`de
`SidebarNavButton.tsx:34`e aos três Voltar. Benefício: navegação por teclado deixa de ser às cegas.
Impacto: Alto · Esforço: P · Ref.: WCAG 2.2 2.4.7 / 2.4.11 (focus not obscured)

**U-101 · Foco não fica escondido sob o header sticky** —`organisms/layout/Header.tsx:48`é

`sticky top-0 z-50`e`Breadcrumbs.tsx:138` `sticky top-16`: ao tabular para um elemento no topo da
lista, ele aparece atrás das barras. Exemplo prático: adicionar `scroll-margin-top: 7rem`
(`scroll-mt-28`) ao `<main>`e aos containers de lista. Benefício: o elemento focado fica visível.
Impacto: Alto · Esforço: P · Ref.: WCAG 2.2 2.4.11

**U-102 ·`Stepper`com semântica de navegação** —`navigation/Stepper.tsx:15`é uma`div onClick`sem

`role`, `tabIndex`nem`aria-current`(hoje morto, mas candidato a reuso em U-130). Exemplo prático:
reescrever como`<ol>`de`<button aria-current={i===current?"step":undefined}>`, mesmo tratamento em
`common/StepProgress.tsx:36`e`PersistentStepper.tsx:41`. Benefício: etapa atual anunciada e
acessível por teclado. Impacto: Alto · Esforço: M · Ref.: WCAG 2.2 4.1.2

**U-103 · Progresso do fluxo anunciado como texto** — `StepProgress.tsx:48`e`PersistentStepper.tsx:56` comunicam etapa só por cor/número visual. Exemplo prático: acrescentar `<span className="sr-only">Etapa {i+1} de {steps.length}: {label}</span>`nos dois componentes e

`role="progressbar"`com`aria-valuenow`no trilho de`StepProgress.tsx:22-29`. Benefício: operador
cego acompanha a triagem de 5 etapas. Impacto: Alto · Esforço: P · Ref.: WCAG 2.2 1.3.1

**U-104 · Breadcrumb como lista ordenada** — `Breadcrumbs.tsx:132-187`usa`motion.nav`+`motion.span`: sem `<ol>/<li>`, o leitor não informa "1 de 3". Exemplo prático: trocar os `span`por`<ol><li>` mantendo os`variants`, aproveitando o `ui/breadcrumb.tsx`já existente (que tem`aria-current`em

`:60`). Benefício: trilha navegável item a item. Impacto: Médio · Esforço: M · Ref.: WCAG 2.2 1.3.1

**U-105 · Separador de breadcrumb escondido do leitor** — `Breadcrumbs.tsx:156`renderiza`ChevronRight` sem`aria-hidden`, lido como "maior que" entre cada item. Exemplo prático: `aria-hidden="true"`no

`ChevronRight`de`:156`e no`Home`de`:165`(com`sr-only` "Início" no link). Benefício: trilha
lida sem ruído. Impacto: Médio · Esforço: P · Ref.: WCAG 2.2 1.1.1

### 3.2 Baixa visão, zoom e preferências

**U-106 · Navegação sobrevive a 200% de zoom** — `AppLayout.tsx:60` fixa a sidebar em `280px` e

`MobileNavigation.tsx:85` em `max-w-md`: com zoom de texto os rótulos (`SidebarNavButton.tsx:68`
`truncate`) são cortados sem alternativa. Exemplo prático: trocar `truncate` por `line-clamp-2` com
`min-h`, e definir a largura em `rem` (`w-[17.5rem]`) para escalar com a fonte. Benefício: menu usável
com fonte grande. Impacto: Alto · Esforço: M · Ref.: WCAG 2.2 1.4.4 / 1.4.10

**U-107 · Tamanho de fonte ajustável pelo usuário** — Não há controle de escala de texto; o tema tem

`ThemeToggle` mas nada de tipografia. Exemplo prático: adicionar em `/configuracoes` um seletor
`Confortável / Grande / Muito grande` que aplica `data-font-scale` no `<html>` e, em `src/index.css`,
`html[data-font-scale="lg"]{font-size:18px}` com todas as medidas de nav já em `rem`. Benefício:
operador de 50+ anos lê o menu sem zoom do browser. Impacto: Alto · Esforço: M · Ref.: WCAG 2.2 1.4.4

**U-108 · Modo alto contraste para a navegação** — Os tokens de sidebar usam opacidades fracas

(`text-sidebar-foreground/60` em `SidebarNavButton.tsx:38`, `/40` no ícone em `:61`, `/30` no
separador de `Breadcrumbs.tsx:146`). Exemplo prático: criar `html[data-contrast="high"]` em
`src/index.css` elevando esses tokens para 100% e expor o toggle junto do `ThemeToggle`. Benefício:
galpão com reflexo deixa de esconder o menu. Impacto: Médio · Esforço: M · Ref.: WCAG 2.2 1.4.3 /
1.4.11

**U-109 · `forced-colors` respeitado nos indicadores** — O traço de ativo (`SidebarNavButton.tsx:46`) e

o realce do crumb (`Breadcrumbs.tsx:181`) são fundo colorido, que desaparece no modo de cores forçadas
do Windows. Exemplo prático: bloco `@media (forced-colors: active)` em `src/index.css` com `border` e
`outline` explícitos nesses seletores. Benefício: navegação funciona no modo de contraste do sistema.
Impacto: Médio · Esforço: M · Ref.: WCAG 2.2 1.4.11

**U-110 · Área de clique do crumb com 24px mínimos** — `Breadcrumbs.tsx:171` usa `px-2 py-1 text-xs`:

~22px de altura, abaixo do mínimo. Exemplo prático: `min-h-6 px-3 py-1.5` nos links de `:159` e
`:168`. Benefício: trilha clicável com o dedo. Impacto: Médio · Esforço: P · Ref.: WCAG 2.2 2.5.8

**U-111 · Alvos de 24px no bottom nav e no FAB** — `MobileNavigation.tsx:94,107,126,190` já usa

`min-h-[48px] min-w-[64px]` (ok); o problema é o FAB de `:164` (`h-16 w-16`, ok) vizinho a 48px de
folga mínima. Exemplo prático: documentar o padrão em `.claude/skills/estoki-v2/SKILL.md` e adicionar
teste de `min-height` em `tests/e2e/a11y-smoke.spec.ts`. Benefício: regressão de alvo pequeno é
barrada. Impacto: Médio · Esforço: M · Ref.: WCAG 2.2 2.5.8

**U-112 · Rótulo de ícone sempre visível no bottom nav** — `MobileNavigation.tsx:143-150` mostra o texto

em `text-[10px]`; com `tracking-tighter` e `uppercase` fica quase ilegível. Exemplo prático: subir
para `text-[11px]`, remover `tracking-tighter` e permitir 2 linhas com `leading-tight`. Benefício:
ícone + texto legível, não ícone + mancha. Impacto: Médio · Esforço: P · Ref.: NN/g "Icon usability"

**U-113 · Tooltip não é a única fonte do rótulo na sidebar colapsada** — `SidebarNavButton.tsx:83-103`

depende de `Tooltip` no estado colapsado: no touch não há hover. Exemplo prático: no mobile/touch,
forçar o estado expandido (ou mostrar o label em `text-[9px]` sob o ícone) em `AppLayout.tsx:60`.
Benefício: menu colapsado deixa de ser um mural de ícones. Impacto: Médio · Esforço: M · Ref.: NN/g
"Recognition rather than recall"

**U-114 · Navegação por teclado nas abas** — Os 33 `<Tabs>` usam o Radix (acessível), mas

`RecebimentoPage.tsx:197` aplica `overflow-x-auto` sem indicar que há abas fora da viewport. Exemplo
prático: adicionar setas de rolagem com `aria-hidden` e `scroll-snap`, garantindo que `focus` na aba a
traga para a vista (`scrollIntoView({inline:"nearest"})`). Benefício: aba 6 de 6 alcançável por
teclado e por toque. Impacto: Médio · Esforço: M · Ref.: WCAG 2.2 2.1.1

**U-115 · `Esc` fecha overlays de navegação em cascata previsível** — `ShortcutsHUD.tsx:21` fecha com

`Esc` global; o menu mobile de `AppLayout.tsx:148` não; o `CommandDialog` fecha pelo Radix. Com dois
abertos, `Esc` fecha o errado. Exemplo prático: criar `src/lib/overlayStack.ts` (pilha de overlays) e
fazer `Esc` fechar só o topo, registrando HUD, menu mobile e FAB. Benefício: `Esc` sempre desfaz a
última coisa aberta. Impacto: Médio · Esforço: M · Ref.: NN/g "User control and freedom"

**U-116 · FAB alcançável por teclado e fechável por `Esc`** — `MobileNavigation.tsx:157-176` é um

`motion.button` com overlay em `:32`; o overlay fecha só por clique (`:37`) e o painel de `:46` não
prende foco. Exemplo prático: `aria-expanded` no FAB, `role="dialog" aria-modal` no painel de `:47`,
foco no primeiro item e `Esc` via `overlayStack` (U-115). Benefício: ações rápidas acessíveis sem
toque. Impacto: Médio · Esforço: M · Ref.: WCAG 2.2 2.1.2

**U-117 · Tour de onboarding navegável por teclado e cancelável** — `OnboardingTour.tsx` navega entre

rotas (`:route` nos steps) e usa `useLocalStorage`; é preciso garantir foco preso no card e `Esc` para
sair. Exemplo prático: dar `role="dialog" aria-modal="true" aria-labelledby` ao card de
`OnboardingTour`, foco inicial no botão "Próximo" e `Esc` → fechar + marcar como visto. Benefício: o
tour deixa de ser armadilha para teclado. Impacto: Médio · Esforço: M · Ref.: WCAG 2.2 2.1.2

**U-118 · Tour não força navegação sem aviso** — Os steps de `OnboardingTour.tsx:24-50` têm `route`,

logo avançar o tour troca a rota do usuário sem ele pedir. Exemplo prático: mostrar "Isso vai abrir
/recebimento" no card e só navegar após o clique, usando `replace` para não encher o histórico.
Benefício: o usuário não se perde depois do tour. Impacto: Médio · Esforço: P · Ref.: WCAG 2.2 3.2.5
(mudança por solicitação)

**U-119 · Reduced motion no tour e no confete** — `achados-A-ui.md`: `Confetti.tsx`, `Fireworks.tsx` e

`ConquistaNotificacoes.tsx:230` ignoram a preferência; `FormularioTriagem.tsx:74` dispara
`showCelebration` ao concluir. Exemplo prático: com `MotionConfig` de U-056 aplicado, trocar as
animações imperativas por `motion` ou checar `useReducedMotion()` antes de `showCelebration`.
Benefício: conclusão de triagem não causa enjoo. Impacto: Médio · Esforço: M · Ref.: WCAG 2.2 2.3.3

**U-120 · Rótulo de navegação traduzido** — `sidebarNavData.ts:56-172` e `Breadcrumbs.tsx:9-72` têm os

rótulos em PT-BR literais, e `t()` só aparece em 2/640 arquivos (`achados-A-ui.md`). Exemplo prático:
trocar `label: "Receber"` por `labelKey: "nav.receber"` em `routeMeta.ts` (U-025) e resolver com `t()`
nos dois consumidores, populando `pt-BR/en/es`. Benefício: navegação funciona nos 3 idiomas
declarados. Impacto: Médio · Esforço: G · Ref.: WCAG 2.2 3.1.2

## 4 · Otimização de fluxos complexos (U-121 a U-150)

### 4.1 Guardas de saída e ações irreversíveis

**U-121 · Corrigir `useBlocker` sem data router** — `useUnsavedChanges.ts:23` e

`useNavigationGuard.ts:13` chamam `useBlocker` de `react-router-dom@^7.18.5` (package.json:162), mas
`App.tsx:22` usa `<BrowserRouter>` e não existe `createBrowserRouter` em `src` (grep = 0); em v7
`useBlocker` exige data router, então as guardas de `FormularioTriagem.tsx:246`,
`ConferenciaRecebimento.tsx:256` e `Configuracoes.tsx:114` são **NÃO VERIFICADO em runtime** e
provavelmente não bloqueiam. Exemplo prático: validar em dev (`npm run dev`, porta 8080) e, se
confirmado, implementar a guarda sem `useBlocker` — interceptar os pontos de saída
(`useBackNavigation` de U-001, `useSwipeBack`, cliques de menu em `useAppLayoutState.ts:49`) via
`NavigationGuardContext`. Benefício: o "tem alterações não salvas" volta a existir nas 3 telas de ação
irreversível. Impacto: Alto · Esforço: M · Ref.: NN/g "Error prevention"

**U-122 · Migrar para data router (`createBrowserRouter`)** — Sem data router não há `useBlocker`,

`ScrollRestoration`, `useNavigation` nem `errorElement`, que são exatamente as peças que faltam em
U-030, U-031, U-062 e U-121. Exemplo prático: converter `App.tsx:20-77` para
`createBrowserRouter([...])` + `<RouterProvider>`, mantendo os arrays de `src/routes/*.tsx` como
`children` (hoje já são `<Route>` soltos, conversão mecânica) e cobrir com
`tests/e2e/routes-smoke.spec.ts`. Benefício: desbloqueia 4 melhorias de navegação de uma vez. Impacto:
Alto · Esforço: G · Ref.: NN/g "User control and freedom" · **⚠️ regra 8** (arquitetura)

**U-123 · `LeaveGuard` nas telas de ação irreversível que não têm** — Só 3 telas usam; ficam sem guarda

`PickingPage` (confirma coleta, `:171`), `AjustesEstoque`, `Posicoes.tsx:184,193` (mutações sem
try/catch, `achados-A-ui.md`) e os 21 diálogos com `Input` fora de `<form>`. Exemplo prático:
adicionar `<LeaveGuard hasChanges={...}/>` em `PickingPage.tsx:80` (quando há
`confirmQty`/`scannedCode` preenchidos) e em `AjustesEstoque.tsx`. Benefício: nenhuma contagem
digitada se perde por um toque errado. Impacto: Alto · Esforço: M · Ref.: NN/g "Error prevention"

**U-124 · Diálogo de confirmação próprio substitui os 5 `confirm()` nativos** — `achados-A-ui.md`:

`CustomersPage.tsx:235`, `WarehousesPage.tsx:230`, `CategoriesPage.tsx:192`,
`NotificationsPage.tsx:138`, `MFASettings.tsx:50`, embora `ui/confirm-dialog.tsx` exista e esteja
pronto (`:15-39`). Exemplo prático: trocar cada `window.confirm` por
`<ConfirmDialog variant="destructive">`, uma PR por tela. Benefício: confirmação consistente,
traduzível e acessível (o `confirm()` nativo ignora tema e i18n). Impacto: Alto · Esforço: M · Ref.:
NN/g "Error prevention"

**U-125 · Confirmação nos 4 deletes que não têm nenhuma** — `achados-A-ui.md`: `KPIMetasTable.tsx:65`,

`PasskeySettings.tsx:236`, `RelatoriosAgendados.tsx:284`, `KPIsPage.tsx:405` apagam direto no clique.
Exemplo prático: envolver cada um em `ConfirmDialog` com o nome do registro no texto ("Apagar a meta
OEE de novembro?"). Benefício: clique acidental deixa de apagar configuração. Impacto: Alto · Esforço:
M · Ref.: NN/g "Error prevention"

**U-126 · Desfazer em vez de confirmar onde é possível** — Para ações reversíveis (arquivar notificação,

remover filtro salvo) confirmar é atrito. Exemplo prático: usar
`toast.success(..., { action: { label: "Desfazer", onClick } })` do Sonner em
`NotificationsPage.tsx:138` e nos filtros salvos, em lugar do diálogo. Benefício: menos cliques no
caminho feliz, com rede de segurança. Impacto: Médio · Esforço: M · Ref.: NN/g "User control and
freedom"

**U-127 · Botão de ação fica desabilitado enquanto a mutação corre** — `achados-A-ui.md`:

`Posicoes.tsx:184,193`, `EstoquePage.tsx:71` e 6 arquivos com `.mutate` não checam `isPending`; o
operador clica duas vezes e navega no meio. Exemplo prático: `disabled={mutation.isPending}` + spinner
nos botões citados, começando por `Posicoes.tsx:184`. Benefício: sem duplicidade de movimentação de
estoque por duplo clique. Impacto: Alto · Esforço: M · Ref.: NN/g "Visibility of system status"

### 4.2 Salvar, retomar e progresso em fluxo longo

**U-128 · Rascunho automático de fluxo interrompido** — `FormularioTriagem.tsx:63-79` tem 16 estados

(checklist, fotos, volumes, quantidades) só em memória; fechar a aba perde tudo. Exemplo prático:
criar `src/hooks/useDraft.ts` (`useDraft("triagem:"+id, estado, {debounce:1000})` sobre
`localStorage`) e ligar em `FormularioTriagem.tsx:63` e `ConferenciaRecebimento.tsx:42-52`. Benefício:
queda de rede ou bateria não custa a triagem. Impacto: Alto · Esforço: M · Ref.: NN/g "Error recovery"

**U-129 · Aviso de retomada ao reabrir o fluxo** — Com rascunho salvo, é preciso oferecer a escolha.

Exemplo prático: no mount de `FormularioTriagem.tsx:63`, se houver rascunho, mostrar banner "Você tem
uma triagem em andamento desta remessa (há 12 min) — Retomar / Começar de novo". Benefício: o operador
decide, em vez de descobrir estado estranho. Impacto: Alto · Esforço: M · Ref.: NN/g "User control and
freedom"

**U-130 · Barra de progresso persistente nos 2 fluxos longos** — `ConferenciaRecebimento.tsx:257` usa

`PersistentStepper` (sticky), mas `FormularioTriagem.tsx:248` usa `StepProgress` não-sticky: rolando a
etapa 5, o operador perde a referência de onde está. Exemplo prático: trocar `StepProgress` por
`PersistentStepper` em `FormularioTriagem.tsx:248` e eliminar `common/StepProgress.tsx` (único
consumidor). Benefício: etapa sempre visível nas 641 linhas do formulário. Impacto: Alto · Esforço: P
· Ref.: NN/g "Visibility of system status"

**U-131 · Progresso numérico além do visual** — `PersistentStepper.tsx:35-91` mostra bolinhas; em `sm`

esconde o rótulo (`:58` `hidden sm:block`): no celular o operador vê 5 círculos sem nome. Exemplo
prático: no mobile, renderizar "Etapa 3 de 5 · Checklist" acima das bolinhas em
`PersistentStepper.tsx:35`. Benefício: contexto no celular de doca. Impacto: Alto · Esforço: P · Ref.:
Material Design "Progress indicator"

**U-132 · Etapas concluídas são clicáveis para revisão** — `PersistentStepper.tsx:46` só dispara

`haptics.light()`, sem `onClick` de navegação; `FormularioTriagem.tsx:523` só permite "Anterior" de 1
em 1. Exemplo prático: dar `onStepClick` ao `PersistentStepper` habilitado apenas para
`index < currentStep`, atualizando `?etapa=` (U-015). Benefício: revisar a etapa 1 na etapa 5 sem 4
cliques de voltar. Impacto: Alto · Esforço: M · Ref.: NN/g "Flexibility and efficiency of use"

**U-133 · Bloqueio de avanço explicado no ponto de ação** — `FormularioTriagem.tsx:573-577` mostra

"Complete todos os requisitos da {etapa}" abaixo do botão, sem dizer qual item falta (a lógica está em
`:204-218`). Exemplo prático: derivar a lista de pendências em `:204` e exibi-las como checklist com
link para o campo (`scrollIntoView` + `focus`). Benefício: operador sai do impasse sozinho. Impacto:
Alto · Esforço: M · Ref.: NN/g "Help users recognize, diagnose, and recover from errors"

**U-134 · Tempo estimado real em vez de valor fixo** — `FormularioTriagem.tsx:258-259` exibe

`taktTime="0:42"` e `tempoEstimado="08:15"` **hardcoded** quando `activeStep === 4`. Exemplo prático:
calcular a partir de `productivity` (`:79`) e do histórico do próprio usuário, ou remover os campos
até haver dado; nunca exibir número falso. Impacto: Alto · Esforço: M · Ref.: NN/g "Visibility of
system status"

**U-135 · Validação de scan real no Picking** — `PickingPage.tsx:129` preenche

`setScannedCode("PROD-SCAN-OK")` fixo e `handleConfirm` (`:65-78`) não compara SKU nem quantidade
esperada (`activeTask.quantidade`, exibido em `:113`). Exemplo prático: comparar `scannedCode` com o
SKU da tarefa e `qty` com `activeTask.quantidade`, bloqueando confirmação divergente e oferecendo
"registrar divergência"; o botão de `:126` passa a abrir o scanner real (`/scanner`). Benefício:
elimina confirmação cega de coleta — o pior buraco de fluxo do WMS hoje. Impacto: Alto · Esforço: M ·
Ref.: NN/g "Error prevention"

**U-136 · Fluxo de divergência sem sair do fluxo principal** — Em `RecebimentoPage.tsx:380` a

divergência leva a outra rota; o conferente perde o contexto da conferência. Exemplo prático: abrir a
divergência como `Sheet` lateral sobre a conferência, salvando e voltando ao mesmo passo (com
`?painel=divergencia` na URL, U-173). Benefício: registrar o problema sem reiniciar a conferência.
Impacto: Alto · Esforço: M · Ref.: NN/g "Flexibility and efficiency of use"

**U-137 · Fila de trabalho substitui a volta à lista a cada item** — `FormularioTriagem.tsx:175,182`

volta para `/triagem` ao concluir; com 30 itens, são 30 idas e voltas. Exemplo prático: ao concluir,
oferecer "Próximo item da fila" navegando direto para `/triagem/${proximoId}` (`replace: true`),
calculando o próximo a partir do filtro ativo em `TriagemPage.tsx:74-78`. Benefício: lote de triagem
sem passar pela lista. Impacto: Alto · Esforço: M · Ref.: NN/g "Efficiency of use"

**U-138 · Mesma fila no Picking e na Conferência** — `PickingPage.tsx:75` zera `activeTask` ao

confirmar, voltando à lista; `ConferenciaRecebimento.tsx:175` navega para `/recebimento`. Exemplo
prático: aplicar o padrão de U-137 nas duas telas, com botão secundário "Voltar para a lista".
Benefício: o operador fica no fluxo, não no índice. Impacto: Alto · Esforço: M · Ref.: NN/g
"Efficiency of use"

**U-139 · Resumo antes de confirmar nas ações irreversíveis** — `ConferenciaRecebimento.tsx:390` tem

"Cancelar"/confirmar lado a lado sem recapitular o que será gravado (quantidade, peso, embalagem,
volumes de `:43-50`). Exemplo prático: inserir um passo "Revisar" com os valores e os deltas em
relação ao esperado antes do submit. Benefício: erro de digitação é pego antes de virar movimentação.
Impacto: Alto · Esforço: M · Ref.: NN/g "Error prevention"

**U-140 · Estado "em andamento" visível na lista de origem** — Quem abandonou uma conferência não vê

isso em `RecebimentoPage.tsx:196-235` (as abas incluem `em_conferencia`, mas não "sua conferência
pendente"). Exemplo prático: com os rascunhos de U-128, marcar as linhas com rascunho local ("Você tem
uma conferência em andamento") e botão "Retomar". Benefício: trabalho interrompido não é refeito do
zero. Impacto: Alto · Esforço: M · Ref.: NN/g "Recognition rather than recall"

**U-141 · Fluxos paralelos identificados por aba do browser** — Com `useState` como fonte de verdade

(`PickingPage.tsx:32`) e `localStorage` nos rascunhos, duas abas se sobrescrevem. Exemplo prático:
usar chave de rascunho com `sessionStorage` por aba + um `BroadcastChannel("estoki-flows")` que avisa
"esta remessa já está aberta em outra aba". Benefício: dois conferentes (ou duas abas) não gravam em
cima um do outro. Impacto: Alto · Esforço: G · Ref.: NN/g "Error prevention"

**U-142 · `zenMode` da Triagem persistido e saindo com `Esc`** — `TriagemPage.tsx:79` guarda `zenMode`

em state: recarregar sai do modo e nada documenta como sair. Exemplo prático: persistir em
`localStorage`, registrar `Esc` no `overlayStack` (U-115) e mostrar um chip "Modo foco · Esc para
sair". Benefício: modo de foco deixa de ser uma armadilha. Impacto: Médio · Esforço: P · Ref.: NN/g
"User control and freedom"

**U-143 · Paginação da lista na URL** — `TriagemPage.tsx:77` lê `page` de `searchParams` no init mas o

estado seguinte é local: Voltar não retorna à página 3. Exemplo prático: usar `useFilterParams`
(U-019) para `page` com `replace:false` (navegação real entre páginas). Benefício: Voltar volta para a
página da lista onde o usuário estava. Impacto: Alto · Esforço: P · Ref.: NN/g "User control and
freedom"

**U-144 · Seleção múltipla não se perde ao navegar** — `TriagemPage.tsx:65` mantém `selectedIds` em

state; abrir um item e voltar zera a seleção. Exemplo prático: elevar `selectedIds` para
`sessionStorage` por rota (ou contexto de lista) e restaurar no retorno, junto da restauração de
scroll (U-030). Benefício: ação em lote de 20 itens sobrevive a uma conferida no detalhe. Impacto:
Alto · Esforço: M · Ref.: NN/g "Minimize memory load"

**U-145 · Erro de rota não engole o fluxo inteiro** — `RouteErrorBoundary.tsx:64` recria o boundary por

`location.pathname`, mas o fallback (`:39-51`) só oferece "Recarregar" e "Página Inicial": o rascunho
em memória morre. Exemplo prático: acrescentar "Voltar" (`BackButton`) e, se houver rascunho (U-128),
a frase "seus dados desta conferência foram salvos localmente". Benefício: erro técnico deixa de
implicar perda de trabalho. Impacto: Alto · Esforço: M · Ref.: NN/g "Error recovery"

**U-146 · Rota `conferencia` e `formulario-triagem` sem parâmetro redirecionam** — Ambas existem como

paths soltos (`src/routes/*`), e abertas sem id mostram tela vazia
(`ConferenciaRecebimento.tsx:242-250` já trata "não encontrado"). Exemplo prático:
`<Navigate to="/recebimento" replace/>` para `conferencia` sem id e `/triagem` para
`formulario-triagem` sem id. Benefício: URL incompleta não resulta em tela morta. Impacto: Médio ·
Esforço: P · Ref.: NN/g "Error prevention"

**U-147 · "Em breve" deixa de ser destino de navegação** — `achados-A-ui.md` lista 6 ocorrências,

incluindo `FormularioTriagem.tsx:633` (dentro do fluxo de triagem). Exemplo prático: remover o item de
`FormularioTriagem.tsx:633` ou marcá-lo como desabilitado com tooltip, nunca como passo clicável.
Benefício: o fluxo não promete etapa que não existe. Impacto: Médio · Esforço: P · Ref.: NN/g "Help
and documentation"

**U-148 · Caminho de picking otimizado exposto na navegação** — `PickingPage.tsx:52-58` filtra e ordena

por nada; a posição (`posicao_origem_codigo`, `:101`) é o que define o trajeto no galpão. Exemplo
prático: ordenar `filteredTasks` por zona/corredor e mostrar "próxima posição" no card, preparando o
sequenciamento por rota física. Benefício: menos metros caminhados por pedido. Impacto: Alto ·
Esforço: M · Ref.: NN/g "Match between system and real world"

**U-149 · Retomada de fluxo entre dispositivos** — Rascunho local (U-128) não acompanha o operador que

troca de coletor. Exemplo prático: gravar o rascunho também em tabela `fluxos_rascunho` (RLS por
`auth.uid()`) via edge function, com o local como cache. Benefício: trocar de aparelho no meio do
turno não zera o trabalho. Impacto: Médio · Esforço: G · Ref.: NN/g "Flexibility" · **⚠️ regra 8**
(DDL + RLS + edge function)

**U-150 · Timeout de fluxo abandonado com aviso** — Rascunhos acumulariam sem expiração. Exemplo

prático: `useDraft` grava `updatedAt` e descarta rascunho com mais de 24h, avisando no banner de U-129
quando houver descarte. Benefício: rascunho velho não reaparece como estado atual. Impacto: Médio ·
Esforço: P · Ref.: NN/g "Visibility of system status"

## 5 · Testes e validação de navegação (U-151 a U-170)

### 5.1 Testes automatizados

**U-151 · Teste unitário do Voltar com e sem histórico** — `BackButton.tsx:37-48` tem 3 caminhos (idx>0,

rota-pai, fallback) e zero teste; os 20 arquivos de teste do repo não cobrem navegação. Exemplo
prático: `src/hooks/__tests__/useBackNavigation.test.ts` com `createMemoryRouter`, cobrindo
`history.state` ausente, `idx=0` e `idx=3`. Benefício: a regra de Voltar deixa de ser folclore.
Impacto: Alto · Esforço: P · Ref.: NN/g "Consistency"

**U-152 · Teste do breadcrumb para rota `:id`** — `Breadcrumbs.tsx:96-101` cai em "Detalhes" e nada

garante o comportamento após U-022. Exemplo prático:
`src/components/common/__tests__/Breadcrumbs.test.tsx` renderizando `/recebimento/abc-123` e asserting
crumbs `Início › Recebimento › <título>`. Benefício: regressão de trilha é pega no CI. Impacto: Médio
· Esforço: P · Ref.: WCAG 2.2 1.3.1

**U-153 · E2E: Voltar em cada fluxo multi-etapa** — `tests/e2e/wms-flow.spec.ts` existe mas não testa

`page.goBack()` nos steps. Exemplo prático: cenário que entra em `/recebimento/conferencia/:id`,
avança 2 etapas, faz `page.goBack()` duas vezes e assere a etapa 1 (depende de U-017). Benefício: a
promessa "Voltar recua etapa" fica verificada. Impacto: Alto · Esforço: M · Ref.: NN/g "Error
prevention"

**U-154 · E2E: alteração não salva bloqueia a saída** — Nenhum teste cobre `LeaveGuard`; e U-121 indica

que ele pode nem funcionar. Exemplo prático: spec que preenche `FormularioTriagem`, clica em um item
de menu e assere o diálogo "Sair sem salvar?" (`LeaveGuard.tsx:12`). Benefício: a guarda passa a ser
provada, não presumida. Impacto: Alto · Esforço: M · Ref.: NN/g "Error prevention"

**U-155 · E2E: nenhuma rota do menu dá 404** — `routes-smoke.spec.ts:12-40` lista rotas à mão, derivada

manualmente de `src/routes/*`, e pode divergir. Exemplo prático: gerar a lista de `routeMeta.ts`
(U-025) em tempo de teste e assertar que cada item de `sidebarNavData` responde sem `NotFound` nem
error boundary. Benefício: item de menu quebrado não chega em produção. Impacto: Alto · Esforço: M ·
Ref.: NN/g "Error prevention"

**U-156 · E2E: deep link autenticado volta ao destino após login** — `auth-navigation.spec.ts` existe; o

cenário de U-036 não. Exemplo prático: abrir `/recebimento/conferencia/:id` sem sessão, logar e
assertar que a URL final é a pedida. Benefício: link de alerta por e-mail passa a ter contrato
testado. Impacto: Alto · Esforço: M · Ref.: NN/g "Flexibility"

**U-157 · E2E: estado de aba e filtro sobrevive a reload** — Depende de U-018/U-019. Exemplo prático:

spec que seleciona a aba "Divergência" em `/recebimento`, recarrega e assere a aba ativa pela URL.
Benefício: a URL como estado fica garantida. Impacto: Médio · Esforço: M · Ref.: NN/g "Visibility of
system status"

**U-158 · E2E mobile: swipe-back e bottom nav** — Nenhum spec usa viewport mobile nem `touchscreen`.

Exemplo prático: projeto Playwright `mobile` (`devices["Pixel 7"]`) em `playwright.config.ts`, com
spec de swipe da borda (`useSwipeBack.ts:19,35`) e de toque nos 4 itens de
`MobileNavigation.tsx:115,179`. Benefício: a navegação do coletor passa a ser testada. Impacto: Alto ·
Esforço: M · Ref.: Apple HIG "Gestures"

**U-159 · `a11y-smoke` cobre as telas de navegação** — `a11y-smoke.spec.ts:20` roda só `["/","/auth"]` e

`:8-12` exclui `/auth/login` por contraste. Exemplo prático: estender para `/recebimento`, `/triagem`,
`/picking`, `/recebimento/conferencia/:id` e, depois de U-087, remover a exclusão. Benefício:
regressão de contraste e rótulo barrada nas telas que importam. Impacto: Alto · Esforço: M · Ref.:
WCAG 2.2 (auditoria automatizada)

**U-160 · Teste de foco após troca de rota** — Depende de U-086. Exemplo prático: spec que navega pelo

menu e assere `document.activeElement` dentro de `#main-content`. Benefício: a correção de foco não
regride. Impacto: Médio · Esforço: M · Ref.: WCAG 2.2 2.4.3

**U-161 · Teste de ordem de tabulação do shell** — Depende de U-099. Exemplo prático: spec que pressiona

`Tab` 5 vezes a partir do `body` e assere a sequência skip link → header → menu → conteúdo. Benefício:
a reordenação do DOM fica travada por teste. Impacto: Médio · Esforço: M · Ref.: WCAG 2.2 2.4.3

**U-162 · Guard de CI contra `window.confirm` e `<a href>` interno** — Hoje nada impede voltar a usar

`confirm()` (5 casos) ou `<a href="/">` (`NotFound.tsx:17`), que recarrega o SPA. Exemplo prático:
regra ESLint `no-restricted-globals` para `confirm` e `no-restricted-syntax` para
`JSXAttribute[name.name="href"][value.value=/^\//]` em `eslint.config.js`. Benefício: o padrão passa a
ser imposto, não lembrado. Impacto: Médio · Esforço: P · Ref.: NN/g "Consistency and standards"

**U-163 · Guard de CI contra `<AppLayout>` aninhado** — Depois de U-067, nada impede reintroduzir o

padrão inerte em novas páginas. Exemplo prático: regra `no-restricted-imports` barrando `AppLayout`
fora de `src/App.tsx`/`src/components/layout`. Benefício: a correção de 51 arquivos não é desfeita na
próxima feature. Impacto: Médio · Esforço: P · Ref.: NN/g "Consistency"

### 5.2 Medição, KPIs e pesquisa com usuário

**U-164 · Telemetria de navegação ligada** — `analytics.ts:226-230` instrumenta `history.pushState`, mas

só roda dentro de `initPerformanceTracking()` chamado por `lib/init.ts:38`, e **`initializeApp` nunca
é importado** (`main.tsx` não o chama): zero page_view de SPA. Exemplo prático: emitir o evento no
`useEffect` de `location.pathname` em `AppLayout.tsx` (fonte confiável no React Router) em vez de
monkey-patch, e apagar o patch de `analytics.ts:226-230`. Benefício: base para todos os KPIs
seguintes. Impacto: Alto · Esforço: M · Ref.: NN/g "Measure, don't guess"

**U-165 · KPI "taxa de uso do Voltar" por tela** — Sem telemetria não se sabe se o Voltar é escape ou

fluxo normal. Exemplo prático: evento `nav_back` com
`{from, to, origem: "header"|"breadcrumb"|"bottom"|"swipe"|"teclado"}` nos 4 pontos
(`BackButton.tsx:38`, `MobileNavigation.tsx:104`, `useSwipeBack.ts:36`, `useAppLayoutState.ts:79`),
com painel em `/admin/telemetria`. Benefício: tela com Voltar acima da média é tela com problema de
fluxo. Impacto: Alto · Esforço: M · Ref.: NN/g "Usability metrics"

**U-166 · KPI "tempo de tarefa" por fluxo** — `FormularioTriagem.tsx:79` já tem

`productivity.itemsPerHour` local e descartado. Exemplo prático: marcar
`flow_start`/`flow_step`/`flow_finish` em triagem, conferência e picking, e medir p50/p90 por etapa.
Benefício: prioriza o passo mais lento com número, não com opinião. Impacto: Alto · Esforço: M · Ref.:
NN/g "Time on task"

**U-167 · KPI "taxa de abandono por etapa"** — Com 5 etapas em `FormularioTriagem` e 4 em

`ConferenciaRecebimento.tsx:223`, não se sabe onde o operador desiste. Exemplo prático: funil
`flow_step` → `flow_finish` por etapa, com corte por papel e por dispositivo. Benefício: a etapa que
derruba o fluxo fica identificada. Impacto: Alto · Esforço: M · Ref.: NN/g "Funnel analysis"

**U-168 · KPI de navegação perdida: loops e beco sem saída** — Eventos de `NotFound.tsx` e de

`RouteErrorBoundary.tsx:12` não são reportados. Exemplo prático: evento `nav_404` com o path tentado e
`nav_route_error` com rota + mensagem; alerta quando um path aparece 10x/dia. Benefício: link quebrado
interno aparece sem o usuário reclamar. Impacto: Alto · Esforço: M · Ref.: NN/g "Error tracking"

**U-169 · Heatmap e gravação de sessão nas 5 telas críticas** — Não há ferramenta de heatmap no repo.

Exemplo prático: avaliar solução self-host com máscara total de PII (o `sentry.ts:44-49` já tem replay
com PII removida — reaproveitar, limitando a `/recebimento`, `/triagem`, `/picking`, `/estoque`,
`/hub`). Benefício: ver onde o dedo erra o alvo antes de redesenhar. Impacto: Médio · Esforço: G ·
Ref.: NN/g "Behavioral data" · **⚠️ regra 8** (dado de usuário, custo, segredo)

**U-170 · A/B test de posição do Voltar** — Há 3 posições possíveis (header, barra de breadcrumb, bottom

bar) e nenhuma evidência de qual funciona no coletor. Exemplo prático: flag em `feature_flags` (tabela
já citada em `achados-C-arq.md`) com 2 variantes (header-only vs header+bottom), medindo `nav_back` e
tempo de tarefa de U-166 por 2 semanas. Benefício: decisão por dado em cima da dúvida central do
briefing. Impacto: Médio · Esforço: G · Ref.: NN/g "A/B testing" · **⚠️ regra 8** (flag em produção)

## 6 · Integração com busca, modais e multi-tarefa (U-171 a U-190)

**U-171 · `Spotlight` morto removido em favor da busca real** — `navigation/Spotlight.tsx` duplica a

função de `GlobalSearchDialog` com placeholder em inglês ("Search...", `:15`), sem `DialogTitle`
(`achados-A-ui.md`) e com zero importadores. Exemplo prático: apagar
`src/components/navigation/Spotlight.tsx`. Benefício: uma busca só, acessível, sem risco de alguém
montar a errada. Impacto: Médio · Esforço: P · Ref.: NN/g "Consistency and standards"

**U-172 · Busca global navega com `replace` quando é refinamento** — `GlobalSearchDialog.tsx:140-149`

sempre faz `navigate(path)`: três buscas seguidas empilham 3 entradas e o Voltar precisa de 3 cliques
para sair. Exemplo prático: em `onSelect` (`:141`), usar `replace: true` quando a rota de destino for
igual à atual e `push` quando mudar de módulo. Benefício: Voltar depois da busca retorna de onde o
usuário veio, não para a busca anterior. Impacto: Alto · Esforço: P · Ref.: NN/g "User control and
freedom"

**U-173 · Destino do Voltar após a busca é explicitamente a tela de origem** — Mesmo com `replace`, quem

buscou de `/estoque` e caiu em `/produtos` não tem pista de retorno. Exemplo prático: passar
`state: { fromSearch: true, origin: location.pathname }` em `GlobalSearchDialog.tsx:144` e mostrar no
topo do destino um chip "← Voltar para Estoque" lido desse state. Benefício: a busca deixa de ser
teletransporte sem volta. Impacto: Alto · Esforço: M · Ref.: NN/g "User control and freedom"

**U-174 · Resultado da busca abre o registro, não a lista** — `GlobalSearchDialog.tsx:43-48` mapeia tipo

→ rota de listagem (`/produtos`, `/lotes`, `/posicoes`, `/pedidos`), descartando o `id` que já tem em
mãos (`:111,116,123`). Exemplo prático: navegar para `/produtos?focus=${id}` (ou `/lotes/${id}` onde
houver rota de detalhe) e destacar a linha ao chegar. Benefício: achar um lote deixa de exigir
buscá-lo de novo na lista. Impacto: Alto · Esforço: M · Ref.: NN/g "Efficiency of use"

**U-175 · Busca inclui as rotas do sistema** — `GlobalSearchDialog.tsx:96-108` consulta só `produtos`,

`lotes` e `posicoes`; as "Ações" (`:229+`) são 4 atalhos fixos, então 86 rotas não são encontráveis
por nome. Exemplo prático: indexar `routeMeta.ts` (U-025) num `CommandGroup "Ir para"` com `keywords`,
cobrindo as 12 rotas órfãs de U-026. Benefício: `Ctrl+K` passa a ser a porta das telas sem menu.
Impacto: Alto · Esforço: M · Ref.: NN/g "Recognition rather than recall"

**U-176 · `Ctrl+K` registrado uma vez** — `GlobalSearch.tsx:29` escuta `Ctrl+K` no `document` e

`use-keyboard-shortcuts.ts:28` declara o mesmo atalho em `GLOBAL_SHORTCUTS.SEARCH`, enquanto
`useKeyboardShortcuts.ts:86` liga `Ctrl+F` ao mesmo evento. Exemplo prático: deixar
`GlobalSearch.tsx:29` como único registro, remover `Ctrl+F` de `useKeyboardShortcuts.ts:85-92` e
referenciar o atalho na ajuda. Benefício: um atalho, um comportamento. Impacto: Médio · Esforço: P ·
Ref.: NN/g "Consistency"

**U-177 · Busca recente escopada ao usuário** — `GlobalSearchDialog.tsx:62,70,76` grava

`recent-searches` em `localStorage` sem prefixo de usuário: num coletor compartilhado, o próximo
operador vê as buscas do anterior. Exemplo prático: chavear por `recent-searches:${user.id}` usando
`useAuth()`, e limpar no logout (`useAppLayoutState.ts:44`). Benefício: histórico de busca não vaza
entre turnos. Impacto: Alto · Esforço: P · Ref.: NN/g "Privacy" · **⚠️ regra 8** se envolver dado
sensível de produção

**U-178 · Erro de busca deixa de ser silencioso** — `GlobalSearchDialog.tsx:131-133` tem `catch {}` com

comentário "silently fail": com rede ruim, a busca aparece como "nenhum resultado". Exemplo prático:
estado `error` e mensagem "Não foi possível buscar agora — tentar de novo", distinta de `CommandEmpty`
(`:176`). Benefício: o operador não conclui que o lote não existe. Impacto: Alto · Esforço: P · Ref.:
NN/g "Help users recognize errors"

**U-179 · Modais de navegação refletidos na URL** — Com 51 `DialogContent`, 5 `Sheet` e 1 `Drawer` e

nenhum ligado a `searchParams`, o botão físico de voltar do Android fecha o app em vez de fechar o
diálogo. Exemplo prático: criar `src/hooks useDialogParam.ts` (`?modal=novo-recebimento`) e aplicar
primeiro nos diálogos de criação (`NovoOndaDialog`, criação de cliente em `CustomersPage.tsx:141`,
`AssinaturaConferenciaDialog`). Benefício: Voltar fecha o modal, como o usuário de Android espera.
Impacto: Alto · Esforço: G · Ref.: Material Design "Navigation and dialogs"

**U-180 · Modal aberto não é perdido no reload** — Sem URL, qualquer F5 descarta o diálogo e o que foi

digitado. Exemplo prático: com U-179, reabrir o diálogo a partir de `?modal=` no mount, combinado com
o rascunho de U-128 para os campos. Benefício: recarregar não cancela o cadastro em andamento.
Impacto: Médio · Esforço: M · Ref.: NN/g "Error recovery"

**U-181 · Modal não é usado onde o certo é rota** — `PickingPage.tsx:80` troca a tela toda por state (é

rota, U-014); inversamente, `RecebimentoPage.tsx:380` navega para outra rota quando o certo seria
painel (U-136). Exemplo prático: documentar o critério na skill `estoki-v2` ("muda de tarefa → rota;
detalha a tarefa atual → Sheet/Dialog") e aplicar nessas duas telas. Benefício: o modelo de navegação
fica previsível. Impacto: Alto · Esforço: M · Ref.: Material Design "Dialogs vs full-screen"

**U-182 · `DialogTitle` nos 5 diálogos sem título** — `achados-A-ui.md`: `Spotlight.tsx`, `Gallery.tsx`,

`Lightbox.tsx`, `ImageZoom.tsx`, `MFASettings.tsx:219` — o Radix avisa e o leitor de tela anuncia
"diálogo" sem nome. Exemplo prático: adicionar `DialogTitle` (com `sr-only` onde o design não quer
título visível) nos 4 que sobram após U-171. Benefício: diálogo identificável por leitor de tela.
Impacto: Alto · Esforço: P · Ref.: WCAG 2.2 4.1.2

**U-183 · Foco volta ao gatilho ao fechar o modal** — O Radix faz isso por padrão, mas os overlays

manuais não: `ShortcutsHUD.tsx:39,67` e o menu mobile de `AppLayout.tsx:156` devolvem o foco ao
`body`. Exemplo prático: guardar `document.activeElement` ao abrir e restaurar no fechamento nesses
dois componentes. Benefício: teclado retoma de onde parou. Impacto: Médio · Esforço: P · Ref.: WCAG
2.2 2.4.3

**U-184 · Overlay não navega por baixo** — `ShortcutsHUD.tsx:38` e o overlay do FAB

(`MobileNavigation.tsx:33`) não travam o scroll nem o `Tab` do conteúdo atrás; `usePreventScroll.ts`
existe e não é usado nesses pontos. Exemplo prático: aplicar `usePreventScroll` + `inert` no `<main>`
enquanto o overlay está aberto. Benefício: não se navega atrás de um painel aberto. Impacto: Médio ·
Esforço: M · Ref.: WCAG 2.2 2.1.2

**U-185 · Contexto preservado entre abas do mesmo módulo** — Abrir `/recebimento` em duas abas gera dois

estados independentes que escrevem no mesmo `localStorage` (`sidebar_collapsed`, `recent-searches`,
rascunhos). Exemplo prático: separar o que é por aba (`sessionStorage`: rascunho, filtro) do que é por
usuário (`localStorage`: sidebar, idioma, tema) e documentar a regra. Benefício: trabalhar em duas
abas deixa de corromper preferência e rascunho. Impacto: Alto · Esforço: M · Ref.: NN/g "Flexibility
and efficiency of use"

**U-186 · Sincronização de dados entre abas** — Com `invalidateQueries()` global em

`WMSStatusBadge.tsx:22` (`achados-C-arq.md`) e nada entre abas, uma aba mostra dado velho depois da
ação na outra. Exemplo prático: `BroadcastChannel("estoki-query")` publicando as `queryKey`
invalidadas e, na recepção, `queryClient.invalidateQueries({queryKey})`. Benefício: duas abas abertas
contam a mesma história. Impacto: Médio · Esforço: M · Ref.: NN/g "Consistency"

**U-187 · Abrir em nova aba a partir das listas** — Com 69 `navigate(` imperativos e 13 `<Link>`, o

operador não consegue abrir 3 conferências em paralelo. Exemplo prático: nas linhas das listas de
operação, além do `<Link>` de U-095, adicionar item "Abrir em nova aba" no menu de contexto da linha.
Benefício: multi-tarefa real na doca. Impacto: Médio · Esforço: M · Ref.: NN/g "Flexibility and
efficiency of use"

**U-188 · Aviso de conflito ao editar o mesmo registro em duas abas** — Depende de U-141/U-186. Exemplo

prático: canal de presença por registro (`BroadcastChannel` local + Realtime do Supabase, já usado em
21 arquivos com `channel(`) e banner "Outro usuário está conferindo esta remessa"; já existe
`PresenceAvatars` no header (`organisms/layout/Header.tsx:101`) para reaproveitar. Benefício: evita
conferência duplicada e divergência inventada. Impacto: Alto · Esforço: G · Ref.: NN/g "Error
prevention"

**U-189 · Estado de navegação sobrevive ao modo offline** — `ModoOffline.tsx` existe (426 linhas) e o

`queryClient` usa `networkMode: "offlineFirst"` (`AppProviders.tsx:36`), mas a navegação não avisa
quando a rota depende de rede. Exemplo prático: no `useOnlineStatus` (já usado em
`layout/header/Header.tsx:41`, hoje morto), marcar no menu os módulos indisponíveis offline e bloquear
a navegação com explicação. Benefício: o operador não entra numa tela que não vai carregar. Impacto:
Médio · Esforço: M · Ref.: NN/g "Visibility of system status"

**U-190 · Retomada de navegação após atualização do PWA** — `UpdatePrompt` (`AppProviders.tsx:59`)

recarrega a aplicação; a rota e o estado de fluxo se perdem. Exemplo prático: antes do reload, gravar
`location.pathname + search` em `sessionStorage` e restaurar no boot; combinar com o rascunho de
U-128. Benefício: atualizar o app no meio do turno não custa a tarefa em andamento. Impacto: Médio ·
Esforço: M · Ref.: NN/g "Error recovery"

## 7 · Fundação técnica de navegação (U-191 a U-200)

**U-191 · Apagar os 5 arquivos de layout duplicados e não importados** — Nenhum importador:

`src/components/layout/Header.tsx`, `src/components/layout/header/Header.tsx`,
`src/components/layout/Breadcrumbs.tsx`, `src/components/layout/MobileNavigation.tsx`,
`src/components/layout/SidebarContent.tsx` (os reais são `organisms/layout/*` e
`common/Breadcrumbs.tsx`, importados em `AppLayout.tsx:5,16,17,18`). Exemplo prático: remover os 5
arquivos e o export de `SimpleSidebar` em `src/components/layout/index.ts`. Benefício: ninguém mais
corrige o Voltar no arquivo errado. Impacto: Alto · Esforço: P · Ref.: NN/g "Consistency and
standards"

**U-192 · Apagar `src/components/navigation/*` não usado** — `Stepper`, `Steps`, `Wizard`,

`ContextMenu`, `Navbar` têm zero importadores (e `Spotlight` sai em U-171); `Stepper.tsx:15` e
`Steps.tsx:34` ainda usam `bg-gray-300`/`text-green-600` crus, fora dos tokens. Exemplo prático:
remover a pasta, salvando `Wizard.tsx` em `src/components/navigation/Wizard.tsx` só se U-130 decidir
reaproveitá-lo; nesse caso, reescrever com tokens semânticos e a11y de U-102. Benefício: −6
componentes de navegação fantasma. Impacto: Médio · Esforço: P · Ref.: NN/g "Aesthetic and minimalist
design"

**U-193 · Consolidar os hooks de navegação duplicados** — `achados-C-arq.md` lista pares concorrentes

relevantes para navegação: `useKeyboardShortcuts`/`use-keyboard-shortcuts`, `useHistory` (morto),
`useNavigationGuard`/`useUnsavedChanges`,
`usePermission`/`usePermissions`/`useAuthorization`/`useRoles`, `useOffline`/`useOnlineStatus`.
Exemplo prático: eleger um de cada par (ver U-042 e U-121), reescrever os importadores e apagar o
resto, uma PR por par. Benefício: a próxima correção de navegação atinge o código que roda. Impacto:
Alto · Esforço: G · Ref.: NN/g "Consistency"

**U-194 · `routeMeta.ts` como fonte única de rota** — Hoje a mesma informação vive em 4 lugares

desalinhados: `src/routes/*.tsx` (86 paths), `sidebarNavData.ts` (74 itens), `Breadcrumbs.tsx:9-72`
(72 labels) e `lib/prefetch.ts:11-30` (19 imports). Exemplo prático: criar `src/routes/routeMeta.ts`
(`path, labelKey, icon, group, parent, roles, skeleton, importer`) e refatorar os 4 consumidores em
PRs separadas. Benefício: rota nova nasce com menu, breadcrumb, prefetch e skeleton. Impacto: Alto ·
Esforço: G · Ref.: NN/g "Consistency and standards"

**U-195 · Rotas filhas aninhadas de verdade** — `App.tsx:27-73` tem um nível só;

`/recebimento/conferencia/:id` e `/triagem/:id` são paths planos, sem `Outlet` de módulo. Exemplo
prático: aninhar as rotas de recebimento sob um `ReceivingLayout` com `<Outlet/>`, permitindo
cabeçalho de módulo persistente e breadcrumb derivado da hierarquia real (sem mapa estático).
Benefício: hierarquia de navegação deixa de ser convenção de string. Impacto: Alto · Esforço: G ·
Ref.: Material Design "Navigation hierarchy" · **⚠️ regra 8** (arquitetura de rotas)

**U-196 · `AppLayout` deixa de ser importado estaticamente** — `App.tsx:6` importa `AppLayout` estático,

que por sua vez traz framer-motion (`AppLayout.tsx:12`), `Header`, `Sidebar`, `ShortcutsHUD` e
`PerformanceHUD` (`:19-21`) para o bundle inicial (`achados-C-arq.md`). Exemplo prático: manter o
shell estático (é necessário) mas tornar `ShortcutsHUD` e `PerformanceHUD` lazy como já se faz com
`OnboardingTour` (`:7-9`). Benefício: primeira navegação mais rápida, menos espera antes de poder
navegar. Impacto: Médio · Esforço: M · Ref.: NN/g "Response time"

**U-197 · `AppLayout` dividido em shell + conteúdo** — `AppLayout.tsx` concentra autenticação

(`:53-54`), layout, menu mobile, HUDs e gesto (`:50`): qualquer mudança de navegação arrisca a tela
inteira. Exemplo prático: extrair `AppShell` (header/sidebar/mobile), `AuthGate` (`:53-54`) e
`AppOverlays` (HUDs/tour), com `AppLayout` apenas compondo os três. Benefício: mexer no Voltar deixa
de poder derrubar o login. Impacto: Médio · Esforço: G · Ref.: NN/g "Error prevention"

**U-198 · `AppLayoutContext` documentado ou removido** — `AppLayout.tsx:22,32,52` existe só para

neutralizar o aninhamento de 51 páginas; é a causa das props inertes de U-067. Exemplo prático: depois
de U-067, remover `AppLayoutContext` e o `if (isNested)` de `:52`. Benefício: uma armadilha silenciosa
a menos. Impacto: Médio · Esforço: M · Ref.: NN/g "Consistency"

**U-199 · Painel de saúde da navegação em `/admin/telemetria`** — A rota existe (`adminRoutes`), está

fora do menu (U-026) e não mostra nada de navegação. Exemplo prático: montar nela os KPIs de U-165 a
U-168 (uso do Voltar por origem, tempo por etapa, abandono por etapa, 404 e erros de rota), lendo do
mesmo armazenamento de analytics. Benefício: o dono enxerga a navegação sem pedir relatório. Impacto:
Médio · Esforço: G · Ref.: NN/g "Measure, don't guess" · **⚠️ regra 8** (depende de armazenamento de
evento)

**U-200 · Canal de feedback qualitativo dentro do fluxo** — Não há nenhuma forma de o operador reportar

atrito (`src/pages/help/HelpPage.tsx` é estático). Exemplo prático: botão discreto "Algo confuso
aqui?" no `PageHeader`, abrindo um `Sheet` com 1 campo livre + a rota atual e o papel preenchidos,
gravando em tabela `feedback_ux` com RLS por `auth.uid()`. Benefício: a próxima rodada de prioridade
vem do operador, não de suposição. Impacto: Médio · Esforço: M · Ref.: NN/g "Qualitative research" ·
**⚠️ regra 8** (DDL + RLS)

---

## Riscos

1. **U-122 (data router) é a etapa de maior alcance:** converte `App.tsx` inteiro e, se quebrar, derruba as 86 rotas. Fazer com `routes-smoke.spec.ts` verde antes e depois, e **PR aberta para o dono** (regra 8).
2. **`npm run typecheck` é no-op** (`tsconfig.json files:[]`, `achados-C-arq.md`): nenhuma destas PRs tem verificação real de tipo até isso ser corrigido. Erro de tipo introduzido aqui passa pelo CI.
3. **`npm ci` quebrado:** não introduzir dependência nova em nenhuma etapa; U-169 (heatmap) e U-186 (`BroadcastChannel`) devem usar API nativa.
4. **U-067/U-052 tocam 30 a 51 arquivos:** fatiar em lotes de 5 páginas por PR; uma PR grande aqui bloqueia o merge de todas as outras por conflito.
5. **U-087 (contraste do `--primary`) muda a cor da marca em toda a UI,** não só na navegação: é decisão do dono, não só técnica.
6. **U-135 (validação de scan no Picking) altera regra de negócio:** hoje confirma qualquer coisa; passar a bloquear divergência pode travar operação que se acostumou ao bypass. Combinar com o dono antes de mergear.
7. **U-019/U-143 (filtros na URL) mexem em como o Voltar se comporta nas listas:** se o `replace` ficar invertido, o Voltar passa a desfazer letra por letra — exatamente o problema que se quer evitar. Cobrir com U-157 antes.
8. **Rascunho local (U-128) é dado de operação em `localStorage`** de dispositivo possivelmente compartilhado: escopar por usuário (ver U-177) e nunca guardar dado sensível.
9. **U-141/U-188 (multi-aba e presença)** dependem de Realtime; sem cuidado criam loop de invalidação de query.
10. **Riscos de medição:** U-164 a U-168 mudam o volume de eventos enviados; conferir custo e PII com o dono antes de ligar em produção.

## Ordem sugerida de execução (10 lotes de 20 etapas)

| Lote   | Etapas        | Tema e por quê primeiro                                                                                                                              |
| ------ | ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| **1**  | U-001 a U-020 | O Voltar: hook único, ícone, cor, fallback, gesto, `replace` nos pontos de saída, URL nas etapas. É o pedido central e a maior parte é diff pequeno. |
| **2**  | U-021 a U-040 | Breadcrumbs, histórico, 404, redirect pós-login, scroll restoration, rotas órfãs. Fecha o "para onde eu volto" e o "como eu cheguei aqui".           |
| **3**  | U-041 a U-060 | Atalhos sem conflito, haptics, prefetch, `AnimatePresence` no `Outlet`, barra de carregamento única. Consolida o feedback da transição.              |
| **4**  | U-061 a U-080 | Hierarquia visual, `PageHeader` único, toasters, z-index, paridade tablet, `dvh`, bottom nav por papel. Consistência visível em toda tela.           |
| **5**  | U-081 a U-100 | Gestos mobile, menu mobile como diálogo, foco na troca de rota, contraste, rótulos, links no menu. Acessibilidade estrutural.                        |
| **6**  | U-101 a U-120 | Foco não obscurecido, semântica de stepper e breadcrumb, zoom, fonte ajustável, alto contraste, i18n da navegação. Inclusão.                         |
| **7**  | U-121 a U-140 | Guardas de saída (inclui a migração para data router), rascunho, retomada, progresso persistente, validação de scan. Onde o dado se perde hoje.      |
| **8**  | U-141 a U-160 | Fluxos paralelos, fila de trabalho, testes unitários e E2E de navegação (desktop e mobile), a11y-smoke ampliado. Trava o que foi corrigido.          |
| **9**  | U-161 a U-180 | Guards de CI, telemetria ligada, KPIs de Voltar/tempo/abandono, busca → destino, modais na URL. Passa a medir e a integrar busca e modais.           |
| **10** | U-181 a U-200 | Multi-aba, offline, PWA, limpeza dos duplicados, `routeMeta`, rotas aninhadas, painel de saúde, feedback qualitativo. Fundação e ciclo contínuo.     |

Etapas marcadas **⚠️ regra 8**: U-038, U-122, U-149, U-169, U-170, U-177, U-195, U-199, U-200 — PR aberta, decisão do dono.
