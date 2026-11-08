# Mapa do repositório — referência para agentes

Ler quando precisar saber onde fica algo antes de buscar por texto. Números conferidos por `find`/`ls`.

## Onde olhar primeiro

| Precisa de                                        | Leia                                                                                              |
| ------------------------------------------------- | ------------------------------------------------------------------------------------------------- |
| O que está pronto e o que está quebrado           | `ESTADO_ATUAL.md`                                                                                 |
| Stack, comandos, env vars                         | `README.md` / `README_PT.md` + `.env.example`                                                     |
| Qual banco, migration, RLS                        | `AGENTS.md` + `docs/agentes/banco.md`                                                             |
| CI, workflows, perímetro do GitHub                | `docs/agentes/github-ci.md`                                                                       |
| Deploy e hospedagem                               | `docs/agentes/deploy.md`                                                                          |
| Edge functions e integrações externas             | `docs/agentes/edge-functions.md`                                                                  |
| Regra de negócio WMS que o código não deixa óbvio | `docs/agentes/regras-dominio.md`                                                                  |
| Arquitetura e decisões                            | `docs/ARCHITECTURE.md`, `docs/adr/`                                                               |
| Histórico, auditorias, planos                     | `docs/history/`, `docs/estado/`, `.lovable/`, `CHANGELOG.md` — contexto, **não** fonte de verdade |

## Mapa rápido

| Onde                                                                      | O que tem                                                                                                                                                                                                                                                                                                                                                                                      |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `src/components/`                                                         | 520 arquivos: 11 na raiz + 63 subpastas (`ui/`, `layout/`, `common/`, `forms/`, `charts/`, `wms/`, `produtos/`, `admin/`, `molecules/`, `organisms/`, `templates/`, `a11y/`, `pwa/`, `mobile/`…)                                                                                                                                                                                               |
| `src/pages/`                                                              | 108 arquivos: 53 `.tsx` na raiz (nomes PT-BR, legado) + 25 subpastas por domínio (nomes EN)                                                                                                                                                                                                                                                                                                    |
| `src/features/`                                                           | 7 módulos verticais, cada um com `pages/` + `hooks/` (± `components/`, `services/`, `types/`, `utils/`): `inventory` (30), `quality` (25), `analytics` (16), `dashboard` (11), `receiving` (11), `shipping` (7), `picking` (5)                                                                                                                                                                 |
| `src/hooks/`                                                              | 288 arquivos, praticamente flat: 279 em `useXxx`, 5 em kebab-case legado (`use-mobile.ts`, `use-toast.ts`…), barrel `index.ts` e 3 em `useInventarioCiclico/`                                                                                                                                                                                                                                  |
| `src/services/`                                                           | 24 `*Service.ts` + `index.ts` + 4 testes em `__tests__/` (nomes mistos EN/PT)                                                                                                                                                                                                                                                                                                                  |
| `src/lib/`                                                                | 106 arquivos: 67 módulos na raiz (infra, observabilidade, segurança, import/export, formatação) + `schemas/` (32 Zod), `transitions/` (5), `crud/` (1), `validations/` (1)                                                                                                                                                                                                                     |
| `src/routes/`                                                             | 5 arquivos de rotas: `publicRoutes` (7), `wmsRoutes` (26), `featureRoutes` (26), `adminRoutes` (13), `analyticsRoutes` (9)                                                                                                                                                                                                                                                                     |
| `src/integrations/`                                                       | `supabase/client.ts`, `supabase/types.ts` (gerado, ≈143 KB), `lovable/index.ts`                                                                                                                                                                                                                                                                                                                |
| `src/config/`, `src/contexts/`, `src/guards/`, `src/hoc/`, `src/plugins/` | `environment.ts`/`feature-flags.tsx`/`menu.ts`; 6 contexts + `index`; `AuthGuard`/`PermissionGuard`/`RoleGuard`; 4 HOCs; SDK de plugin (`registry.ts`, `sdk.ts`)                                                                                                                                                                                                                               |
| `src/i18n/`                                                               | `index.ts` + `locales/`: `pt-BR.json`, `en.json`, `es.json` registrados; `en-US.json` existe e **não é importado**                                                                                                                                                                                                                                                                             |
| `supabase/functions/`                                                     | **248 funções** com `index.ts` + `_shared/` (20 arquivos) + `tests/`. Detalhe em `docs/agentes/edge-functions.md`                                                                                                                                                                                                                                                                              |
| `supabase/migrations/`                                                    | 163 `.sql`, sem subpastas. Detalhe em `docs/agentes/banco.md`                                                                                                                                                                                                                                                                                                                                  |
| `scripts/`                                                                | flat, 38 arquivos: 8 guardas `.mjs` (`rls-audit`, `audit-zod`, `i18n-check`, `i18n-hardcoded-check`, `migrations-todo-check`, `dep-audit`, `qa-report`, `check-agents-integrity`) + 17 `seed-*.cjs` + 6 `probe-*.cjs` + 4 `.sql` soltos + `apply_rls_helper.cjs`, `check-eventos-triagem.cjs`, `test-db-connection.ts`. **Os `seed-*`/`probe-*` miram produção** — ver `docs/agentes/banco.md` |
| `tests/e2e/`                                                              | 9 specs Playwright (`a11y-smoke`, `auth-flow`, `auth-navigation`, `basic-flow`, `export-reports`, `global-search`, `routes-smoke`, `stress`, `wms-flow`) + `fixtures/`                                                                                                                                                                                                                         |
| `.github/workflows/`                                                      | 3 workflows: `ci.yml`, `cd.yml`, `qa.yml`                                                                                                                                                                                                                                                                                                                                                      |

## Roteamento

Entrada: `src/App.tsx` — `BrowserRouter` + `Routes`, flags `v7_startTransition` e `v7_relativeSplatPath`;
páginas em `lazy()` + `Suspense` (`RouteLoadingFallback`) dentro de `RouteErrorBoundary`; layout
autenticado em `<Route path="/" element={<AppLayout />}>`. **85 `path=` registrados** (4 em `App.tsx` +
81 nos 5 arquivos de `src/routes/`).

Convivem dois esquemas de página: legado flat em `src/pages/*.tsx` (PT-BR) e por domínio em
`src/pages/<dominio>/` (EN), mais `src/features/*/pages/`. Ao criar página nova, siga o esquema do módulo
em que ela entra — não misture.

## Testes

| Tipo                  | Onde                                                               | Quanto                                                                                            | Config                                                                                                                                                                        |
| --------------------- | ------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Unitário/componente   | `src/**/__tests__/*.test.{ts,tsx}` e `*.test.ts` ao lado do módulo | 14 arquivos `*.test.ts(x)`: 12 em 8 pastas `__tests__/` + 2 ao lado do módulo                     | `vitest.config.ts` (`jsdom`, setup `src/test/setup.tsx`)                                                                                                                      |
| E2E                   | `tests/e2e/`                                                       | 9 specs                                                                                           | `playwright.config.ts` (`baseURL` = `VITE_APP_URL` ou `http://localhost:5173`; 5 projects: chromium, firefox, webkit, `Mobile Chrome` (Pixel 5), `Mobile Safari` (iPhone 12)) |
| Edge functions (Deno) | `supabase/functions/**/*_test.ts` e `supabase/functions/tests/`    | 7 em `_shared/` + 3 em `tests/` + 2 `contract_test.ts` (`carrier-track`, `db-alert-monitor`) = 12 | fora do Vitest (`exclude: supabase/**`)                                                                                                                                       |

Cobertura (`vitest.config.ts`): `include` só `src/services/**`, `src/features/**/services/**`, `src/lib/**`;
thresholds atuais `lines 12 / branches 55 / functions 25 / statements 12`. Saída em `.qa-report/coverage/`.
O config injeta env dummy (`VITE_SUPABASE_URL=http://localhost:54321`) — teste unitário **não** fala com
banco real.

## Automação

Tudo em `scripts/`, flat, sem README por script. Guardas são `.mjs`; utilitários operacionais são `.cjs`
e **falam com produção** (ver `docs/agentes/banco.md`). Ao criar automação nova: `.mjs`, sem credencial
hardcoded, e sem tocar `supabase/` (que é do CLI do Supabase) nem `src/` (que entra no bundle).
