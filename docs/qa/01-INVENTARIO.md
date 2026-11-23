# 01 — Inventário do sistema e registro de cobertura

> Auditoria **somente leitura** executada em **22–23/11/2026** sobre a branch
> `claude_04/laughing-einstein-eh8yrn` (base: `main` em `524a79b`).
> Método: medição direta do código no commit atual, requisições HTTP somente-leitura contra os dois
> deploys de produção e contra a API REST do Supabase oficial. Documentação do repositório foi tratada
> como **hipótese a confirmar**, nunca como fonte.
>
> Convenção de verificação usada em todos os arquivos desta pasta:
> **EXECUTADO** = comando, consulta ou request rodado nesta sessão, com saída observada ·
> **RASTREADO** = caminho seguido lendo o código, sem execução.

---

## 1. Stack e pontos de entrada

| Item                 | Valor                                                                                                  | Evidência                               | Verificação                            |
| -------------------- | ------------------------------------------------------------------------------------------------------ | --------------------------------------- | -------------------------------------- |
| Build/dev            | Vite 5                                                                                                 | `vite.config.ts`, `package.json:8`      | EXECUTADO (`npm run build` disponível) |
| Framework            | React 18 + TypeScript strict                                                                           | `tsconfig.app.json`, `package.json`     | RASTREADO                              |
| UI                   | Tailwind + shadcn/ui (82 componentes em `src/components/ui`)                                           | `tailwind.config.ts`, `components.json` | EXECUTADO (contagem)                   |
| Dados/estado         | TanStack Query + Context API; `src/stores/` só tem um `createStore` genérico, sem nenhuma store criada | `src/stores/index.ts:1-25`              | EXECUTADO (`ls src/stores/`)           |
| Validação            | Zod (+ `@hookform/resolvers`)                                                                          | `package.json`                          | RASTREADO                              |
| i18n                 | i18next, 4 arquivos de locale (`pt-BR`, `en`, `en-US`, `es`) — `en.json` e `en-US.json` coexistem      | `src/i18n/locales/`                     | EXECUTADO (`find`)                     |
| Backend              | Supabase (Postgres + Edge Functions Deno)                                                              | `supabase/config.toml:1`                | EXECUTADO                              |
| Mobile               | Capacitor (PoC)                                                                                        | `capacitor.config.ts`                   | RASTREADO                              |
| Ponto de entrada web | `index.html` → `src/main.tsx` → `src/App.tsx`                                                          | `src/App.tsx:20-60`                     | RASTREADO                              |
| Porta de dev         | **8080** (não 5173)                                                                                    | `vite.config.ts:40`                     | RASTREADO                              |
| Node                 | 22 no CI (`cd.yml`), 20+ exigido no `AGENTS.md`; container desta auditoria: v22.23.5                   | `.github/workflows/cd.yml:36`           | EXECUTADO (`node -v`)                  |

### Instalação de dependências (estado real medido)

| Comando                                | Resultado medido                                                                                                                                     | Verificação |
| -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- |
| `npm install --no-audit --no-fund`     | **FALHA** — exit 1 no postinstall do `cypress@16.3.0` (`npm error path .../node_modules/cypress`, `command sh -c node dist/index.js --exec install`) | EXECUTADO   |
| `CYPRESS_INSTALL_BINARY=0 npm install` | **SUCESSO** — "added 1365 packages in 13s", exit 0                                                                                                   | EXECUTADO   |
| `npm ci --dry-run`                     | **SUCESSO** — exit 0, "added 77 packages in 1s"                                                                                                      | EXECUTADO   |

> Isso **contradiz** `AGENTS.md § Qualidade e guardas`, que afirma que `npm ci --dry-run` "aborta
> localmente em `#loadPeerSet` (peer do `vitest@5.0.3`)". O bloqueio real é o download do binário do
> Cypress, não resolução de peer. Vira achado (ver `03-ACHADOS.md`).

---

## 2. Ambientes e deploys (medido por HTTP)

| Alvo                             | HTTP | Projeto Supabase que o bundle usa                                                                                     | Evidência                                                                                                      | Verificação |
| -------------------------------- | ---- | --------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------- | ----------- |
| `https://estoki.lovable.app`     | 200  | **`mtnsslmweggrmmdcklya`** (chave `anon` legada, JWT `role=anon`)                                                     | bundle `/assets/index-U-NBmTWY.js`                                                                             | EXECUTADO   |
| `https://estoki-v2.vercel.app`   | 200  | **`ookjbflsnoefnsixrspc`** (chave `sb_publishable_…`)                                                                 | bundle `/assets/index-BhAhgqRb.js`                                                                             | EXECUTADO   |
| `https://estoki-main.vercel.app` | 200  | **`ookjbflsnoefnsixrspc`** — mesmo bundle (`index-BhAhgqRb.js`), é um **segundo projeto Vercel** do mesmo repositório | bot da Vercel na PR #190: projetos `estoki-v2` e `estoki-main`, time `juca1`, ambos disparados pelo mesmo push | EXECUTADO   |
| Repositório / migrations / crons | —    | `ookjbflsnoefnsixrspc`                                                                                                | `supabase/config.toml:1`                                                                                       | EXECUTADO   |

**Três endereços de produção no ar.** Dois (Vercel) servem o mesmo build contra o banco oficial — e constroem
em duplicidade a cada push; o terceiro (Lovable) fala com um banco que não tem o sistema. É o achado
estrutural nº 1.

| Ambiente declarado                    | Onde                                                    | Verificação  |
| ------------------------------------- | ------------------------------------------------------- | ------------ |
| `staging` (Vercel preview)            | `.github/workflows/cd.yml:50-57`                        | RASTREADO    |
| `production`                          | `cd.yml` (`workflow_dispatch`)                          | RASTREADO    |
| 4 environments no GitHub, sem revisor | `AGENTS.md § Fluxo Git` (não reconfirmado nesta sessão) | NÃO REVISADO |

---

## 3. Rotas (82 declaradas) — cobertura

| Arquivo                                       | Rotas (`path="…"`) | Ocorrências de `ProtectedRoute` | Status   |
| --------------------------------------------- | ------------------ | ------------------------------- | -------- |
| `src/routes/publicRoutes.tsx`                 | 7                  | 0 (correto: são públicas)       | revisado |
| `src/routes/wmsRoutes.tsx`                    | 26                 | 9                               | revisado |
| `src/routes/featureRoutes.tsx`                | 27                 | 11                              | revisado |
| `src/routes/adminRoutes.tsx`                  | 13                 | 27                              | revisado |
| `src/routes/analyticsRoutes.tsx`              | 9                  | 19                              | revisado |
| `src/App.tsx` (index, `dashboard`, `monitor`) | 3                  | 0                               | revisado |

Autenticação: o grupo `<Route path="/" element={<AppLayout />}>` (`src/App.tsx:27`) é a porta —
`AppLayout` redireciona para `/auth` quando não há usuário (`src/components/layout/AppLayout.tsx:53-54`).
Autorização por papel é **opcional e por rota**, via `ProtectedRoute allowedRoles={[…]}`
(`src/components/auth/ProtectedRoute.tsx:12-45`).

Papéis reais do sistema: **3** — `operador | supervisor | admin`
(enum `app_role`, `src/integrations/supabase/types.ts:4418`). Usos de `allowedRoles` no código:
20× `["admin","supervisor"]`, 13× `["admin"]`, 1× `["admin","supervisor","operador"]` (EXECUTADO, grep).

---

## 4. Frontend — inventário quantitativo

| Item                      | Quantidade                                                                                                 | Comando                        | Status                                               |
| ------------------------- | ---------------------------------------------------------------------------------------------------------- | ------------------------------ | ---------------------------------------------------- |
| Páginas em `src/pages`    | 76 `.tsx`                                                                                                  | `find src/pages -name '*.tsx'` | revisado por amostragem dirigida (fluxos principais) |
| Módulos em `src/features` | 8 (`analytics, dashboard, inventory, multiWarehouse, picking, quality, receiving, shipping`), 107 arquivos | `ls src/features`              | revisado                                             |
| Componentes               | 478 `.tsx` em `src/components` (ui 82, forms 46, common 30, layout 28, charts 22, data 19, wms 18, …)      | `find`                         | revisado por amostragem                              |
| Arquivos de hook (`use*`) | 303                                                                                                        | `find src -name 'use*.ts*'`    | revisado por amostragem dirigida                     |
| Services                  | 25 em `src/services` + services por feature                                                                | `ls src/services`              | revisado                                             |
| Contexts                  | 5 (`App, Auth, Notification, Theme, Toast, Transition`)                                                    | `ls src/contexts`              | revisado                                             |
| Stores                    | 0 (só o helper `createStore`)                                                                              | `ls src/stores`                | revisado                                             |

---

## 5. Backend — Edge Functions

| Medida                                                                              | Valor                                                                                                                                                                                                                                    | Verificação                            |
| ----------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------- |
| Funções em `supabase/functions` (cada uma com `index.ts`, fora `_shared` e `tests`) | **247**                                                                                                                                                                                                                                  | EXECUTADO                              |
| **Deployadas em produção** (responderam ≠404 em `OPTIONS /functions/v1/<nome>`)     | **94**                                                                                                                                                                                                                                   | EXECUTADO (probe em todas)             |
| **Não deployadas** (404)                                                            | **153**                                                                                                                                                                                                                                  | EXECUTADO                              |
| Declaram `verify_jwt = false`                                                       | 2 — `reorder-check`, `stock-alert`                                                                                                                                                                                                       | EXECUTADO (`supabase/config.toml:3-7`) |
| Usam `SUPABASE_SERVICE_ROLE_KEY`                                                    | **203** ocorrências                                                                                                                                                                                                                      | EXECUTADO (grep)                       |
| Leem `SUPABASE_ANON_KEY`                                                            | 24                                                                                                                                                                                                                                       | EXECUTADO                              |
| `functions.invoke("<literal>")` no frontend                                         | 7 nomes distintos (`gerar-desafios-diarios`, `scanner-ocr`, `send-email-alert`, `webauthn-*`) + 3 chamadas com nome dinâmico (`src/lib/ai-invoke.ts:31`, `src/pages/admin/IntegrationsPage.tsx:116`, `src/hooks/useDivergencias.ts:173`) | EXECUTADO                              |
| Função `metrics` (usada pelo painel de saúde)                                       | **404 — não deployada**                                                                                                                                                                                                                  | EXECUTADO                              |

Segredos lidos pelas functions (nomes, nunca valores): `SUPABASE_URL` (222), `SUPABASE_SERVICE_ROLE_KEY`
(203), `SUPABASE_ANON_KEY` (24), `OPENAI_API_KEY` (5), `SUPABASE_PUBLISHABLE_KEY` (4),
`STRIPE_SECRET_KEY` (3), `LOVABLE_API_KEY` (3), `WEBHOOK_SECRET` (2), `METRICS_TOKEN` (2),
`CORREIOS_USER`/`CORREIOS_TOKEN` (2 cada), `RESEND_API_KEY`, `PIX_KEY`, `SUPABASE_AUTH_JWT_SECRET`,
`ERP_SIMULATION`, `CORREIOS_CONTRATO`, `CORREIOS_CARTAO`, `MERCHANT_NAME`, e — anomalia —
`VITE_SUPABASE_URL`/`VITE_SUPABASE_PUBLISHABLE_KEY` dentro de function (1 cada). EXECUTADO (grep).

### Medições adicionais sobre as Edge Functions (todas EXECUTADO)

| Medida                                                                                                                                       | Valor                                                                                                                                                                                                                                                                                                                                                                                                                                                                                              |
| -------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Funções que são **stub** (criam client, validam com Zod e devolvem `{success:true, function:"<nome>"}` sem nenhum `.from`/`.rpc`/`.storage`) | **107 de 247**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                     |
| Dessas, **deployadas em produção**                                                                                                           | **26** (`abc-analysis`, `alert-monitor`, `alert-productivity`, `alert-quality`, `alert-sla-breach`, `auth-session-list`, `auth-session-revoke`, `auth-social-login`, `batch-processor`, `cache-invalidate`, `carrier-book`, `carrier-cancel`, `carrier-rates-cache`, `carrier-webhooks`, `cte-import`, `cycle-count`, `dashboard-stats`, `data-migration`, `download-file`, `expiration-check`, `export-pdf`, `export-products`, `generate-barcode`, `generate-sku`, `import-csv`, `safety-stock`) |
| Funções deployadas que usam `service_role`                                                                                                   | 59 de 94                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Dessas, que **nunca validam o chamador** (sem `auth.getUser`)                                                                                | **55**                                                                                                                                                                                                                                                                                                                                                                                                                                                                                             |
| Funções deployadas que validam o usuário                                                                                                     | 14 de 94                                                                                                                                                                                                                                                                                                                                                                                                                                                                                           |
| Funções com chamador real no app                                                                                                             | **16 de 247 (6,5%)**                                                                                                                                                                                                                                                                                                                                                                                                                                                                               |
| Conformidade com a regra do próprio repo (`AGENTS.md`: "Sempre CORS + Zod (400) + try/catch + `withLogging()`")                              | CORS 242/247 · Zod 210/247 · try/catch 240/247 · **`withLogging()` 2/247**                                                                                                                                                                                                                                                                                                                                                                                                                         |

**Como o portão de autenticação do Supabase realmente se comporta aqui (EXECUTADO):**
`POST /functions/v1/health-check` sem cabeçalho → **401**; o mesmo POST com
`Authorization: Bearer <chave publicável do bundle>` → **200 com o corpo completo**. Ou seja,
`verify_jwt = true` só exige _um_ JWT do projeto, e a chave publicável (pública por design, está no
JavaScript do site) satisfaz essa exigência. Sem checagem de papel dentro da função, as 55 acima ficam
abertas a qualquer pessoa.

### Navegação × rotas declaradas (EXECUTADO)

86 rotas declaradas (5 arquivos de `src/routes` + `src/App.tsx`) contra 26 destinos distintos de
`navigate(...)`/`to=` em `src/`: **5 destinos não têm rota** — `/triagem/:id`, `/recebimento/:id`,
`/recebimento/conferencia/:id`, `/inventario/:id`, `/shipping/orders/:id`. As páginas existem, mas estão
registradas em `conferencia` e `formulario-triagem`, **sem o segmento `:id`** que elas leem via
`useParams()` (`src/features/quality/pages/FormularioTriagem.tsx:43`,
`src/features/receiving/pages/ConferenciaRecebimento.tsx:36`).

### Storage (EXECUTADO)

| Bucket                       | Estado                                                                                                   | Evidência                                                                                                                                                                                    |
| ---------------------------- | -------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `triagem-fotos`              | criado `public = true` e depois alterado para `public = false`; o front continua usando `getPublicUrl()` | `supabase/migrations/20251220143942_*.sql:2-3`, `supabase/migrations/20260404160737_*.sql:2`, `src/hooks/useTriagemFotos.ts:64`; `GET /storage/v1/object/public/triagem-fotos/...` → **400** |
| `backups`, `images`, `files` | referenciados em código, **sem** migration de criação encontrada                                         | grep em `supabase/migrations/`                                                                                                                                                               |

### Objetos de banco verificados por chamada real (EXECUTADO)

| Objeto                                                                         | Resultado                                                                                       |
| ------------------------------------------------------------------------------ | ----------------------------------------------------------------------------------------------- |
| `get_reorder_point`, `get_min_stock_threshold`                                 | existem **e são executáveis pela chave publicável** (retornaram `10` e `5`)                     |
| `get_backend_health`, `check_db_alert_thresholds`                              | existem e a guarda funciona (`P0001 Acesso restrito a administradores`)                         |
| `decrease_location_stock`, `get_inventory_summary`, `recalculate_weekly_stats` | chamadas por Edge Functions e **criadas em 0 das 178 migrations**                               |
| Projeto do deploy Lovable (`mtnsslmweggrmmdcklya`)                             | das 86 tabelas do sistema só existem **`profiles` e `user_roles`**; as outras 83 dão `PGRST205` |

---

## 6. Banco de dados

| Medida                                     | Valor                                                                                                                                                                                                                                                                                                   | Verificação                                               |
| ------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | --------------------------------------------------------- |
| Migrations versionadas                     | **178** arquivos em `supabase/migrations/`                                                                                                                                                                                                                                                              | EXECUTADO                                                 |
| Tabelas nos tipos gerados                  | **86**                                                                                                                                                                                                                                                                                                  | EXECUTADO (parse de `src/integrations/supabase/types.ts`) |
| Views nos tipos gerados                    | 3                                                                                                                                                                                                                                                                                                       | EXECUTADO                                                 |
| Funções (RPC) nos tipos                    | 22                                                                                                                                                                                                                                                                                                      | EXECUTADO                                                 |
| Enums                                      | 11 (`app_role`, `order_status`, `status_recebimento`, `status_tarefa`, `status_onda`, `status_romaneio`, `status_entrega`, `status_posicao`, `status_contagem`, `status_ciclo_inventario`, `status_registro_td`, `motivo_td`, `prioridade_tarefa`, `severidade_alerta`, `status_alerta`, `tipo_alerta`) | EXECUTADO                                                 |
| `CREATE TRIGGER` distintos nas migrations  | 67                                                                                                                                                                                                                                                                                                      | EXECUTADO                                                 |
| Migrations com `cron.schedule`             | 4 arquivos (EST01 reorder-check, EST01 stock-alert, AUTO01 alert-expiration, + 1)                                                                                                                                                                                                                       | EXECUTADO                                                 |
| Migrations usando `pg_net`/`net.http_post` | 4                                                                                                                                                                                                                                                                                                       | EXECUTADO                                                 |
| **Exposição anônima de dados**             | **0 de 86 tabelas + 3 views retornaram linha** para a chave publicável sem login (todas `200 []`)                                                                                                                                                                                                       | EXECUTADO (probe REST nas 89)                             |
| Buckets de storage referenciados no código | 4 — `triagem-fotos`, `backups`, `images`, `files`                                                                                                                                                                                                                                                       | EXECUTADO (grep)                                          |

### Camada NÃO COBERTA — internals do Postgres

O gateway MCP do banco (`.mcp.json` → `supabase-estoki`) **responde erro**:

```
{"content":[{"type":"text","text":"ERRO: Management API 401: Invalid access token"}],"isError":true}
```

Consequência: **não foi possível consultar `pg_policies`, `pg_indexes`, `pg_stat_user_tables`,
constraints reais, registros órfãos nem planos de execução**. A auditoria de banco desta sessão é
**estática** (migrations + tipos gerados) somada ao teste de exposição anônima via REST.
O token de serviço do projeto (`api.supabase.com`) disponível neste container pertence a outra
organização (só enxerga o projeto `Fuxico_V2`), e a senha de produção em
`scripts/apply_rls_helper.cjs:18` é de uso proibido por `AGENTS.md`. Marcado como camada parcialmente
coberta — ver "O que não foi coberto" em `00-RESUMO.md`.

---

## 7. Integrações externas e segredos

| Integração                  | Onde                                                                    | Status               |
| --------------------------- | ----------------------------------------------------------------------- | -------------------- |
| Correios (cotação/rastreio) | functions + `VITE_CORREIOS_API_KEY`                                     | revisado             |
| Mercado Livre               | `supabase/functions/integration-mercado-livre/`                         | revisado             |
| NF-e                        | `VITE_NFE_CERTIFICATE_PATH`, functions de recebimento                   | revisado             |
| Resend (e-mail)             | `RESEND_API_KEY` em function                                            | revisado             |
| Stripe                      | `STRIPE_SECRET_KEY` em 3 functions                                      | revisado             |
| OpenAI / Lovable AI         | `OPENAI_API_KEY` (5), `LOVABLE_API_KEY` (3)                             | revisado             |
| Bitrix                      | `VITE_BITRIX`                                                           | revisado             |
| ERPs SAP/TOTVS              | `ERP_SIMULATION`, docs de pendência                                     | revisado (simulação) |
| Sentry                      | `src/lib/sentry.ts` + `VITE_SENTRY_DSN`                                 | revisado             |
| Google Analytics            | `VITE_GA_ID`, `VITE_GA_TRACKING_ID` (duas variáveis para a mesma coisa) | revisado             |

**Segredo em repositório (local e tipo, sem valor):** senha do banco de produção embutida em
`scripts/apply_rls_helper.cjs:18` (string de conexão `postgresql://postgres:…@…supabase.co:5432/postgres`).
Já declarada em `AGENTS.md`; permanece no código e no histórico do Git. EXECUTADO (leitura do arquivo,
valor não transcrito).

---

## 8. CI/CD e qualidade (medido)

| Workflow                                                                                                                                                            | Papel                                                                                                                                                                           | Status   |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `qa.yml`                                                                                                                                                            | quality gate de PR — 9 verificações obrigatórias (`qa.yml:177-190`): integridade do AGENTS, lint, typecheck, testes, build, rls-audit, i18n hardcoded, dep-audit, **e2e smoke** | revisado |
| `ci.yml`                                                                                                                                                            | pipeline de push                                                                                                                                                                | revisado |
| `cd.yml`                                                                                                                                                            | deploy Vercel (staging/production)                                                                                                                                              | revisado |
| `dependency-review.yml`, `db-manifesto.yml`, `branch-hygiene-audit.yml`, `contexto.yml`, `inventario-estado.yml`, `automation-local.yml`, `notifica-falha-main.yml` | auxiliares                                                                                                                                                                      | revisado |

| Comando rodado nesta sessão | Resultado                                                                                                                                                          | Verificação |
| --------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------- |
| `npm run typecheck`         | **exit 0**, nenhum erro                                                                                                                                            | EXECUTADO   |
| `npx eslint .`              | **exit 0** — 990 problemas, **0 erros, 990 warnings**                                                                                                              | EXECUTADO   |
| distribuição dos warnings   | 539 `@typescript-eslint/no-unused-vars`, 380 `@typescript-eslint/no-explicit-any`, 42 `react-refresh/only-export-components`, **29 `react-hooks/exhaustive-deps`** | EXECUTADO   |

> `AGENTS.md` diz que os gates da `main` são 6 (ou 7). O arquivo atual exige **9**. Divergência
> registrada como achado de documentação.

---

## 9. Atores e jornadas principais

Atores: **visitante** (sem login), **operador**, **supervisor**, **admin** (enum `app_role`) — e o
**robô** (crons `pg_cron` + chamadas sem JWT às duas functions abertas).

Jornadas inventariadas (fonte: `docs/agentes/regras-dominio.md` confrontado com código):

1. **Recebimento** — NF-e/XML → conferência cega → divergência (`status_recebimento`: `aguardando → em_transito → recebido → em_conferencia → conferido`, desvios `divergencia`, `cancelado`, `quarentena`).
2. **Triagem/qualidade** — cronometrada, foto obrigatória (bucket `triagem-fotos`), amostragem ISO 2859-1.
3. **Armazenagem/putaway** — sugestão de endereçamento, `status_posicao`: `livre|ocupado|reservado|bloqueado`.
4. **Picking** — ondas (`status_onda`), rota TSP (`nearestNeighbor` + `twoOpt`), consumo FIFO/FEFO/LIFO.
5. **Expedição** — romaneio (`status_romaneio`), entrega (`status_entrega`), Correios.
6. **Inventário cíclico** — ciclo (`status_ciclo_inventario`) + contagem (`status_contagem`).
7. **Trocas/devoluções** — 5 etapas, `status_registro_td` + `motivo_td`.
8. **Alertas e reposição** — `tipo_alerta` × `severidade_alerta` × `status_alerta`, crons `reorder-check` e `stock-alert`.
9. **Administração** — usuários, papéis, auditoria, integrações, saúde do backend.

A matriz de cenários por jornada (ator × estado do dado × entrada × condição) está em `02-CENARIOS.md`.

---

## 10. Registro de cobertura — o que ficou de fora

| Camada                                                    | Cobertura                            | Motivo                                                                              |
| --------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------- |
| Rotas e guards                                            | **revisado**                         | leitura integral dos 5 arquivos de rota                                             |
| Páginas e componentes                                     | **revisado por amostragem dirigida** | 76 páginas + 478 componentes; foco nos 9 fluxos acima                               |
| Hooks e estado                                            | **revisado por amostragem dirigida** | 303 arquivos; varredura por padrão de defeito (deps, cleanup, invalidate)           |
| Services e contratos                                      | **revisado**                         | 25 + services de feature                                                            |
| Edge Functions                                            | **revisado**                         | inventário integral + leitura dirigida; probe de deploy nos 248                     |
| Migrations / RLS estático                                 | **revisado**                         | 178 arquivos                                                                        |
| **Banco em produção (policies, índices, órfãos, planos)** | **NÃO COBERTO**                      | MCP do banco retorna `401 Invalid access token`; sem outra credencial permitida     |
| Exposição anônima de dados                                | **revisado (EXECUTADO)**             | probe REST em 89 objetos                                                            |
| Integrações externas                                      | **revisado estaticamente**           | nenhuma chamada real a terceiro foi disparada (regra de somente leitura)            |
| CI/CD e infra                                             | **revisado**                         | 10 workflows + Dockerfile + vercel.json + scripts de gate                           |
| Testes                                                    | **revisado**                         | ver `03-ACHADOS.md`, camada de testes                                               |
| **Acessibilidade e responsividade reais em navegador**    | **NÃO COBERTO**                      | nenhuma sessão de navegador autenticada foi aberta (exigiria credencial de usuário) |
| **Fluxos autenticados end-to-end em produção**            | **NÃO COBERTO**                      | exigiria login real; cenários marcados RASTREADO                                    |

---

## 11. Registro de cobertura por auditor (anexo)

> Cada auditor de camada devolveu o que inspecionou e o que deixou de fora. Reproduzido aqui sem edição,
> porque é o que sustenta a afirmação de exaustividade — e o que mostra onde ela não vale.

### Camada: paginas-ui

**Cobertura declarada:** Auditoria somente-leitura das 72 páginas de src/pages (76 arquivos contando os 4 de **tests**). Li integralmente as 10 páginas dos fluxos principais (produtos, ajustes de estoque, movimentação, inventário cíclico, armazenamento/putaway, qualidade, pedidos, kanban) e os trechos decisivos de outras 12; nas 30 restantes apliquei varredura dirigida. Segui o caminho ponta a ponta: página → hook/service → migration (tipo de coluna) → rota de destino. Verificações executadas: `npx eslint src/pages` (171 avisos, 0 erros: 129 no-unused-vars, 34 no-explicit-any, 8 exhaustive-deps), `npx tsc --noEmit` (sai 0, sem erros), `npx vitest run src/pages` (4 arquivos, 7 testes, todos passam — só 4 páginas das 72 têm teste), inventário completo das rotas declaradas em src/App.tsx + src/routes/*.tsx confrontado com cada `navigate()` das páginas, varredura programática de todas as tags <Button> descartando os casos envoltos por Dialog/Dropdown/Popover Trigger, e contagem de adoção de i18n e de paginação. FORA DO ESCOPO: as telas de recebimento, triagem, picking, expedição e estoque, que o enunciado pede priorizar, NÃO ficam em src/pages — estão em src/features/{receiving,quality,picking,shipping,inventory}/pages e pertencem a outra camada desta auditoria; aqui elas só aparecem como destino de navegação (ex.: EstoquePage ignorando o parâmetro ?posicao do scanner). Também não inspecionei componentes de src/components nem hooks além do necessário para provar cada achado, e não abri ESTADO_ATUAL.md para não herdar conclusão de terceiros. Nenhum arquivo foi editado e nenhuma escrita em banco, storage ou serviço externo foi feita; a senha de produção em scripts/apply_rls_helper.cjs:18 não foi lida nem executada.

Itens inventariados:

- REVISADO EM PROFUNDIDADE (leitura integral): src/pages/Produtos.tsx, src/pages/AjustesEstoque.tsx, src/pages/Movimentacao.tsx, src/pages/InventarioCiclico.tsx, src/pages/Armazenamento.tsx, src/pages/KanbanPipeline.tsx, src/pages/putaway/PutawayPage.tsx, src/pages/quality/QualityPage.tsx, src/pages/inventory/InventoryPage.tsx, src/pages/orders/OrdersPage.tsx
- REVISADO EM PROFUNDIDADE (trechos-chave + varredura de handlers/estados): src/pages/Scanner.tsx, src/pages/Romaneios.tsx, src/pages/Ondas.tsx, src/pages/Posicoes.tsx, src/pages/GestaoTarefas.tsx, src/pages/inventory/StockMovementsPage.tsx, src/pages/Hub.tsx, src/pages/Rastreabilidade.tsx, src/pages/Relatorios.tsx, src/pages/Configuracoes.tsx, src/pages/Etiquetas.tsx, src/pages/profile/ProfilePage.tsx
- REVISADO SUPERFICIALMENTE (só varredura automatizada de botão sem handler, mock/hardcode, estado vazio/erro e i18n): src/pages/help/HelpPage.tsx, src/pages/admin/SettingsPage.tsx, src/pages/admin/UsersPage.tsx, src/pages/admin/AuditLogPage.tsx, src/pages/admin/RolesPage.tsx, src/pages/admin/AdminTelemetriaPage.tsx, src/pages/RelatoriosAgendados.tsx, src/pages/Lotes.tsx, src/pages/OcupacaoVisual.tsx
- NAO REVISADO — fora da fatia de fluxo principal priorizada e sem sinal nas varreduras: src/pages/ModoOffline.tsx, src/pages/AssistenteIA.tsx, src/pages/Automacoes.tsx, src/pages/AlertasInteligentes.tsx, src/pages/Dashboard.tsx, src/pages/DashboardTrocas.tsx, src/pages/TrocasDevolucoes.tsx, src/pages/Produtividade.tsx, src/pages/RelatorioDivergencias.tsx, src/pages/RelatorioFornecedores.tsx, src/pages/Gamificacao.tsx, src/pages/Seguranca.tsx, src/pages/Governanca.tsx, src/pages/ImportExport.tsx, src/pages/EndereçamentoAutomatico.tsx, src/pages/IntegracaoTransportadoras.tsx, src/pages/FornecedoresAvancado.tsx, src/pages/AprovacaoMovimentacoes.tsx
- NAO REVISADO — telas de autenticação e utilitárias: src/pages/Auth.tsx, src/pages/auth/Login.tsx, src/pages/auth/ForgotPassword.tsx, src/pages/auth/ResetPassword.tsx, src/pages/auth/VerifyEmail.tsx, src/pages/TwoFactorAuth.tsx, src/pages/Unauthorized.tsx, src/pages/NotFound.tsx, src/pages/DashboardOperacional.tsx (2 linhas, só reexporta OperationalMonitorPage)
- NAO REVISADO — cadastros secundários: src/pages/notifications/NotificationsPage.tsx, src/pages/categories/CategoriesPage.tsx, src/pages/customers/CustomersPage.tsx, src/pages/customers/CustomerDetailPage.tsx, src/pages/orders/OrderDetailPage.tsx, src/pages/serials/SerialsPage.tsx, src/pages/warehouses/WarehousesPage.tsx, src/pages/warehouses/WarehouseDetailPage.tsx, src/pages/admin/ApiPortalPage.tsx, src/pages/admin/AuditoriaCriticaPage.tsx, src/pages/admin/BackendHealthPage.tsx, src/pages/admin/CircuitBreakersPage.tsx, src/pages/admin/IntegrationsPage.tsx, src/pages/admin/SimulationPage.tsx
- FORA DESTA CAMADA (ficam em src/features, não em src/pages): RecebimentoPage, ConferenciaRecebimento, TriagemPage, DashboardTriador, FormularioTriagem, PickingPage, ShippingPage, EstoquePage, ABCAnalysisPage, KPIsPage, RealtimeDashboardPage, DemandForecastPage, MultiWarehouseDashboardPage, DashboardPage, OperationalMonitorPage — citadas apenas como destino/origem de navegação
- VERIFICACAO DE ROTA: nenhuma das 72 páginas está órfã — todas são referenciadas por src/App.tsx ou src/routes/*.tsx (verificado por varredura de cada caminho de import)

### Camada: rotas-guards

**Cobertura declarada:** Inspecionei toda a camada de roteamento e protecao: src/App.tsx, os 5 arquivos de src/routes/, src/guards/ (3 guards + index), src/hoc/withAuth.tsx, src/middleware/index.ts, src/components/auth/ProtectedRoute.tsx, src/components/layout/AppLayout.tsx, src/contexts/AuthContext.tsx, src/services/authService.ts, src/utils/role.ts, as duas fontes de navegacao (src/components/layout/sidebar/sidebarNavData.ts e src/config/menu.ts), src/constants/routes.ts, src/lib/prefetch.ts e tests/e2e/routes-smoke.spec.ts. Mapeei rota a rota (86 declaracoes: 7 publicas, 78 autenticadas, 1 catch-all), cruzei por script cada caminho com o guard aplicado, cada destino de menu com as rotas existentes e cada import() lazy com o arquivo em disco, e confirmei os papeis reais no enum app_role e nas policies de user_roles. Rodei typecheck (limpo) e os testes de role/authService (7 passando). Ficaram de fora: o interior das 85 paginas, as policies das tabelas por tras de cada rota sem papel (so li user_roles, profiles, audit_log e ajustes_estoque) e qualquer verificacao com usuario autenticado real no banco — o MCP do Supabase responde 401 nesta sessao, por isso o achado mais grave esta marcado como hipotese com o comando exato de confirmacao.

Itens inventariados:

- src/App.tsx — REVISADO: 86 declaracoes de rota ao todo; a raiz `/` monta AppLayout e tudo que esta aninhado herda so o portao de sessao (App.tsx:27)
- src/routes/publicRoutes.tsx — REVISADO: 7 rotas publicas (/auth, /auth/login, /auth/forgot-password, /auth/reset-password, /auth/verify-email, /2fa, /unauthorized), nenhuma com guard nem RouteErrorBoundary
- src/routes/wmsRoutes.tsx — REVISADO: 26 rotas, 4 com papel exigido (posicoes, inventario, curva-abc, ondas), 22 sem
- src/routes/analyticsRoutes.tsx — REVISADO: 9 rotas, todas com admin+supervisor
- src/routes/adminRoutes.tsx — REVISADO: 13 rotas, 12 com [admin] e 1 com [admin,supervisor] (governanca); 5 sem entrada na UI
- src/routes/featureRoutes.tsx — REVISADO: 26 rotas + catch-all `*`, 5 com papel exigido, 21 sem; o catch-all fica dentro do AppLayout
- src/components/auth/ProtectedRoute.tsx — REVISADO: unico guard vivo; usado pelos 4 arquivos de rota em 31 elements
- src/components/layout/AppLayout.tsx — REVISADO: portao de sessao de todas as rotas internas (linha 54); nao preserva o destino de origem
- src/contexts/AuthContext.tsx — REVISADO: fonte de user/role/loading/canAccess/hasRole; papel vem de user_roles via authService
- src/services/authService.ts + src/utils/role.ts — REVISADO: papel lido de public.user_roles (nao de profiles) e reduzido por highestRole; sem escalada de privilegio pelo perfil
- src/guards/AuthGuard.tsx, RoleGuard.tsx, PermissionGuard.tsx, index.ts — REVISADO: zero importadores em src/ e tests/
- src/hoc/withAuth.tsx, withAnalytics.tsx, withErrorHandler.tsx, withLoading.tsx — REVISADO parcialmente: withAuth lido linha a linha e sem importadores; os outros tres so verificados quanto a uso (nao sao de autorizacao)
- src/middleware/index.ts — REVISADO: authMiddleware/adminMiddleware sem importadores
- src/hooks/usePermission.ts (singular) — REVISADO: morto; chama RPC sem EXECUTE para authenticated
- src/hooks/usePermissions.ts (plural) — REVISADO parcialmente: vivo (RolesPage, AccessControl, PermissionsManager); le tabelas permissions/role_permissions, nao a RPC
- src/components/layout/sidebar/sidebarNavData.ts — REVISADO: 72 destinos, todos com rota correspondente; sem campo de papel
- src/components/organisms/layout/Sidebar.tsx — REVISADO: filtra so a secao Administracao; busca e favoritos usam a lista completa
- src/config/menu.ts + src/components/layout/SimpleSidebar.tsx — REVISADO: 16 itens, todos com rota; sem papel
- src/constants/routes.ts — REVISADO: morto e divergente do roteador
- src/lib/prefetch.ts + src/hooks/useRoutePreload.ts — REVISADO: 18 de 72 destinos
- tests/e2e/routes-smoke.spec.ts — REVISADO: 29 rotas, sessao falsa, nenhuma assercao de autorizacao
- Papeis reais — CONFIRMADO: enum public.app_role = ('operador','supervisor','admin') (supabase/migrations/20251216141003_...:2); os mesmos tres literais aparecem em AuthContext, authService, ProtectedRoute, RoleGuard e utils/role
- Paginas orfas — VERIFICADO E NEGATIVO: script cruzando os 86 import() dos arquivos de rota com os 72 .tsx de src/pages e os 15 de src/features/**/pages nao encontrou nenhuma pagina sem rota (OperationalMonitorPage e reexportada por src/pages/DashboardOperacional.tsx:1-2, que a rota /monitor carrega)
- Imports lazy quebrados — VERIFICADO E NEGATIVO: os 86 especificadores de import() resolvem para arquivo existente, inclusive o de nome acentuado EndereçamentoAutomatico.tsx
- Rotas duplicadas — VERIFICADO E NEGATIVO: nenhum path declarado duas vezes (86 declaracoes, todas com contagem 1)
- Links de menu para rota inexistente — VERIFICADO E NEGATIVO: os 72 destinos da sidebar e os 16 de menu.ts batem com rotas declaradas
- npx tsc --noEmit -p tsconfig.app.json — EXECUTADO: saida vazia, codigo 0
- npx vitest run src/utils/**tests**/role.test.ts src/services/**tests**/authService.test.ts — EXECUTADO: 2 arquivos, 7 testes, todos passando
- NAO REVISADO: o interior das 85 paginas (so AjustesEstoque, Configuracoes, ImportExport, TwoFactorAuth, Auth e Login foram abertos) — fora do escopo desta camada
- NAO REVISADO: as policies das tabelas por tras das 47 rotas sem papel, uma a uma — so user_roles, profiles, audit_log e ajustes_estoque foram lidas; confirmar o resto exige consulta a pg_policies, e o MCP do banco responde 401 nesta sessao
- NAO REVISADO: comportamento real do RLS para usuario autenticado (nenhum JWT de usuario disponivel), por isso o achado sobre o REVOKE de has_role fica como hipotese
- NAO EXECUTADO: npm run test:e2e (precisa de servidor e navegador) e npm run build

### Camada: features-ui

**Cobertura declarada:** Auditoria somente-leitura de src/features/ (107 arquivos, 8 módulos) confrontada com src/pages/ (76 páginas), a tabela de rotas (src/App.tsx + src/routes/*.tsx) e o menu real (src/components/layout/sidebar/sidebarNavData.ts). Inspecionei de ponta a ponta as 15 páginas de feature, os 13 hooks, os 3 services da camada e os componentes ligados a elas, lendo os arquivos (não só grep) e seguindo cada caminho rota → página → hook → service → tabela. Verificações executadas: `npx tsc --noEmit` (sai 0), `npx eslint src/features` (180 avisos, 0 erros), `npx vitest run src/features` (3 arquivos / 7 testes, todos passando), varredura de referências arquivo a arquivo para achar órfãos, contagem de `.select(` sem `.limit(` e contagem de classes de cor fora do token semântico. Ficou de fora: comportamento em navegador (nada foi aberto de verdade — os achados de roteamento são rastreados no código, não testados em runtime), a lógica interna dos componentes de amostragem AQL da qualidade e do ImportarNFDialog (merecem auditoria de regra de negócio própria), e qualquer afirmação sobre RLS das tabelas consumidas, porque o MCP do banco responde 401 nesta sessão. Dos quatro padrões pedidos: não há feature com página não roteada (as 15 estão registradas) — o problema é o inverso, páginas roteadas e inalcançáveis; há duplicação viva de tela entre pages/ e features/ (romaneios/expedição e os dois dashboards); há service e hook duplicados (ABC em 4 versões, `performanceService` em 2); e há 2 componentes com zero referências provadas por varredura.

Itens inventariados:

- src/features/analytics (16 arquivos) — REVISADO: ABCAnalysisPage, DemandForecastPage, KPIsPage, OperationalMonitorPage, RealtimeDashboardPage, useCurvaABC, useDemandForecast, useKPIsOperacionais(.ts shim + pasta), useKPIAlerts, useOperationalLive, useRealtimeKPIs, performanceService, PerformanceMonitor
- src/features/dashboard (11 arquivos) — REVISADO: DashboardPage, IndexHero, IndexKPIs, IndexOcupacaoCard, IndexQuickStats, IndexOperations, IndexAtividade, SystemHealthMonitor, useDashboard, useAtividadeRecente, **tests**/useDashboard.test.tsx
- src/features/inventory (30 arquivos) — REVISADO: EstoquePage (lido linha a linha), useEstoque, usePosicaoDetalhes, EstoqueToolbar (órfão), EstoqueStatsCards, EstoqueFilterSheet, EstoqueMapaTab, estoque-page/EstoqueVirtualList, NovaPosicaoDialog, PosicaoDetalhesDialog + posicao-detalhes/_, cyclic/_ (3), inventory-page/* (3), index.ts; NÃO REVISADOS em profundidade: AlertaPerdaLogistica, MapaCalorOcupacao, WarehouseMap, PosicaoCard, PosicaoGrid, BoxForm, PortaPaleteForm — apenas checados quanto a referências, `.limit()` e cores (motivo: orçamento de leitura concentrado nas páginas e nos fluxos quebrados)
- src/features/multiWarehouse (2 arquivos) — REVISADO superficialmente: MultiWarehouseDashboardPage (rota /dashboard-gerencial confirmada, trata erro) e useMultiWarehouseDashboard; sem achado próprio
- src/features/picking (5 arquivos) — REVISADO: PickingPage, usePicking, pickingService, pickingService.test, types; nota não elevada a achado por ser da camada de banco: `pickingService.updateTaskStatus` conclui a tarefa e grava `eventos_picking` sem baixar saldo de posição, e não há trigger de estoque em `tarefas` (só update_tarefas_updated_at, trigger_xp_on_tarefa_complete e trg_tarefas_version nas migrations) — confirmar com a camada de banco
- src/features/quality (25 arquivos) — REVISADO: TriagemPage, FormularioTriagem, DashboardTriador, useTriagens, TriagemTimer (órfão), triagem-page/* (2), formulario/* (8), components/index.ts; NÃO REVISADOS em profundidade: AmostragemAutomatica, AmostragemProgresso, AmostragemSelecao, amostragemUtils, DefeitoHistorico, FotosLoteObrigatorias, VolumeContagem, TriagemCard — só checados quanto a referências, tamanho e cores (motivo: a lógica de amostragem AQL merece auditoria própria de regra de negócio, fora do escopo desta camada)
- src/features/receiving (11 arquivos) — REVISADO: RecebimentoPage, ConferenciaRecebimento (lida linha a linha), useRecebimentos, receivingUtils, novo-recebimento/{FormFields,types}, NovoRecebimentoDialog, components/index.ts; NÃO REVISADO em profundidade: ImportarNFDialog (355 linhas), RecebimentoCard — só referências, `.limit()` e cores
- src/features/shipping (7 arquivos) — REVISADO: ShippingPage, useRomaneios, shippingService, shippingService.test, types, ExpedicaoTimeline e VolumeChecklist (referências e cores)
- Fora de src/features, lidos para a comparação velho × novo: src/App.tsx, src/routes/{wmsRoutes,featureRoutes,analyticsRoutes,adminRoutes,publicRoutes}.tsx, src/components/layout/AppLayout.tsx, src/components/layout/sidebar/sidebarNavData.ts, src/config/menu.ts, src/pages/Dashboard.tsx, src/pages/DashboardOperacional.tsx, src/pages/Romaneios.tsx (imports e wiring), src/services/abcService.ts, src/hooks/useABCAnalysis.ts, src/utils/{logger,performance}.ts, src/integrations/supabase/types.ts (tabela produtos), supabase/functions/{abc-analysis,previsao-demanda}/index.ts
- NÃO VERIFICADO nesta sessão: comportamento em navegador (nenhuma rota foi aberta de verdade); os achados de rota são RASTREADOS pela leitura de src/routes/ + chamadas de navigate(). Não foi possível consultar pg_policies/pg_catalog (MCP do banco responde 401), então nenhuma afirmação sobre RLS das tabelas consumidas por esta camada foi feita.

### Camada: hooks-estado

**Cobertura declarada:** Inspecionei integralmente os 6 contextos (src/contexts/) e src/stores/, e em src/hooks/ (284 arquivos) + src/features/**/hooks/ (19) usei três varreduras executadas para priorizar: (a) quais hooks têm consumidor real — 79 usados, 205 mortos; (b) todos os 16 arquivos que criam canal realtime/subscription; (c) todos os 13 setInterval e 15 setTimeout, os 13 warnings de react-hooks/exhaustive-deps (`npx eslint`, 222 warnings/0 errors), os catches silenciosos (script), as mutações sem invalidateQueries (0 encontradas) e as 32 consultas sem limite. Os arquivos que importam, li por completo: AuthContext, NotificationContext, AppContext, ThemeContext, TransitionContext, ToastContext, stores/index.ts, useMovimentacoes, useProdutos, useNotificacoes, useNotificationOperations, useNotificationRealtime, useRealtimeToast, useRealtime, useSubscription, useChannel, usePresence, useGamificacao, useTriagens, usePicking, useRecebimentos, useRomaneios, useEstoque, useRealtimeKPIs, useOperationalLive, useKeyboardShortcuts, useTriagemTimer, use-toast, useLocalStorage, useOnlineStatus, usePushNotifications, useIndexedDB, useSWR, useRefreshToken, useQuery/useMutation caseiros. Para provar o comportamento de canal da biblioteca li o código de @supabase/realtime-js 2.119.2 em node_modules e executei um script Node contra ele. `npx tsc --noEmit` passa (exit 0). Ficou de fora: os 205 hooks sem consumidor (amostrados, não auditados um a um — impacto zero hoje), os hooks de governança/MFA/permissões que dependem de policies do banco (o MCP do Supabase responde 401, então não há como provar nada ali), e hooks que moram em src/components/, fora desta camada. Nada foi editado e nenhuma escrita foi feita em banco, storage ou serviço externo.

Itens inventariados:

- src/contexts/AuthContext.tsx — REVISADO: padrão onAuthStateChange antes de getSession está correto (:45-91), cleanup com `mounted`, `subscription.unsubscribe()` e `clearTimeout(safety)` presentes. Único ponto fraco não reportado por baixo impacto: o objeto `value` (:151-164) e as funções `hasRole`/`canAccess` (:138-147) não são memoizados, mas os consumidores usam direto em render (ProtectedRoute.tsx:28, RoleGuard.tsx:35), sem deps de memo.
- src/contexts/NotificationContext.tsx — REVISADO: origem dos achados 5, 6, 7 e 8.
- src/contexts/AppContext.tsx — REVISADO: montado em AppProviders.tsx:52 e sem nenhum consumidor (`useApp()` → 0 chamadas). Duplica sidebarOpen/theme/notifications que vivem em ThemeContext e NotificationContext. Reportado no achado 13.
- src/contexts/ThemeContext.tsx — REVISADO: não reportado como achado próprio. Com `theme: "system"` (default, :13-15) não há listener de `matchMedia` change (:20-22), então trocar o tema do sistema operacional não reflete até recarregar. Impacto cosmético.
- src/contexts/ToastContext.tsx — REVISADO: nunca montado (0 referências). Reportado nos achados 13 e 14.
- src/contexts/TransitionContext.tsx — REVISADO: correto; `value` memoizado (:31-39), sem efeito, sem timer.
- src/stores/index.ts — REVISADO: `createStore`/`appStore` com 0 consumidores em todo o src. Reportado no achado 13.
- Realtime/subscriptions (14 arquivos) — REVISADOS integralmente: useMovimentacoes, useProdutos, useNotificationRealtime, useNotificacoes, useRealtimeToast, useRealtime, useSubscription, useChannel, usePresence, useGamificacao, useTriagens, usePicking, useRecebimentos, useRomaneios, useEstoque, useRealtimeKPIs. Comportamento da biblioteca verificado no node_modules e provado com script executado.
- Timers — REVISADOS: auditoria de pares setInterval/clearInterval e setTimeout/clearTimeout nos 3 diretórios. Todos os 13 `setInterval` têm `clearInterval`. 15 arquivos têm `setTimeout` sem `clearTimeout`; dos que estão em uso, só useTriagemTimer gerou achado (16). usePresenceAnimation.ts:9,12 e useAriaLive.tsx:7 têm setTimeout sem cleanup (setState após desmontar), mas ambos têm 0 consumidores — cobertos pelo achado 13. useRefreshToken.ts:10 sobrescreve o timeoutRef sem limpar o anterior, criando cadeias duplicadas de refresh — também 0 consumidores.
- Cache TanStack Query — REVISADO: nenhuma `useMutation` do repo fica sem `invalidateQueries`/`setQueryData` (varredura em src/hooks, src/features, src/pages, src/components: 0 arquivos sem). Nenhuma `onMutate` (atualização otimista via TanStack) existe no projeto — o problema de rollback aparece em estado local manual (achado 5).
- queryKey instáveis — REVISADO E DESCARTADO: nenhuma `queryKey` usa `new Date()`, `Date.now()`, `Math.random()` ou `.toISOString()` inline. Objetos literais como `["produtos", { page: 1, pageSize: 100 }]` (useProdutos.ts:41) são seguros porque o TanStack hasheia a chave estruturalmente.
- catch vazio — REVISADO: varredura por script nos 3 diretórios encontrou 12 catches silenciosos; 10 são legítimos (APIs de browser: localStorage, clipboard, wake lock, áudio, speech). Os relevantes (useNotificationOperations.ts:113,159) entraram no achado 5. useMFA.ts:176 engole erro ao remover fator de MFA — não reportado por falta de rastreio do fluxo completo de MFA, que pertence a outra camada.
- react-hooks/exhaustive-deps — REVISADO: `npx eslint src/hooks src/contexts src/stores` → 222 warnings, 0 errors; 13 são exhaustive-deps. Lidos um a um; geraram achado apenas useIndexedDB.ts:13 (achado 15). Os demais estão em hooks sem consumidor (useSWR.ts:26 fetcher congelado, useSpring.ts:19, useEventSource.ts:11, useLifecycles.ts:6, useImagePreload.ts:8) ou são inofensivos (useKeyboardShortcuts.ts:127 — `shortcuts` recriado a cada render mas as ações só fecham sobre `navigate`, que está nas deps; useGestaoTarefasPage).
- Consultas sem limite — REVISADO por script nos 3 diretórios + src/features: 32 ocorrências, amostra de 3 verificada linha a linha (achado 4).
- NÃO REVISADO — src/hooks: os 205 hooks sem nenhum consumidor foram inventariados e amostrados (useQuery, useMutation, useSWR, useIndexedDB, useRefreshToken, useRetry, usePresenceAnimation, useAriaLive, useSubscription, useChannel, usePresence, useRealtime, useRealtimeToast, useLocalStorage, useOnlineStatus lidos na íntegra), mas não auditados individualmente: sem consumidor, qualquer defeito neles tem impacto zero hoje e reportá-los inflaria o plano. Ficam cobertos pelo achado 13 (remoção).
- NÃO REVISADO — src/hooks/useGovernanca.ts (563+ linhas), useInventarioCiclico/, useMFA.ts, useWebAuthn.ts, usePermissions.ts: hooks em uso mas cujo comportamento depende de regras de domínio/autorização e de policies do banco. Com o MCP do Supabase respondendo 401, não foi possível conferir policies nem rodar as consultas; auditá-los só por leitura geraria achados sem prova. Pertencem às camadas de domínio/segurança.
- NÃO REVISADO — hooks em src/components (ex.: src/components/kanban/useKanbanData.ts:32, que tem refetchInterval de 30s): estão fora dos três diretórios desta camada.

### Camada: services-contratos

**Cobertura declarada:** Inspecionei integralmente os 24 arquivos de src/services/ (+ o barrel index.ts) e os 3 services em src/features/**/services/ (picking, shipping, analytics/performance), lendo cada arquivo na íntegra — não só grep. Para cada tabela e RPC referenciado, confrontei nome e colunas contra src/integrations/supabase/types.ts (86 tabelas, 3 views, 22 functions) e, onde os tipos se mostraram desatualizados, contra as 178 migrations em supabase/migrations/. Segui ponta a ponta os caminhos vivos: mapeei os consumidores de cada service com grep em todo o src (resultado: 9 dos 27 services têm consumidor real; 15 só aparecem no barrel, que por sua vez não é importado em lugar nenhum) e, nos caminhos vivos, li o hook e a página até o call site — foi assim que apareceram os dois achados críticos (stub de entrega em useRomaneios e armazenamento sem posição em Armazenamento.tsx). Li também o corpo SQL de public.move_stock para validar o contrato do único RPC de escrita usado pela camada. Comandos executados: npx tsc --noEmit (limpo), npx eslint sobre services e hooks de shipping (82 warnings, 0 erros — todos no-explicit-any e no-unused-vars), npx vitest run dos 7 arquivos de teste da camada (26 testes verdes) e leitura do eslint.config.js + package.json para explicar por que o gate não pega nada disso. FORA DA COBERTURA, e por quê: o estado real do banco (pg_policies, pg_catalog, contagem de linhas) — o MCP responde 401, conforme já estabelecido, então todo achado de schema é RASTREADO sobre tipos+migrations, nunca consultado no banco; nenhuma requisição foi feita a endpoint de produção; nenhum arquivo foi editado; scripts/apply_rls_helper.cjs não foi aberto. Hooks, componentes, edge functions e migrations como camada própria ficaram de fora do escopo — só entraram como evidência de caminho vivo.

Itens inventariados:

- src/services/abcService.ts — REVISADO. Sem Zod, sem limit, sem try/catch (erro sobe). Tabela lotes + join produtos: existem. Sem consumidor.
- src/services/alertService.ts — REVISADO. Tipado via Database, try/catch em todos os métodos, .limit(limit) presente. Tabela notificacoes existe; campos tipo/titulo/mensagem/lida/referencia_* conferem. Sem consumidor. Nenhum defeito.
- src/services/analyticsService.ts — REVISADO. Achado: colunas inexistentes em analytics_events (action/metadata/entity_type/event_name/created_at).
- src/services/auditService.ts — REVISADO. Único service com paginação completa correta (count exact + range). RPC log_audit_event existe com a assinatura usada (types.ts:4352). VIVO (useAuditLog, AuditLogPage). Nenhum defeito relevante.
- src/services/authService.ts — REVISADO. profiles e user_roles existem; colunas conferem. Retorna null em erro de propósito (AuthContext depende). VIVO. Nenhum defeito.
- src/services/backupService.ts — REVISADO. Usa Storage, não tabela; fora do escopo de contrato de tabela/RPC. Bucket "backups" não verificável nesta sessão (MCP do banco 401). Sem consumidor.
- src/services/barcodeService.ts — REVISADO. Tipado via Database; produtos.barcode existe (types.ts:2819). try/catch presente. Sem consumidor. Nenhum defeito.
- src/services/batchService.ts — REVISADO. Achados: valores fora do enum status_recebimento; read-modify-write sem version.
- src/services/categoryService.ts — REVISADO. Achado: tabela "categorys" não existe.
- src/services/customerService.ts — REVISADO. Achado: tabela "customers" não existe.
- src/services/gamificacaoService.ts — REVISADO. Achados: coluna motivo inexistente em xp_historico com erro descartado; N+1 em checkConquistas; erros escondidos atrás de [].
- src/services/index.ts — REVISADO. Barrel que reexporta os 24 services e não é importado por nenhum arquivo (grep por 'from "@/services"' em src: zero resultados).
- src/services/inventoryService.ts — REVISADO. Achados: limit default 1000 acima do teto 500, getAllOccupied sem limite, log de auditoria com erro descartado e sem status_anterior. Tabelas/colunas conferem. VIVO (useEstoque).
- src/services/locationService.ts — REVISADO. Achado: interface Location declara 5 colunas inexistentes em locations.
- src/services/lotService.ts — REVISADO. Achado: tabela "lots" não existe.
- src/services/movimentacaoService.ts — REVISADO. Achados: posições nulas rejeitadas por move_stock (caminho de entrada); getByProduto/getByLote sem limite. getAll com count exact está correto. VIVO (useMovimentacoes).
- src/services/notificacaoService.ts — REVISADO. Tabela e colunas conferem; mensagem NOT NULL tratada na linha 40. Achados menores: listar() sem limite, marcarComoLida devolve false em erro. Sem consumidor.
- src/services/orderService.ts — REVISADO. Achado: count ausente no select. create() não é atômico (pedido órfão se os itens falharem) mas é inalcançável — o botão "Novo Pedido" em OrdersPage.tsx:43-45 não tem onClick. VIVO só na leitura.
- src/services/productService.ts — REVISADO. produtos e rastreamento_historico.data_evento existem; range + count exact corretos. VIVO (useProdutos). Nenhum defeito.
- src/services/qualityService.ts — REVISADO. Achados: getAll sem limite; update(updates: any) sem validação. eventos_triagem e colunas conferem. VIVO (useTriagens).
- src/services/receivingService.ts — REVISADO. Achado: getRecebimentos sem limite. LoteInsert tipado e status "aguardando" é valor válido do enum. try/catch via handleReceivingError. VIVO (useRecebimentos).
- src/services/relatorioService.ts — REVISADO. Tabelas conferem; agregações feitas no cliente sobre selects sem limite (achado de teto). Sem consumidor.
- src/services/stockService.ts — REVISADO. Achados: tabela location_stock inexistente; colunas previous_qty/new_qty inexistentes; read-modify-write sem transação.
- src/services/supplierService.ts — REVISADO. Achado: GRANT só de SELECT para authenticated contra policy FOR ALL. Tabela suppliers existe em migration mas falta nos tipos.
- src/services/warehouseService.ts — REVISADO. Achado: tabela "warehouses" não existe (o nome real é armazens).
- src/features/analytics/services/performanceService.ts — REVISADO. Não toca banco (só web-vitals + logger). Nada a reportar nesta camada; o TODO da linha 22 ("would send data to a monitoring endpoint") é lacuna de observabilidade, não de contrato.
- src/features/picking/services/pickingService.ts — REVISADO. Achados: conclusão não baixa estoque; getTasks sem limite e sem filtro de status. tarefas e eventos_picking existem e as colunas conferem. VIVO.
- src/features/shipping/services/shippingService.ts — REVISADO. O service está correto (romaneios, romaneio_itens, comprovantes_entrega e colunas conferem); o defeito está no hook que não o chama. VIVO só em getRomaneios/criarRomaneio/atualizarStatus.
- Tabelas/RPC referenciados que NÃO estão nos tipos gerados: warehouses, lots, categorys, customers, location_stock (não existem em lugar nenhum — nem nos tipos nem nas 178 migrations); suppliers (existe em migration 20261121090000, ausente dos tipos). Todos os outros nomes usados pelos services — produtos, lotes, posicoes_estoque, estoque_posicao, rastreamento_historico, posicao_status_log, notificacoes, audit_log, analytics_events, orders, order_items, products, locations, stock_movements, tarefas, eventos_picking, eventos_triagem, romaneios, romaneio_itens, comprovantes_entrega, profiles, user_roles, gamificacao_usuarios, conquistas_definicoes, conquistas_usuarios, desafios_diarios, desafios_usuarios, xp_historico — estão nos tipos. RPCs usados (log_audit_event, move_stock) existem e as assinaturas conferem.
- NÃO REVISADO: estado real do banco (pg_policies, pg_catalog, contagem de linhas) — o MCP supabase-estoki responde "Management API 401: Invalid access token", conforme o contexto da auditoria. Tudo sobre schema foi derivado de src/integrations/supabase/types.ts + supabase/migrations/, e os tipos estão provadamente desatualizados em 3 migrations.
- NÃO REVISADO: hooks e componentes que consomem os services, salvo os pontos citados como evidência de caminho vivo (useRomaneios, useMovimentacoes, useEstoque, useAuditLog, useProdutos, useTriagens, useRecebimentos, OrdersPage, Armazenamento, Romaneios) — fora da camada atribuída.
- NÃO REVISADO: as 249 edge functions em supabase/functions/ e os 23 scripts/seed-_.cjs / probe-_.cjs — outra camada; os scripts, além disso, apontam para produção com service_role.

### Camada: edge-auth

**Cobertura declarada:** Inspecionei a camada de autenticação/autorização das 247 edge functions com index.ts (os 249 diretórios incluem _shared/ e tests/, que não são funções). Cobertura: contagem automatizada em 100% dos arquivos para os marcadores de auth (SERVICE_ROLE, header Authorization, auth.getUser, has_role, user_roles, verbos de escrita), leitura integral de 23 arquivos nos caminhos mais sensíveis, leitura dos 6 schemas Zod envolvidos, e supabase/config.toml por inteiro. Números: 200/247 usam service_role; 21/247 leem o header Authorization; 16/247 chamam auth.getUser; 3/247 barram por papel; 0/247 chamam has_role; 66 escrevem com service_role sem nunca ler o header, e 24 dessas estão deployadas. Não existe supabase/functions/_shared/auth.ts — é a raiz comum da maioria dos achados.

AVISO IMPORTANTE, preciso ser transparente: ao sondar produção com GET sem autenticação, reorder-check respondeu HTTP 200 e, por desenho (reorder-check/index.ts:54-57), executou um upsert em reorder_suggestions. Foi uma escrita em produção não intencional, violando a regra de somente-leitura desta auditoria. É um upsert idempotente com onConflict em product_id, com os mesmos valores que o cron já grava, então o dano prático é nulo — mas aconteceu e o dono deve saber. Em seguida interrompi toda a sondagem de endpoints de produção. NÃO sondei cleanup-old-data nem external-db-bridge, cujos caminhos de DELETE eu havia acabado de ler; esses achados são 100% estáticos.

Ficou de fora: a definição real das funções SQL chamadas por rpc() e as policies de pg_policies (o MCP do banco responde 401 na Management API nesta sessão) — é o que mantém o achado de inventory-transfer como hipótese; o estado real dos secrets das edges (WEBHOOK_SECRET, METRICS_TOKEN, SUPABASE_AUTH_JWT_SECRET), que afeta a severidade final de webhook-handler e webauthn-auth-verify; o estado de deploy de ~173 funções não sondadas; e a leitura integral das 42 funções escritoras não deployadas. Nada nos achados depende de informação que eu não tenha citado com arquivo:linha ou saída de comando.

Itens inventariados:

- 247 arquivos supabase/functions/*/index.ts — REVISADOS por grep/contagem automatizada em 100% (service_role, header Authorization, auth.getUser, has_role, user_roles, verbos de escrita); 23 arquivos LIDOS integralmente ou em trechos relevantes
- 200/247 usam SERVICE_ROLE_KEY — REVISADO (contagem). Dessas, 66 escrevem (.insert/.update/.upsert/.delete) e nunca leem o header Authorization; 24 dessas 66 estão deployadas no projeto oficial (confirmado por probe OPTIONS), 42 responderam 404
- 21/247 leem req.headers.get('Authorization') — REVISADO, todas as 21 listadas: adjust-inventory, agv-dispatch, ai-classification, alert-productivity, alert-quality, alert-sla-breach, auth-2fa-setup, auth-2fa-verify, auth-change-password, auth-logout, backend-health, carrier-book, carrier-cancel, carrier-rates-cache, carrier-webhooks, db-alert-monitor, get-permissions, inventory-transfer, metrics, webauthn-register-options, webauthn-register-verify
- 16/247 chamam auth.getUser() e de fato validam o usuário — REVISADO, todas listadas: agv-dispatch, alert-productivity, alert-quality, alert-sla-breach, auth-2fa-setup, auth-2fa-verify, backend-health, carrier-book, carrier-cancel, carrier-rates-cache, carrier-webhooks, db-alert-monitor, get-permissions, metrics, webauthn-register-options, webauthn-register-verify
- 3/247 checam papel/role antes de operar — REVISADO: backend-health/index.ts:31-49 (requireAdmin), metrics/index.ts:37-51, db-alert-monitor/index.ts:41-49. Outras 2 leem user_roles sem barrar: get-permissions/index.ts:35 (só devolve as próprias), check-permission/index.ts:22 (userId do corpo, sem gate)
- 0/247 chamam has_role() — REVISADO (grep), apesar de a função ser o padrão exigido pelas regras do projeto para autorização
- supabase/config.toml — REVISADO integralmente: verify_jwt=false apenas para reorder-check (:3-4) e stock-alert (:6-7)
- supabase/functions/_shared/ (21 arquivos) — REVISADO o inventário; cors.ts, schemas.ts (trechos), logger.ts e rate-limit.ts (por uso) inspecionados. NÃO existe _shared/auth.ts: não há primitiva de autorização compartilhada, raiz do achado agregado
- supabase/functions/_shared/schemas.ts — REVISADO parcialmente: 6 schemas lidos na íntegra (ChangePasswordOnlySchema:47-49, InventoryAdjustSchema:104-110, AuditLogSchema:332-335, CleanupOldDataSchema:441-443, CheckPermissionSchema:455-459, GenericPayloadSchema:733-737). Os ~120 schemas restantes NÃO revisados — fora do escopo de auth e sem indício de problema de autorização
- withLogging() — REVISADO (contagem): 2/247. rateLimit() — REVISADO: 11/247
- Estado de deploy: REVISADO por probe OPTIONS em 74 funções (66 escritoras + 8 de auth/permissão) no projeto oficial ookjbflsnoefnsixrspc — 28 responderam 200 (deployadas), 46 responderam 404 (não deployadas). As outras ~173 funções NÃO tiveram o estado de deploy verificado
- NAO REVISADO — definição real das funções SQL chamadas por rpc() (transferir_estoque e outras): o MCP do banco responde 'Management API 401: Invalid access token' nesta sessão, logo pg_get_functiondef/pg_policies são inacessíveis. É o que mantém o achado de inventory-transfer como hipótese
- NAO REVISADO — estado real dos secrets das edge functions (WEBHOOK_SECRET, METRICS_TOKEN, SUPABASE_AUTH_JWT_SECRET): sem acesso à Management API. Afeta a severidade final dos achados de webhook-handler (fail-open) e webauthn-auth-verify (validade do JWT forjado)
- NAO REVISADO — as 42 funções escritoras não deployadas, além das já citadas nos achados: lidas apenas por grep, sem leitura integral, por terem impacto latente e não ativo
- NAO REVISADO — scripts/apply_rls_helper.cjs:18 (contém senha de produção): apenas citado, não lido, não executado, conforme a regra da auditoria

### Camada: regras-negocio-codigo

**Cobertura declarada:** Percorri ponta a ponta os 8 domínios pedidos (recebimento, triagem/qualidade, armazenagem/putaway, picking, expedição, inventário cíclico, trocas/devoluções, alertas), lendo os arquivos de verdade e confrontando as três camadas: tipos/hooks/páginas do front (src/), edge functions (supabase/functions/) e DDL (supabase/migrations/ + o enum/esquema real exposto em src/integrations/supabase/types.ts, que é gerado do banco oficial). Para cada regra segui o caminho do clique até o INSERT/UPDATE. Executei: contagem de stubs nas 247 edge functions, contagem das functions realmente invocadas pelo front, `npx tsc --noEmit` (sai 0, o que prova que as divergências de enum não são pegas em compilação) e um node para provar a aritmética NaN do reorder-check. Tratei docs/agentes/regras-dominio.md e docs/pendencias/_regras-de-negocio.md como hipótese: vários pontos deles não se sustentam (ver achados 2, 3 e 11). FICOU DE FORA: (a) consulta a pg_policies/pg_catalog — o MCP do banco responde 401, então "a tabela existe no banco" foi inferido do types.ts gerado, não de pg_catalog; (b) execução de e2e/Playwright contra produção, então nenhum achado é "testado em runtime de produção" — os marcados EXECUTADO são comandos locais; (c) scripts/apply_rls_helper.cjs (só citado, nunca lido/executado); (d) gamificação, RBAC, multi-tenant e os 23 scripts seed-*, fora do escopo desta camada; (e) os ~130 componentes de UI puramente visuais dos módulos (cards, charts), lidos só quando consumiam uma regra.

Itens inventariados:

- REVISADO — Recebimento: src/features/receiving/{types,hooks/useRecebimentos,pages/RecebimentoPage,pages/ConferenciaRecebimento,utils/receivingUtils}, src/services/receivingService.ts, src/types/recebimento.ts, enum status_recebimento (migrations 20251216* + 20260513191848)
- REVISADO — Triagem/Qualidade: src/features/quality/{types,hooks/useTriagens,pages/{TriagemPage,FormularioTriagem,DashboardTriador},components/{AmostragemAutomatica,amostragemUtils,triagem-page/TriagemListItem}}, src/services/qualityService.ts, src/types/triagem.ts, migration 20251220114813_create_triagens_table.sql, tabela eventos_triagem
- REVISADO — Armazenagem/Putaway: src/pages/Armazenamento.tsx, src/pages/putaway/PutawayPage.tsx, src/hooks/usePutaway.ts, src/hooks/useMovimentacoes.ts, src/services/movimentacaoService.ts, RPC move_stock (migrations 20260512213303 e 20260619152035 + 5 arquivos de GRANT)
- REVISADO — Picking: src/features/picking/{types,hooks/usePicking,services/pickingService}, src/pages/Ondas.tsx, src/components/ondas/NovoOndaDialog.tsx, src/hooks/{useFEFO,useFIFO,useLIFO}.ts, enums status_tarefa/tipo_tarefa/status_onda
- REVISADO — Expedição: src/features/shipping/{types,hooks/useRomaneios,services/shippingService,pages/ShippingPage}, src/pages/Romaneios.tsx, migration 20251216162229 (romaneios, romaneio_itens, comprovantes_entrega, enums status_romaneio/status_entrega)
- REVISADO — Inventário cíclico: src/pages/InventarioCiclico.tsx, src/hooks/useInventarioCiclico/{index,utils,types}.ts, src/components/inventario/{CicloCard,InventarioConfigTab,InventarioDashboardTab}.tsx, src/features/inventory/components/cyclic/*, migration 20251216155903 (inventario_ciclos/contagens/config)
- REVISADO — Trocas/Devoluções: src/hooks/useTrocasDevolucoes.ts, src/types/trocas.ts, src/components/trocas/{RegistroCard,WorkflowProgress}.tsx, src/components/trocas-page/DetalheRegistroDialog.tsx, src/pages/TrocasDevolucoes.tsx, migrations 20251220120926 e 20251220131534 (enum status_registro_td)
- REVISADO — Alertas: src/services/alertService.ts, src/hooks/{useNotificacoes,useNotificationOperations,useNotificationRealtime}.ts, src/components/notification/notificationHelpers.ts, src/pages/{AlertasInteligentes,Automacoes}.tsx, src/types/notifications.ts, edge functions stock-alert/reorder-check/alert-expiration, migration 20251216161138 (alertas_config, alertas_historico, regras_ponto_pedido, enums tipo_alerta/severidade_alerta/status_alerta)
- REVISADO — Curva ABC: src/services/abcService.ts, src/hooks/useABCAnalysis.ts, src/features/analytics/hooks/useCurvaABC.ts, src/features/analytics/pages/ABCAnalysisPage.tsx, src/components/analytics/abc/*, colunas reais de produtos
- REVISADO — Edge functions como camada de regra: varredura das 247 index.ts (presença de .from/.rpc/.storage/.auth e de SERVICE_ROLE_KEY) + inventário das functions efetivamente invocadas pelo front; leitura integral de quality-inspection, cycle-count, abc-analysis, stock-alert, reorder-check, alert-expiration
- REVISADO — Enums reais do banco via src/integrations/supabase/types.ts (gerado): status_recebimento, status_registro_td, status_tarefa, tipo_tarefa, status_onda, status_posicao, status_entrega, status_romaneio, status_ciclo_inventario, status_contagem, tipo_alerta, severidade_alerta, status_alerta, tipo_evento_rastreamento, tipo_evento_rastreamento_v2
- REVISADO — Painel de auditoria interno src/components/admin/AuditoriaEnterpriseViewer.tsx (conferência dos 8 caminhos citados como 'Implementado') e sua rota em src/pages/admin/AuditLogPage.tsx:120 / src/routes/adminRoutes.tsx:113
- NAO REVISADO — pg_policies / pg_catalog / dados de produção: o MCP do banco responde 'Management API 401'; existência de tabela e valor de enum foram inferidos do types.ts gerado, não consultados no banco
- NAO REVISADO — comportamento em runtime de produção (nenhum fluxo foi exercitado por E2E ou request autenticado); todos os achados de fluxo são RASTREADO por leitura de código, e os EXECUTADO se referem a comandos locais (contagens, npx tsc, node)
- NAO REVISADO — scripts/apply_rls_helper.cjs e os 23 scripts seed-_/probe-_.cjs: apontam para produção com service_role, não executados nem lidos (apenas citados)
- NAO REVISADO — gamificação (XP/streaks/desafios), RBAC/has_role, multi-tenant fase 2 e multi-filial WMS38: fora desta camada
- NAO REVISADO — ~130 componentes de UI dos módulos revisados (cards, charts, dialogs puramente visuais), lidos só quando consumiam uma regra de negócio; e os módulos de Produtos/Categorias/Fornecedores/Pedidos/Clientes, que não estão na lista desta camada

### Camada: edge-robustez

**Cobertura declarada:** Auditei robustez das Edge Functions em três passadas: (1) leitura integral dos 7 módulos de `_shared/` que definem as guardas, (2) leitura integral de 21 `index.ts` e parcial de 8, escolhidos por estarem deployados, por serem chamados pelo front ou por mexerem em saldo/dinheiro, (3) varredura programática das 247 funções para quantificar cada guarda. Verifiquei em produção, via 247 preflights OPTIONS somente-leitura no projeto oficial ookjbflsnoefnsixrspc, quais funções existem de fato: 94 respondem 200 e 153 respondem 404 — isso separa achado vivo de achado latente e está marcado em cada item. Confirmei o contrato de erro do supabase-js lendo o pacote instalado (postgrest-js 2.119.2, `shouldThrowOnError = false`; functions-js 2.119.2, `invoke` nunca rejeita), que é a causa raiz de três achados, em vez de afirmar de memória. Números da camada, sobre 247 funções com `index.ts`: CORS 247, try/catch 245, chamada de validação 210 (mas só 120 com schema específico — 90 usam `GenericPayloadSchema`, que é `z.record(z.unknown())`), `withLogging` 2. Funções com as quatro guardas da regra do repo: 1, e ela não está deployada; deployadas com as quatro: zero. Também: 0 dos 37 fetch externos com timeout, 8 das 16 funções com fetch sem checar `response.ok`, 75 pontos de escrita que descartam o `{ error }`, 168 que devolvem 400 para erro de servidor, 215 que vazam `error.message` ao cliente, 44 com `select()` sem `limit`, 0 ocorrências de idempotência no diretório inteiro, e 100 funções que são stubs devolvendo `success: true` sem executar nada (18 em produção). Duas hipóteses foram medidas e descartadas, e por isso não viraram achado: o custo do base64 em `scanner-ocr` é linear (~90ms/MB), não quadrático; e as 10 funções que eu havia contado como "devolvem 200 em erro" usam `jsonResponse(body, 500, req)` com status posicional, estando corretas. Ficou fora: leitura individual de ~218 `index.ts` (cobertos só por varredura — os agregados são sólidos, mas achado novo neles exigiria leitura), os módulos de domínio de `_shared/` (agv, tsp, forecast, prometheus, telemetry), e qualquer verificação em runtime das escritas, porque exigiria POST que grava em produção, vedado pelas regras desta auditoria; esses achados estão marcados RASTREADO. RLS real em `pg_policies` não foi consultável nesta sessão (MCP do banco com token inválido). `scripts/apply_rls_helper.cjs:18` não foi lido por determinação.

Itens inventariados:

- REVISADO (leitura integral) — _shared/logger.ts (96 l): withLogging, redact, requestIdFrom; relança exceção (l.93)
- REVISADO (leitura integral) — _shared/validation.ts (56 l): methodGuard/errorResponse/successResponse/parseJsonBody/checkRateLimit; ZERO funções importam este módulo (grep -l '_shared/validation' -> 0) — módulo morto
- REVISADO (leitura integral) — _shared/cors.ts (37 l): allowlist l.9-15; handleCors importado por 115 funções e chamado por 0
- REVISADO (leitura integral) — _shared/bulk.ts (73 l): createBulkHandler com try/catch, getServiceClient cacheado, mapWithConcurrency; catch devolve 400 (l.68)
- REVISADO (leitura integral) — _shared/erp.ts (159 l): erpFetch com AbortController 15s, backoff+jitter, circuit breaker; único módulo resiliente do repo
- REVISADO (leitura integral) — _shared/rate-limit.ts (104 l): limitador in-memory, autodeclarado soft; usado por 11 funções (auth/pagamento)
- REVISADO (parcial: cabeçalho + grep de todos os exports) — _shared/schemas.ts (805 l): ~60 schemas específicos + validateInput (l.790-805) + GenericPayloadSchema (l.733-737)
- REVISADO (leitura integral) — index.ts de: adjust-inventory, receiving-confirm, payment-create, ai-completion, queue-process, external-db-bridge, release-stock, receive-purchase-order, reserve-stock, stripe-webhook, packing-confirm, send-whatsapp, send-email-alert, scanner-ocr, stock-alert, reorder-check, create-purchase-order, bulk-delete, batch-processor, health, db-alert-monitor (21 funções)
- REVISADO (parcial: trechos relevantes) — cron-daily, cron-weekly, cancel-order, integration-mercado-livre, integration-correios, ai-assistant, metrics, queue-retry (8 funções)
- REVISADO (por varredura script, não leitura) — as 247 index.ts: matriz das 4 guardas, status no catch final, escritas sem checar erro, selects sem limit, fetch sem timeout/sem response.ok, padrão de stub, Date.now() em número de documento
- REVISADO (EXECUTADO, probe HTTP OPTIONS nas 247) — estado de deploy no projeto oficial ookjbflsnoefnsixrspc: 94 respondem 200, 153 respondem 404
- REVISADO (EXECUTADO) — contrato de erro do supabase-js a partir do pacote instalado: postgrest-js 2.119.2 (shouldThrowOnError=false) e functions-js 2.119.2 (invoke nunca rejeita)
- REVISADO (EXECUTADO) — cobertura de lint/typecheck: eslint.config.js:17, tsconfig.app.json:30, tsconfig.node.json:11, ausência de deno nos workflows
- REVISADO (EXECUTADO, benchmark) — padrão base64 de scanner-ocr:26-28: ~90ms/MB, linear (V8 otimiza concatenação); hipótese de custo quadrático MEDIDA E DESCARTADA, não reportada
- NAO REVISADO — ~218 index.ts não abertos individualmente; cobertos apenas por varredura automatizada. Motivo: orçamento da camada. Os números agregados são confiáveis; achado individual nesses arquivos exigiria leitura
- NAO REVISADO — _shared/agv.ts, tsp.ts, forecast.ts, prometheus.ts, telemetry.ts, prompts.ts. Motivo: são bibliotecas de domínio/cálculo, fora do escopo de robustez de borda
- NAO REVISADO (parcial) — _shared/correios.ts: confirmado apenas que faz fetch em 3 pontos (l.45,74,81) sem timeout; lógica de assinatura e parsing não auditada
- NAO REVISADO — os 7 arquivos _test.ts em _shared/ e os 19 testes unitários do repo. Motivo: a cobertura mede só src/ (vitest.config.ts:20); nenhuma Edge Function tem teste
- NAO VERIFICAVEL nesta sessão — comportamento em runtime dos 100 stubs e das escritas sem checagem. Motivo: exigiria POST que grava em produção, proibido pelas regras da auditoria; achados correspondentes marcados RASTREADO
- NAO VERIFICAVEL nesta sessão — políticas RLS e pg_policies reais. Motivo: MCP do banco responde 'Management API 401: Invalid access token'
- NAO LIDO POR DETERMINACAO — scripts/apply_rls_helper.cjs:18 (senha de produção); apenas citado

### Camada: edge-orfas

**Cobertura declarada:** Inspecionei o acoplamento das 247 edge functions reais (249 pastas em supabase/functions menos _shared e tests, que não têm index.ts — conferido com loop `[ -f index.ts ]`). Mapeei chamadores por 4 vias: (1) `supabase.functions.invoke` em src/ (12 sites, todos lidos, inclusive os 3 dinâmicos: src/lib/ai-invoke.ts, src/pages/admin/IntegrationsPage.tsx, src/pages/admin/SimulationPage.tsx); (2) fetch cru para /functions/v1/ em src/ (1 site); (3) pg_cron/pg_net em supabase/migrations (3 arquivos); (4) chamada função→função em supabase/functions (cron-daily, batch-import, simulation-test). Medi o deploy real do projeto oficial ookjbflsnoefnsixrspc com requisição OPTIONS (preflight, não executa handler) nas 247 funções — calibrei o método antes com um nome inexistente (404) e dois conhecidos (200), e reconfirmei 10 dos 404 numa segunda rodada. Testei alcance anônimo com POST apenas nas 26 funções deployadas que são stub puro (zero `.from/.rpc/.insert/.update/.delete/storage`, verificado por grep arquivo a arquivo) e em alert-expiration com payload inválido (Zod barra antes de qualquer query) — nenhuma escrita. FICOU DE FORA: não consegui enumerar a lista de funções deployadas pela Management API (token 401), então o inverso "deployada em produção mas ausente do repo" só foi testado nominalmente para migrate-helper (a única pasta de função apagada no histórico git); verify_jwt real das outras 67 deployadas não-stub não foi medido porque qualquer POST nelas executaria código com service_role. Também não li as 247 funções integralmente — leitura completa só nas 31 com chamador, nos stubs e nas pares duplicadas.

Itens inventariados:

- TOTAL: 247 edge functions reais (249 pastas em supabase/functions, menos _shared e tests, que não têm index.ts) — REVISADO por contagem e por probe individual
- DEPLOY MEDIDO: 94 respondem 200 e 153 respondem 404 no probe OPTIONS do projeto oficial ookjbflsnoefnsixrspc — REVISADO (todas as 247, com recalibração e 2ª rodada em 10 amostras)
- CHAMADORES NO FRONT: 12 sites `supabase.functions.invoke` + 1 fetch cru (src/pages/admin/SimulationPage.tsx:65) = 13 sites, resolvendo 25 nomes distintos — REVISADO (cada site lido, inclusive os 3 dinâmicos)
- CHAMADORES FORA DO FRONT: 3 por pg_cron (stock-alert, reorder-check, alert-expiration) + 3 função→função (expiration-check, queue-process via cron-daily; stock-movement via batch-import) — REVISADO
- COM CHAMADOR (31): abc-analysis, ai-assistant, alert-expiration, alerta-divergencia-fornecedor, backend-health, calculate-kpis, carrier-track, check-reorder, dashboard-stats, expiration-check, export-data, gerar-desafios-diarios, health-check, integration-amazon, integration-ifood, integration-mercado-livre, integration-rappi, integration-sap, integration-totvs, nfe-import, previsao-demanda, queue-process, reorder-check, scanner-ocr, send-email-alert, stock-alert, stock-movement, webauthn-auth-options, webauthn-auth-verify, webauthn-register-options, webauthn-register-verify — REVISADO (index.ts lido em todas)
- DEPLOYADAS SEM CHAMADOR (65): alert-monitor, alert-productivity, alert-quality, alert-sla-breach, analytics, audit-log, auth-2fa-setup, auth-2fa-verify, auth-change-password, auth-login, auth-logout, auth-refresh-token, auth-register, auth-reset-password, auth-session-list, auth-session-revoke, auth-social-login, auth-verify-email, batch-processor, broadcast-event, bulk-delete, bulk-insert, bulk-update, bulk-upsert, cache, cache-invalidate, calculate-shipping, carrier-book, carrier-cancel, carrier-quote, carrier-quote-correios, carrier-quote-jadlog, carrier-rates-cache, carrier-webhooks, check-permission, cleanup-old-data, complete-job, create-customer, create-payment-intent, create-purchase-order, create-subscription, cte-import, cycle-count, danfe-generate, data-migration, db-alert-monitor, delete-file, download-file, export-pdf, export-products, external-db-bridge, generate-barcode, generate-csv, generate-excel, generate-putaway-list, generate-report, generate-sku, get-permissions, health, import-csv, integration-accounting, integration-ecommerce, integration-erp, integration-marketplace, safety-stock — REVISADO por nome e deploy; corpo lido só nas que são stub (26) e em auth-login e carrier-webhooks
- NÃO DEPLOYADAS E SEM CHAMADOR (151): grupos picking- 7, receiving- 6, packing- 5, wave- 6, inventory- 9, shipping- 6, report- 14, nfe- 6, ai- 7, scheduler- 4, notification- 4, send- 4, queue- 3, webhook 2, mais avulsas (metrics, simulation-test, cron-daily, cron-weekly, batch-import, stripe-webhook, upload-_, parse-_, print-label, scan-barcode, search-_, validate-_, warehouse-metrics, etc.) — NÃO REVISADO individualmente: corpo lido só em picking-optimize e stock-movement; as demais foram inventariadas por nome, deploy e ausência de chamador, que já bastam para a decisão de apagar ou publicar
- CHAMADA PARA FUNCTION INEXISTENTE NO REPO: 0 casos — REVISADO (os 25 nomes conferidos contra `ls supabase/functions`)
- CHAMADA PARA FUNCTION QUE EXISTE MAS NÃO ESTÁ DEPLOYADA: 2 casos (queue-process, stock-movement), ambos com chamador também não deployado — REVISADO
- STUBS DE ECO (`function: "<nome>"` sem acesso a dados): 107 de 247 no repo; 26 das 94 deployadas; 3 das 31 com chamador (abc-analysis, dashboard-stats, expiration-check) — REVISADO (grep por arquivo + leitura dos 26 deployados)
- VERIFY_JWT REAL: medido em 27 funções seguras — 25 exigem JWT (401), 2 são públicas (safety-stock 200 e alert-expiration 400 em payload inválido) contra as 2 declaradas em supabase/config.toml:3-7 — NÃO REVISADO nas outras 67 deployadas: POST nelas executaria código com service_role
- DEPLOYADA MAS AUSENTE DO REPO: só migrate-helper testado (404, fora do ar) — NÃO REVISADO no geral: Management API recusou o token da sessão, logo não há como listar o deploy
- DUPLICAÇÕES MAPEADAS: reorder-check×check-reorder, alert-expiration×expiration-check×check-expiration, picking-optimize×src/hooks/usePickingOptimization.ts, stock-movement×src/services/stockService.ts, dashboard-stats×src/features/dashboard/hooks/useDashboard.ts, abc-analysis×src/hooks/useABCAnalysis.ts, SimulationPage.tsx:36-60×simulation-test/index.ts:26-37 — REVISADO (os dois lados lidos em cada par)

### Camada: performance-dados

**Cobertura declarada:** Auditoria estática de performance de dados sobre todo o `src/` (472 chamadas `.from(`), cruzada com os 274 `CREATE INDEX` de `supabase/migrations/*.sql`. Nada foi editado e nenhum comando de escrita foi executado.

Método: (1) varredura própria em Python que isolou as 210 cadeias `.from(...).select(...)` de leitura e classificou cada uma por presença de `.limit()`/`.range()`/`.single()`/`.maybeSingle()`/`head: true` — 111 sem qualquer teto, 46 delas com `select("*")`; (2) varredura equivalente para chamadas Supabase dentro de laços `for` (14 locais de N+1); (3) inventário das 36 subscrições `postgres_changes` e de quantas têm `filter:` (3); (4) leitura integral dos ~30 arquivos de pior comportamento, não só grep; (5) checagem de rota/consumidor para cada achado, para separar código vivo de morto — por isso `useInfiniteScroll`, `useFulltextSearch`, `useGovernanca` e 6 dos 24 services aparecem apenas no inventário, não como achados.

Métricas medidas nesta sessão: 98 `select("*")`; 23 `count: "exact"`; 36 `postgres_changes` (3 filtrados); 24 `setInterval` + 10 `refetchInterval`; apenas 6 ocorrências de `.limit(500)`, que é a regra do repo (`.claude/skills/estoki-v2/SKILL.md:29`).

Limite declarado: o MCP do banco está com token inválido, então `pg_indexes`, `pg_stat_statements`, `EXPLAIN` e o tamanho das tabelas não foram consultados. Toda afirmação sobre índice vem de `supabase/migrations/` (fonte de DDL segundo o AGENTS.md) e por isso o achado de índices está marcado como hipótese: produção pode ter índices criados fora de migration, e índice só importa a partir de certo volume, que não foi medido. Os 12 achados estão ordenados por impacto; o multiplicador que transforma os outros em incidente é o achado 8 (realtime sem filtro).

Itens inventariados:

- src/pages/Lotes.tsx — listagem de lotes, select("*") + join produtos, sem limite, filtro client-side
- src/pages/serials/SerialsPage.tsx — listagem de seriais, select("*") + join, sem limite
- src/pages/Ondas.tsx — listagem de ondas de separação, select("*") sem limite
- src/pages/customers/CustomersPage.tsx, warehouses/WarehousesPage.tsx, categories/CategoriesPage.tsx — CRUDs com select("*") sem limite
- src/pages/admin/UsersPage.tsx — profiles e user_roles, dois select sem limite
- src/pages/OcupacaoVisual.tsx — mapa de posicoes_estoque, full scan + refetchInterval 30 s + ordem de 3 colunas
- src/pages/Automacoes.tsx — automações com full scan de produtos/estoque_posicao e INSERT/UPDATE por registro
- src/pages/FornecedoresAvancado.tsx — recálculo de score com upsert por fornecedor
- src/pages/RelatoriosAgendados.tsx, AprovacaoMovimentacoes.tsx, AlertasInteligentes.tsx — select("*") sem limite
- src/pages/ImportExport.tsx + components/ImportExport/ImportSection.tsx — importação CSV com 2 round-trips por linha
- src/components/ImportExport/ExportSection.tsx — export com select("*").limit(5000) sem ordem
- src/pages/Produtos.tsx + components/produtos/ProdutoDetailDialog.tsx — histórico de rastreamento sem limite
- src/components/ocupacao/PosicaoDetalhePanel.tsx — único join aninhado de 2 níveis do src
- src/components/dashboard/SystemHealthHUD.tsx — COUNT exact em posicoes_estoque a cada 30 s para medir latência
- src/features/analytics/pages/RealtimeDashboardPage.tsx — 8 COUNT exact + setInterval 30 s + 6 canais realtime
- src/features/analytics/hooks/useOperationalLive.ts — 8 queries, 3 full scans, refetch 30 s (rota /monitor)
- src/features/analytics/hooks/useRealtimeKPIs.ts — 1 canal realtime cobrindo 9 tabelas sem filter
- src/features/analytics/hooks/useKPIsOperacionais/index.ts — metricas_operacionais e metas_kpi com select("*")
- src/features/dashboard/hooks/useDashboard.ts — 6 COUNT exact + limit(2000) + join aninhado
- src/features/receiving/components/ImportarNFDialog.tsx — 3 round-trips por produto da NF
- src/features/receiving/hooks/useRecebimentos.ts + services/receivingService.ts — lotes sem limite (vivo)
- src/features/inventory/hooks/useEstoque.ts, quality/hooks/useTriagens.ts, shipping/hooks/useRomaneios.ts, picking/hooks/usePicking.ts — subscrições realtime (só picking tem filter)
- src/hooks/useProdutividade.ts — N+1: 3 queries por operador, em série
- src/hooks/useNotificacoes.ts, useNotificationRealtime.ts, useNotificationOperations.ts + contexts/NotificationContext.tsx — dois pollers de 60 s e 4 canais
- src/hooks/useCRUD.ts — hook genérico com select("*") + count exact + offset
- src/hooks/useInfiniteScroll.tsx e useFulltextSearch.ts — paginação/busca por servidor prontas, ZERO consumidores
- src/hooks/useExport.ts (paginado, sem consumidor) × src/hooks/use-export.ts (o que a UI usa)
- src/hooks/useBulkActions.ts — único lugar com batch correto (fatiamento + .in())
- src/hooks/usePermissions.ts — UPDATE/INSERT por permissão em laço
- src/services/auditService.ts — audit_log com count exact + offset + ilike de curinga duplo
- src/services/movimentacaoService.ts — rastreamento_historico com join triplo + count exact + offset
- src/services/productService.ts — produtos com count exact + offset; getHistory sem limite
- src/services/batchService.ts, notificacaoService.ts, analyticsService.ts, gamificacaoService.ts, relatorioService.ts, locationService.ts — sem importador fora de src/services (código morto, não priorizados)
- src/hooks/useGovernanca.ts — select("*") mas COM .limit(200)/(500); sem consumidor
- supabase/migrations/*.sql — 274 CREATE INDEX; base do cruzamento filtro × índice

### Camada: performance-front

**Cobertura declarada:** Build de produção executado com sucesso (exit 0, 45.78s, 4893 módulos, 224 chunks JS, dist 26 MB) após injetar VITE_SUPABASE_URL/VITE_SUPABASE_ANON_KEY inline — sem `.env` no repo o `npm run build` aborta no guard de vite.config.ts:46-54. `npx size-limit` executado (7 budgets, todos passam, nenhum com folga no entry). Build adicional com ANALYZE=true para extrair o mapa módulo→chunk do rollup-plugin-visualizer (dist/stats.html, 2 MB) e atribuir cada KB a um pacote. Experimento controlado em cópia do repo no scratchpad (/tmp/.../scratchpad/exp, node_modules por symlink, nada escrito em /home/user/Estoki_V2): removidas as duas entradas de `manualChunks` e medido o primeiro load resultante. Lidos na íntegra: vite.config.ts, .size-limit.json, App.tsx, AppProviders.tsx, AppLayout.tsx, chart.tsx, data-table-advanced.tsx, os 4 arquivos do Kanban, EstoquePage.tsx, EstoqueMapaTab.tsx, inventoryService.ts, useEstoque.ts, useDashboard.ts. Verificado dist/index.html (modulepreload), dist/sw.js (manifest de precache) e os imports estáticos no topo do chunk de entrada. Fora do escopo: nada de banco, nada de deploy, nenhuma escrita no repo (git status só mostra arquivos mexidos por outras camadas da auditoria). O impacto de rede em dispositivo real (LCP/TTI medidos no navegador) é NÃO VERIFICADO — todas as medidas são de bundle/build, não de runtime no browser.

Itens inventariados:

- vite.config.ts — build.rollupOptions.output.manualChunks (linhas 207-221), terser, PWA/workbox, modulePreload.polyfill=false, chunkSizeWarningLimit=600
- /.size-limit.json — 7 budgets: entry 240 KB, vendor-recharts 170 KB, vendor-motion 50 KB, exceljs 270 KB, jspdf 140 KB, html2canvas 55 KB, CSS 80 KB
- dist/ pós-build: 224 chunks JS, CSS único de 169.11 kB (25.42 kB gz), dist total 26 MB (inclui sourcemaps 'hidden')
- Maiores chunks (raw/gzip): exceljs 931.81/256.33 kB · index 779.13/223.26 kB · vendor-recharts 587.13/156.56 kB · jspdf 386.19/123.98 kB · useScanner 340.57/101.00 kB · html2canvas 199.44/45.63 kB · index.es 156.86/51.37 kB · vendor-motion 134.21/42.96 kB
- Primeiro load atual medido: index + vendor-recharts + vendor-motion = 422.78 KB gzip de JS em 3 requests (2 via modulepreload em dist/index.html) + 25.42 KB de CSS
- src/App.tsx + 5 arquivos em src/routes/ — 82 rotas, todas via React.lazy (nenhuma página em import estático)
- src/components/charts/ (22 arquivos) + 31 arquivos importando recharts; 2 consumidores de @tanstack/react-virtual (EstoquePage, AuditLogPage); VirtualList/VirtualGrid sem consumidor
- Libs duplicadas por função: sonner (90 arquivos) + radix toast/useToast (42) montados juntos em AppProviders.tsx:55-56; date-fns + dayjs; @zxing/library + html5-qrcode + jsqr
- public/: nenhuma imagem pesada (maior PNG é 1.5 KB); maior arquivo é public/openapi.json 342 KB, fora do globPatterns do precache
- Polling: apenas 5 refetchInterval (todos 30s) e 24 setInterval — não é fonte relevante de custo de render

### Camada: acessibilidade-mobile

**Cobertura declarada:** Varri as 650 `.tsx` de `src/` (76 páginas, 478 componentes, 70 em features) com dois scanners JSX próprios que parseiam tags abertas com balanceamento de chaves/strings (não só grep de linha única, que erra em JSX multilinha), mais um script de cálculo de contraste WCAG sobre os tokens HSL reais de `src/index.css`. Scripts em `/tmp/claude-0/-home-user-Estoki-V2/dcb40ce0-aa19-5d25-b60c-17289e1e8ddf/scratchpad/a11y.mjs`, `/tmp/claude-0/-home-user-Estoki-V2/dcb40ce0-aa19-5d25-b60c-17289e1e8ddf/scratchpad/labels.mjs` e `/tmp/claude-0/-home-user-Estoki-V2/dcb40ce0-aa19-5d25-b60c-17289e1e8ddf/scratchpad/contrast.mjs`. Li de verdade (não só grep) 22 arquivos: primitivas `ui/button.tsx`, `ui/dialog.tsx`, `ui/table.tsx`, `ui/modal.tsx`, `ui/sidebar.tsx`, `ui/command.tsx`; layout vivo (`layout/AppLayout.tsx`, `organisms/layout/Header.tsx`, `organisms/layout/MobileNavigation.tsx`); páginas roteadas (`Posicoes.tsx`, `Etiquetas.tsx`, `Scanner.tsx`, `InventarioCiclico.tsx`, `customers/CustomersPage.tsx`, `Romaneios.tsx`); componentes de domínio (`FotosLoteObrigatorias.tsx`, `KanbanCard.tsx`, `EstoqueConfigCard.tsx`, `GlobalSearchDialog.tsx`, `MFASettings.tsx`); `src/components/a11y/*`; `tests/e2e/a11y-smoke.spec.ts`; `src/index.css`; `index.html`. Verifiquei para cada achado se o arquivo está VIVO (importado a partir de `AppLayout`/rotas) ou morto, porque `src/components/layout/` e `src/components/organisms/layout/` convivem e o layout real usa o segundo. NÃO EXECUTADO: render em navegador (sem axe-core rodado, sem Playwright — browsers não instalados e a auditoria é somente leitura), portanto estouro de texto em 360px e sobreposição da bottom nav ficam como RASTREADO. Checagens que deram negativo e não geraram achado: `tabIndex` positivo (0 ocorrências), `<table>` sem scroll horizontal (a primitiva `ui/table.tsx:7` já envolve em `overflow-auto`), `<img>` sem alt (1 só, em código morto), `focus-visible` na primitiva Button (presente, `button.tsx:9`), `AlertDialogContent` sem título (0), `lang` e `viewport` no `index.html` (corretos).

Itens inventariados:

- src/components/ui/button.tsx — buttonVariants: size.icon = 'h-10 w-10' (40px); base tem focus-visible:ring-2 (OK)
- src/components/ui/dialog.tsx — DialogContent não exige DialogTitle; botão de fechar tem <span className="sr-only">Close</span> (linha 47)
- src/components/ui/table.tsx — Table envolve <table> em <div className="relative w-full overflow-auto"> (linha 7): scroll horizontal OK por padrão
- src/components/ui/modal.tsx — modal artesanal sem role=dialog/aria-modal/focus trap; 0 imports (código morto)
- src/components/ui/sidebar.tsx — SheetContent sem SheetTitle (linha 186); 0 imports (código morto)
- src/components/ui/command.tsx — CommandDialog usa DialogContent sem DialogTitle (linha 29); VIVO via GlobalSearchDialog
- src/components/layout/AppLayout.tsx — layout real; <main id="main-content" aria-label="Conteúdo principal"> na linha 98; importa Header/Sidebar/MobileNavigation de components/organisms/layout/
- src/components/organisms/layout/MobileNavigation.tsx — bottom nav VIVA: min-h-[48px] min-w-[64px], aria-label, aria-current, env(safe-area-inset-bottom) — é o padrão correto do repo
- src/components/organisms/layout/Header.tsx — header VIVO: aria-label="Abrir menu" + .touch-friendly no botão de menu
- src/components/layout/Header.tsx e src/components/layout/MobileNavigation.tsx — duplicatas MORTAS (AppLayout não importa)
- src/components/a11y/{SkipLinks,FocusTrap,FocusScope,LiveRegion,Announce,VisuallyHidden}.tsx — 6 componentes, 0 imports em todo src/
- src/index.css — tokens: light --muted-foreground 220 10% 46%; dark (.dark, linha 82+) --muted-foreground 220 10% 50%, --card 220 25% 8%, --muted 220 25% 12%; .touch-friendly = min 44px (linha 404)
- src/contexts/ThemeContext.tsx:14 — tema default = 'system' (quem usa SO escuro cai no .dark)
- tests/e2e/a11y-smoke.spec.ts — axe-core em 2 rotas públicas ('/' e '/auth'); comentário no topo declara exclusão de /auth/login por contraste real
- src/pages/Posicoes.tsx, src/pages/InventarioCiclico.tsx, src/pages/Etiquetas.tsx, src/pages/Scanner.tsx — seleção/navegação por <div onClick>
- src/pages/Configuracoes.tsx — agrega EstoqueConfigCard/AlertasConfigCard/PreferenciasCard (todos com Label sem htmlFor)
- src/pages/customers/CustomersPage.tsx — formulário de 8 Inputs só com placeholder
- src/components/security/MFASettings.tsx — DialogContent sem título acessível (linha 219); VIVO via src/pages/Seguranca.tsx
- src/components/data/* e src/components/forms/* — 35 dos 101 botões-ícone sem rótulo concentrados aqui; Lightbox/Gallery/ImageZoom/TreeView/Spotlight/TransferList/RichTextEditor/Stepper/ContextMenu têm 0 imports (biblioteca morta)
- index.html — lang="pt-BR", meta viewport width=device-width (ambos corretos)

### Camada: scripts-operacao

**Cobertura declarada:** Li os 104 arquivos de scripts/ (85 executaveis: 48 .mjs, 26 .cjs, 5 .py, 3 .sh, 1 .ts, 8 .sql) e os 10 workflows de .github/workflows/, cruzando cada script com package.json, scripts/automation.config.json (80 registros) e os workflows. Nada foi executado contra banco, storage ou servico externo: nenhum seed-_.cjs, probe-_.cjs, apply_rls_helper.cjs, npm run db:* ou psql foi rodado. Executei apenas leitura, grep, node scripts/dep-audit.mjs e um POST somente-leitura ao endpoint publico de advisories do npm para validar o resultado do dep-audit. A senha de producao em scripts/apply_rls_helper.cjs:18 foi localizada e NAO esta transcrita em nenhum campo desta resposta. Auditoria de banco e estatica: o MCP supabase-estoki esta com token invalido, entao nao foi possivel confirmar quais SQL de scripts/ ja foram aplicados em producao.

Itens inventariados:

- scripts/ (raiz) - 26 scripts legados .cjs/.ts de banco: 17 seed-_.cjs, 6 probe-_.cjs, check-eventos-triagem.cjs, apply_rls_helper.cjs, test-db-connection.ts. Nenhum chamado por workflow ou package.json; todos registrados como kind=legacy/trigger=manual em scripts/automation.config.json.
- scripts/ (raiz) - 4 .sql avulsos fora de supabase/migrations: create_cadastros_tables.sql, create_cadastros_rls.sql (duplicam a migration 20260520120000), rls-fix-users.sql e rls-fix-profile-update.sql (sem migration equivalente).
- scripts/ (raiz) - guardas usadas pelo CI (qa.yml): rls-audit.mjs, audit-zod.mjs, i18n-check.mjs, i18n-hardcoded-check.mjs, migrations-todo-check.mjs, dep-audit.mjs, qa-report.mjs, check-agents-integrity.mjs. Todas somente-leitura sobre o repo.
- scripts/ci/ - 6 arquivos usados por branch-hygiene-audit.yml (actions-kpi, branch-podaveis, bump-toolchain, sla-code-scanning, install-postgresql-client.sh, workflow-test-support). Nao deletam branch: branch-podaveis.mjs:116 apenas imprime os comandos numa issue.
- scripts/db-audit/ - 11 modulos + 3 .sql usados por db-manifesto.yml; psql-safe.mjs mantem a credencial fora do argv e database-identity.mjs valida o endpoint por fingerprint (database-identity.json).
- scripts/inventario/ - 4 geradores usados por inventario-estado.yml; gerar-banco.mjs:33,244-246,276 pina o projeto oficial e usa o endpoint /database/query/read-only da Management API.
- scripts/supabase_snapshot/ - snapshot.py (107KB) usado por contexto.yml com o secret SUPABASE_DB_URL; impoe SET default_transaction_read_only = on (snapshot.py:900).
- scripts/regras_negocio/ - generate.py, indice.py e test_generate.py usados por contexto.yml; publish.sh declaradamente nao usado neste repo (README.md:21) mas registrado como comando manual.
- scripts/automation.mjs + automation.config.json + maintenance/ + ai-context/ + lib/ - tooling de automacao local; automation-local.yml roda apenas doctor --static e test.
- 19 arquivos de teste (_.unit.mjs, *.test.mjs, test_*.py) dentro de scripts/, executados por contexto.yml, automation-local.yml e os alvos test:_ do package.json.

### Camada: modulos-nao-cobertos (src/plugins, src/m

**Cobertura declarada:** Li os 10 diretorios da camada arquivo por arquivo (nao so grep): 4 arquivos em src/plugins, 1 em src/middleware, 4 em src/guards, 5 em src/hoc, 10 em src/config, 5 em src/constants, 17 em src/utils, ~100 em src/lib (incluindo schemas/, crud/, transitions/, validations/), 1 em src/docs, 1 em src/test. Para cada um verifiquei consumidores por caminho de import exato (nao por nome de simbolo, que da falso positivo em palavras comuns como env/validate/trackEvent) e, nos casos decisivos, rodei `npm run build` com envs placeholder e inspecionei o bundle minificado em dist/assets/ para ver o que sobra em producao. Achados criticos foram confirmados no bundle (EXECUTADO), nao inferidos. Resultado principal: a camada de observabilidade (logger + handler global de erro + analytics + web vitals) compila para no-op em producao, e 68 dos arquivos da camada (~3.246 linhas) nao tem nenhum consumidor — incluindo tres diretorios 100% mortos. Nao consegui verificar as variaveis de ambiente definidas no painel da Vercel nem o estado real do Sentry em producao: isso fica marcado como hipotese onde depende disso.

Itens inventariados:

- src/utils/logger.ts (68 linhas) — logger usado por 55 arquivos da aplicacao (auth, services, hooks, config). INTEGRADO, mas no-op em producao (achado 1).
- src/lib/logger.ts (186 linhas) — segundo logger, bem melhor (mascara PII, JSON estruturado, correlation id, child loggers, createLogger). ZERO importadores; `createLogger` nao aparece em nenhum arquivo fora dele.
- src/config/environment.ts (127 linhas) — envConfig a partir de VITE_APP_ENV. Importado por 6 arquivos (analytics, bitrix24-client, feature-flags, error-handler, api-client, utils/logger). VITE_APP_ENV nunca definido fora de .env.example (achado 3).
- src/lib/env.ts (24 linhas) — configuracao de ambiente concorrente (isDev/isProd/mode + VITE_GA_ID). ZERO importadores; divergente de config/environment.ts (achado 9).
- src/config/supabaseEnvAlias.ts (22 linhas) — alias NEXT_PUBLIC__/SUPABASE__ -> VITE_*. Usado por vite.config.ts; tem teste proprio. INTEGRADO e correto.
- src/config/error-handler.ts (202 linhas) — setupGlobalErrorHandler chamado em src/main.tsx:11. INTEGRADO, mas logError vira funcao vazia no bundle (achado 2).
- src/config/analytics.ts (243 linhas) — trackEvent usado por src/hooks/use-export.ts. INTEGRADO na chamada, sem nenhum destino real (achado 4).
- src/config/index.ts (91 linhas) — barrel do config + initializeApp. Unico importador e src/lib/init.ts, que por sua vez tem ZERO importadores: barrel morto por transitividade.
- src/config/api-client.ts (266 linhas) — cliente HTTP com cache/timeout/retry sobre envConfig.apiUrl (vazio). Alcancavel so pelo barrel morto.
- src/config/bitrix24-client.ts (292 linhas) — integracao Bitrix24/Lalamove. Alcancavel so pelo barrel morto; le VITE_BITRIX24_WEBHOOK_URL, que o .env.example nao documenta.
- src/config/feature-flags.tsx (247 linhas) — flags por ambiente + override por percentual/usuario. Alcancavel so pelo barrel morto (achado 8).
- src/config/menu.ts — usado por 1 arquivo. INTEGRADO.
- src/guards/ (AuthGuard, RoleGuard+AdminGuard/SupervisorGuard/OperatorGuard, PermissionGuard+usePermission, index) — DIRETORIO 100% MORTO: nenhum dos nomes aparece fora de src/guards/. A protecao de rota real e src/components/auth/ProtectedRoute.tsx (src/routes/adminRoutes.tsx:4).
- src/hoc/ (withAuth, withLoading+withSkeleton, withErrorHandler, withAnalytics, index) — DIRETORIO 100% MORTO: nenhum nome aparece fora de src/hoc/.
- src/middleware/index.ts (23 linhas) — authMiddleware/adminMiddleware consultando user_roles. DIRETORIO 100% MORTO: nenhum chamador. Logica correta (usa user_roles, nao profiles) e desperdicada.
- src/plugins/ (sdk.ts, registry.ts, example-plugin.ts, **tests**/registry.test.ts) — ESQUELETO: SDK e registry completos, consumidor zero fora do teste (achado 13).
- src/constants/index.ts (75 linhas) — POSICAO_STATUS, TRIAGEM_STATUS, STATUS_COLORS, PAGINATION, TIMING. ZERO importadores do barrel (`from "@/constants"` nao existe no repo).
- src/constants/app.ts (122 linhas) — USER_ROLES, GAMIFICATION, BRAZILIAN_STATES, PAGINATION. ZERO importadores; roles divergem do banco (achado 12).
- src/constants/status.ts (133 linhas) — STATUS_CONFIG. Usado por src/components/ui/status-badge.tsx. INTEGRADO.
- src/constants/api.ts e src/constants/routes.ts — ZERO importadores; API_ENDPOINTS aponta para uma API REST (/auth, /estoque, /health) que nao existe neste produto (o app fala direto com Supabase).
- src/utils/role.ts (21 linhas) — highestRole, alinhado com o enum app_role do banco. Usado por middleware (morto) e por codigo vivo; tem teste. INTEGRADO e correto.
- src/utils/haptics.ts (41 linhas) — vibracao; 15 importadores. INTEGRADO.
- src/utils/formatters.ts (363), src/utils/validators.ts (343), src/utils/money.ts, src/utils/number.ts, src/utils/dateUtils.ts, src/utils/accessibility.ts, src/utils/index.ts — ZERO importadores (achado 11).
- src/utils/date.ts, src/utils/performance.ts, src/utils/parseNFXML.ts, src/utils/dashboardExport.ts, src/utils/exportExcel.ts — INTEGRADOS (1 a 3 importadores cada).
- src/lib/utils.ts (cn) — 259 importadores. INTEGRADO, o modulo mais usado do repo.
- src/lib/sentry.ts — initSentry chamado em src/main.tsx:12; remove PII em beforeSend. INTEGRADO (depende de VITE_SENTRY_DSN estar no painel da Vercel, nao verificavel daqui).
- src/lib/web-vitals.ts (241 linhas) — initWebVitals chamado em src/main.tsx:45. INTEGRADO na chamada, destino inexistente (achado 5).
- src/lib/prefetch.ts, src/lib/register-sw.ts, src/lib/circuit-breaker.ts (+ pagina /admin/circuit-breakers), src/lib/ai-invoke.ts, src/lib/exigirLinhaAfetada.ts, src/lib/csvImporter.ts, src/lib/excelImporter.ts, src/lib/crud/, src/lib/transitions/, src/lib/validations/, src/lib/statusColors.ts, src/lib/storage.ts, src/lib/schemas/* (maioria) — INTEGRADOS.
- src/lib/state-machines.ts (142 linhas) — maquina de estados de 7 entidades WMS, correta e tipada pelos enums do banco. ZERO consumidores (achado 7).
- src/lib/sanitize.ts (135 linhas, 9 exports, DOMPurify) — ZERO consumidores (achado 10).
- 20 arquivos stub de 5 linhas em src/lib/ gerados em lote (`// X library for Estoki WMS` + objeto vazio): arrays, calculators, color, constants, converters, crypto, dates, errors, events, file, helpers, image, numbers, objects, parsers, queue, schemas, strings, types, uuid. Todos vazios e sem consumidor (achado 6).
- src/lib/featureFlags.ts (158), src/lib/api.ts, src/lib/masks.ts, src/lib/pdf.ts, src/lib/print.ts, src/lib/retry.ts, src/lib/rateLimit.ts, src/lib/rateLimiter.ts, src/lib/offlineQueue.ts, src/lib/encryption.ts, src/lib/healthcheck.ts, src/lib/security.ts, src/lib/validators.ts, src/lib/validation.ts, src/lib/websocket.ts, src/lib/serviceWorker.ts, src/lib/webVitals.ts, src/lib/performance.ts, src/lib/a11y.ts, src/lib/analytics.ts, src/lib/supabase.ts, src/lib/init.ts, src/lib/index.ts — ZERO consumidores (achados 4, 6, 10, 11).
- src/docs/REPORTE_AUDITORIA_ENTERPRISE.md (91 linhas) — relatorio dentro de src/ (nao e codigo, nao entra no build). Afirma 'CERTIFICACAO 10/10' e '229 testes automatizados'; a suite real tem 68 testes em 21 arquivos. Documento enganoso, mas inerte.
- src/test/setup.tsx — setup do Vitest (mocks de framer-motion, matchMedia, getClientRects do ProseMirror). INTEGRADO e com comentarios que explicam o porque de cada stub.

### Camada: features-secundarias (gamificação, dashb

**Cobertura declarada:** Li de ponta a ponta as 3 features: gamificação (página `src/pages/Gamificacao.tsx`, 11 componentes em `src/components/gamificacao/`, hooks `useGamificacao`/`useConquistas`/`useDesafiosDiarios`/`useStreaks`/`useRanking`, função `gerar-desafios-diarios`, RPCs `adicionar_xp`/`descontar_pontos`/`collect_challenge_reward`/`registrar_checkin_diario` nas migrations), dashboards (`src/features/dashboard/` completo + `src/pages/Dashboard.tsx` + `src/components/dashboard/`, `src/features/analytics/` com 5 páginas e 8 hooks, RPCs `get_dashboard_metrics`/`refresh_dashboard_materialized_views`/`incrementar_metrica_dashboard`) e multi-filial (`src/features/multiWarehouse/` + migration `20261122100000_WMS38`). Rotas conferidas em `src/routes/*.tsx` e `src/App.tsx`; entradas de menu em `src/components/layout/sidebar/sidebarNavData.ts`. Auditoria de banco é ESTÁTICA (migrations), porque o MCP `supabase-estoki` está com token inválido — nenhuma policy/grant foi conferida em produção, e isso está dito em cada achado que depende disso. Executei: `npx eslint src/features/dashboard/hooks/useDashboard.ts` (3 warnings, inclusive `hoje` não usado) e `npx vitest run src/features/dashboard/hooks/__tests__/useDashboard.test.tsx` (1 teste, passa, sem assert de valor). Veredito: multi-filial é a única integrada com qualidade no lado de leitura (rota, menu, loading/erro/vazio, i18n) mas sem lado de escrita; gamificação está pela metade e com furo de saldo; dashboards estão integrados mas com números fixos e cálculos que não batem com o rótulo.

Itens inventariados:

- src/pages/Gamificacao.tsx (rota /gamificacao, featureRoutes.tsx:179)
- src/components/gamificacao/{GamificacaoLoja,PlacarLideres,DesafiosDiarios,ConquistasSystem,StreakSystem,ConquistaNotificacoes,XPBar,StreakCounter,AchievementBadge,DailyChallenge,StreakIndicator}.tsx + placar/
- src/hooks/{useGamificacao,useConquistas,useDesafiosDiarios,useStreaks,useRanking,useABCAnalysis}.ts
- src/services/gamificacaoService.ts
- supabase/functions/gerar-desafios-diarios/index.ts
- supabase/functions/abc-analysis/index.ts
- supabase/functions/calculate-kpis/index.ts
- supabase/migrations/20251220110629 (tabelas XP/desafios/streaks + RLS)
- supabase/migrations/20251220123220 (trigger_atualizar_desafios + seed de desafios)
- supabase/migrations/20260317223432 (drop das policies de UPDATE/INSERT de gamificação)
- supabase/migrations/20260317223746 (registrar_checkin_diario, collect_challenge_reward)
- supabase/migrations/{20260512175225,20260519174137,20260619145956,20260713105700} (ciclo de GRANT/REVOKE de descontar_pontos e adicionar_xp)
- src/features/dashboard/pages/DashboardPage.tsx (rota /, App.tsx:17)
- src/features/dashboard/hooks/{useDashboard,useAtividadeRecente}.ts + **tests**/useDashboard.test.tsx
- src/features/dashboard/components/{IndexKPIs,IndexQuickStats,IndexOcupacaoCard,IndexHero,IndexOperations,IndexAtividade,SystemHealthMonitor}.tsx
- src/pages/Dashboard.tsx (rota /dashboard, App.tsx:39)
- src/components/dashboard/{DashboardKPIs,DynamicAIInsights}.tsx
- src/utils/dashboardExport.ts
- src/features/analytics/pages/{KPIsPage,RealtimeDashboardPage,ABCAnalysisPage,DemandForecastPage,OperationalMonitorPage}.tsx
- src/features/analytics/hooks/{useKPIsOperacionais/*,useCurvaABC,useDemandForecast,useRealtimeKPIs,useOperationalLive,useKPIAlerts}.ts
- supabase/migrations/20260723162825 (get_dashboard_metrics, refresh_dashboard_materialized_views)
- supabase/migrations/20260512154028 (incrementar_metrica_dashboard)
- src/features/multiWarehouse/{hooks/useMultiWarehouseDashboard.ts,pages/MultiWarehouseDashboardPage.tsx} (rota /dashboard-gerencial)
- supabase/migrations/20261122100000_WMS38_multi_filial_dashboard.sql
- src/components/layout/sidebar/sidebarNavData.ts:94
- supabase/migrations/{20261120185000,20261121110000,20261121120000,20261121130000} (os 4 unicos cron.schedule do repo)

### Camada: multi-tenant

**Cobertura declarada:** Auditoria estatica (MCP do banco com token invalido: nao houve consulta a pg_policies/pg_indexes). Li integralmente as 6 migrations de tenancy (Fase 1 `20260723151620`, revokes `20260726161907`, `20261122132000` trigger, `20261122134000` Fase 2, `20261122141000` Fase 3, `20261122150000` Fase 3b, `20261122220000` handle_new_user) e a de multi-filial (`20261122100000` WMS-38), mais as policies de `user_roles`, `products`, `armazens` e as RPCs `move_stock`/`transferir_estoque`/`get_multi_warehouse_dashboard`. No frontend li `useCurrentTenant.ts`, `middleware/index.ts`, `utils/role.ts`, `locationService.ts`, `useTarefas.ts`, `useMultiWarehouseDashboard.ts`, `featureRoutes.tsx` e o `types.ts` gerado. Cruzei por script as 99 tabelas com `ENABLE ROW LEVEL SECURITY` contra a lista de 72 tabelas da Fase 2 e a lista de 18 exclusoes declaradas. PRIMEIRA CORRECAO AO BRIEFING: `docs/agentes/regras-dominio.md:66-67` esta desatualizado — a Fase 2 NAO esta pendente, ela foi mergeada (#173), com Fase 3 (#174) e Fase 3b (#175) em cima. O problema hoje nao e ausencia de isolamento, e isolamento com quatro furos estruturais (NULL permissivo, service_role, SECURITY DEFINER, role global) que o tornam ineficaz em producao. Multi-filial continua sem nenhum isolamento, nem no banco nem no frontend. 12 achados.

Itens inventariados:

- docs/agentes/regras-dominio.md (secao Papeis/RBAC e Multi-filial, linhas 61-76)
- ESTADO_ATUAL.md (linhas 48-49, 203-205, 220, 237)
- supabase/migrations/20260723151620_f5a04e04-21b9-449f-858b-d364e3162e33.sql (Fase 1: tenants, tenant_members, is_tenant_member, is_tenant_admin, current_tenant_id, policies, seed default, trigger attach_user_to_default_tenant)
- supabase/migrations/20260726161907_d9e2dad7-6254-4fc2-a1ec-3490475ef55d.sql (REVOKE dos helpers de tenant para anon)
- supabase/migrations/20261122132000_WMS9_fix_tenant_trigger_e_backfill.sql
- supabase/migrations/20261122134000_WMS9_fase2_tenant_isolation.sql (default_tenant_id, effective_tenant_id, lista de 72 tabelas, policy RESTRICTIVE tenant_isolation)
- supabase/migrations/20261122141000_WMS9_fase3_rbac_por_tenant.sql (tenant_id em user_roles, has_role por tenant, sync_member_role_to_user_roles)
- supabase/migrations/20261122150000_WMS9_fase3b_isola_user_roles.sql
- supabase/migrations/20261122220000_WMS9_restaura_trigger_handle_new_user.sql
- supabase/migrations/20261122100000_WMS38_multi_filial_dashboard.sql (warehouse_id nas 4 tabelas + RPC get_multi_warehouse_dashboard)
- supabase/migrations/20260520120000_create_cadastros_tables.sql (categorias, armazens, clientes, serial_numbers e suas policies)
- supabase/migrations/20251216155903_52c599ec-7e02-4b42-9164-1542337d24f0.sql (posicoes_estoque, produtos)
- supabase/migrations/20260531125120_59015d9b-23c6-463b-a314-f807c5b7602c.sql (policies permissivas de user_roles)
- supabase/migrations/20260712222818_625661f5-6323-4a17-936b-8ac9a64ddb27.sql (View own or admin roles)
- supabase/migrations/20260619152035_0550e51e-8155-46a7-a362-b07422016f27.sql (move_stock, log_audit_event)
- supabase/migrations/20260712221346_18c4c09b-cff2-4e08-9ad2-1305266cddc8.sql (transferir_estoque)
- supabase/migrations/20260715150837_a6b3e6c5-6198-4344-be9b-27cfdd9170a6.sql e 20260715150859_a42205e5-9fb6-427d-be59-c270912f0366.sql (grants das RPCs de estoque)
- supabase/migrations/20260619150429_bd079333-b6ad-46bc-90a1-a8292d5abecb.sql (policies de products)
- src/integrations/supabase/types.ts (schema real de 21/11: armazens, produtos, user_roles, locations, tenants, tenant_members)
- src/hooks/useCurrentTenant.ts
- src/hooks/useTarefas.ts
- src/middleware/index.ts
- src/utils/role.ts
- src/services/locationService.ts
- src/services/index.ts
- src/services/movimentacaoService.ts
- src/features/multiWarehouse/hooks/useMultiWarehouseDashboard.ts
- src/features/multiWarehouse/pages/MultiWarehouseDashboardPage.tsx
- src/routes/featureRoutes.tsx (rotas armazens e dashboard-gerencial)
- src/pages/warehouses/WarehousesPage.tsx
- supabase/functions/get-permissions/index.ts
- supabase/functions/check-permission/index.ts
- supabase/config.toml (ausencia de auth hook)

### Camada: docs-vs-realidade

**Cobertura declarada:** Lidos integralmente AGENTS.md (153 linhas), CLAUDE.md, README.md, README_PT.md, ESTADO_ATUAL.md (331 linhas) e os 6 arquivos de docs/agentes/ (646 linhas); lidos parcialmente docs/pendencias/_ordem.md, docs/pendencias/_linha-de-base.md, docs/ROADMAP.md, docs/qa/01-INVENTARIO.md e CONTRIBUTING.md. Cada afirmacao numerica ou de caminho foi confrontada com o artefato real: supabase/config.toml, package.json, vite.config.ts, vitest.config.ts, vercel.json, os 10 arquivos de .github/workflows/, supabase/functions/ (249 diretorios), supabase/migrations/ (178 .sql), scripts/ (12 .mjs + 8 subpastas), src/routes/, src/pages/, .i18n-hardcoded-baseline.json e public/openapi.json. Executei `npm run build` (falha por env) e `npx vite build` com envs dummy (exit 0, 45s) para testar as afirmacoes de build dos READMEs. NAO auditei docs/ARCHITECTURE.md, docs/OBSERVABILIDADE.md/OBSERVABILITY.md, docs/PLANO__.md, docs/SECURITY.md, docs/SOC2_GAP_ANALYSIS.md, docs/PLUGIN_SDK.md, docs/adr/, docs/history/, docs/estado/ nem os demais docs/pendencias/_ individualmente — ficaram fora do escopo de tokens. Os enums de regras-dominio.md nao foram conferidos contra o banco (MCP com token invalido), apenas os caminhos de codigo que ele cita.

Itens inventariados:

- /home/user/Estoki_V2/AGENTS.md — 153 linhas, lido integralmente (fonte canonica declarada; vence docs/ e CONTRIBUTING.md)
- /home/user/Estoki_V2/CLAUDE.md — 1 linha, so `@AGENTS.md`; confere com o esperado por scripts/check-agents-integrity.mjs:83-87
- /home/user/Estoki_V2/README.md — 123 linhas, lido integralmente
- /home/user/Estoki_V2/README_PT.md — 123 linhas, conferido por grep contra os mesmos pontos do README.md (espelho fiel, inclusive nos erros)
- /home/user/Estoki_V2/ESTADO_ATUAL.md — 331 linhas, lido integralmente (auditoria 16/08/2026 + secao 21/11/2026)
- /home/user/Estoki_V2/docs/agentes/banco.md — 131 linhas, lido integralmente
- /home/user/Estoki_V2/docs/agentes/deploy.md — 103 linhas, lido integralmente
- /home/user/Estoki_V2/docs/agentes/edge-functions.md — 118 linhas, lido integralmente (o mais preciso do conjunto)
- /home/user/Estoki_V2/docs/agentes/github-ci.md — 118 linhas, lido integralmente
- /home/user/Estoki_V2/docs/agentes/mapa-repo.md — 67 linhas, lido integralmente (o mais defasado do conjunto)
- /home/user/Estoki_V2/docs/agentes/regras-dominio.md — 109 linhas, lido integralmente; enums NAO conferidos contra o banco (MCP com token invalido), so os caminhos de codigo
- /home/user/Estoki_V2/docs/pendencias/_ordem.md — lido (backlog Fase 1, 2026-11-20)
- /home/user/Estoki_V2/docs/pendencias/_linha-de-base.md — primeiras 50 linhas (metricas de base 2026-11-20)
- /home/user/Estoki_V2/docs/ROADMAP.md — primeiras 40 linhas; confirmado vencido (planeja Q1-Q4 de 2025), como AGENTS.md:123 e regras-dominio.md:102 ja avisam
- /home/user/Estoki_V2/docs/qa/01-INVENTARIO.md — primeiras 30 linhas; e saida da propria serie de auditoria 22-23/11/2026, nao fonte independente; repete "Vite 5" e "vite.config.ts:40", ambos errados
- /home/user/Estoki_V2/CONTRIBUTING.md — trechos :18-25 e :58-66, conferidos contra as citacoes de github-ci.md:18 e edge-functions.md:89
- /home/user/Estoki_V2/supabase/config.toml — 7 linhas, lido integralmente
- /home/user/Estoki_V2/package.json — scripts (:6-68) e dependencias relevantes (:152, :217-221) lidos
- /home/user/Estoki_V2/vite.config.ts — :38-70 e :180-232 lidos; grep de manualChunks/forwardRef/port
- /home/user/Estoki_V2/vitest.config.ts — 50 linhas, lido integralmente
- /home/user/Estoki_V2/vercel.json — 7 linhas, lido integralmente
- /home/user/Estoki_V2/.github/workflows/qa.yml — steps :1-140 (ids e continue-on-error) + gate :176-190
- /home/user/Estoki_V2/.github/workflows/ — os 10 arquivos listados; node-version e steps de install conferidos por grep
- /home/user/Estoki_V2/scripts/check-agents-integrity.mjs — cabecalho e constantes (:3-39) lidos; conjunto vigiado confere com AGENTS.md:150-153
- /home/user/Estoki_V2/scripts/apply_rls_helper.cjs — NAO lido por conter senha de producao (AGENTS.md:26-27); leitura bloqueada pelo classificador e nao contornada. Apenas confirmada a existencia (813 B)
- /home/user/Estoki_V2/.i18n-hardcoded-baseline.json, /home/user/Estoki_V2/.env.example, /home/user/Estoki_V2/.mcp.json, /home/user/Estoki_V2/.claude/settings.json, /home/user/Estoki_V2/postcss.config.js, /home/user/Estoki_V2/Dockerfile — lidos ou conferidos por grep
- contagens EXECUTADAS: supabase/functions 249 dirs / 247 index.ts; supabase/migrations 178 .sql; src/pages 76 .tsx (42 raiz, 14 subpastas); src/components 520; src/hooks 288; src/services 24 _Service.ts; src/routes 82 path= (+4 em App.tsx); scripts 12 .mjs na raiz + 8 subpastas (61 arquivos); 17 seed-_.cjs + 6 probe-*.cjs; 21 arquivos de teste em src; public/openapi.json 248 paths (OpenAPI 3.1.0)
- comandos EXECUTADOS: `npm run build` -> exit 1 (guard de env do Supabase); `VITE_SUPABASE_URL=... VITE_SUPABASE_ANON_KEY=... npx vite build` -> exit 0, 45.12s. Nenhuma escrita em banco, storage ou servico externo; nenhum arquivo do repo alterado; nenhum script seed-_/probe-_/db:* executado

### Lacunas da jornada: Recebimento e conferencia

- Não executei nenhum SQL nem request REST contra o Supabase de produção (ookjbflsnoefnsixrspc) nesta sessão. Policies, constraints e valores de enum foram lidos em supabase/migrations/*.sql e em src/integrations/supabase/types.ts; não consultei pg_policies, pg_constraint nem pg_publication_tables, então a aplicação real dessas migrations em produção é NÃO VERIFICADA. Em particular, o repo não tem ledger de migrations: 'migration existe' não significa 'migration aplicada'.
- Não consegui confirmar se WMS-9 fase 2 (tenant_id, policy RESTRICTIVE tenant_isolation) e WMS-38 (warehouse_id em lotes) estão em produção — src/integrations/supabase/types.ts:1996-2019 não lista tenant_id nem warehouse_id em lotes, o que indica types.ts gerado antes dessas duas migrations, ou migrations não aplicadas. Os cenários R09 e R10 dependem disso e estão marcados como RASTREADO.
- Não rodei a aplicação em navegador (não há sessão/credencial de usuário disponível e a auditoria é somente leitura). Tudo que é comportamento de UI em runtime — toast exibido, redirect efetivo, botão desabilitado, banner visível — foi rastreado no código ou reproduzido por réplica da lógica em Node, não observado na tela. O roteamento é a exceção: foi verificado executando matchRoutes do react-router 7.18.6 com as rotas reais.
- Não verifiquei se existem edge functions de NF-e/recebimento deployadas que façam o trabalho que falta (entrada em estoque, importação transacional). Varri apenas src/ e supabase/migrations/; das 248 funções do repo, 94 estão deployadas, e não conferi quais tocam lotes/nfe_documents.
- Não confirmei se o bucket 'triagem-fotos' usado pelo diálogo de assinatura (src/components/conferencia/AssinaturaConferenciaDialog.tsx:44-56) existe nem quais são suas policies — o componente está morto (sem consumidor), então o ponto é potencial, não ativo.
- Não medi o comportamento do PostgREST para a consulta sem .limit() (src/services/receivingService.ts:10-13): se o projeto tiver db-max-rows configurado, lotes antigos ficariam fora da lista e a conferência por find() falharia para eles. Essa configuração não foi lida.

### Lacunas da jornada: Autenticacao e sessao

- Nao foi possivel consultar o banco de producao: o MCP supabase-estoki citado em AGENTS.md nao esta nesta sessao e o unico MCP de Supabase com leitura (plugin:rls-schema-explorer:supabase) falhou na conexao (ERR_PROXY_TUNNEL). Logo, pg_policies, a existencia real das colunas e dos triggers nao foram verificados no banco - so nos arquivos de migration.
- Nao existe .env no repo (so .env.example), entao nao havia VITE_SUPABASE_ANON_KEY para exercitar a REST API autenticada como anon. As verificacoes HTTP foram feitas apenas contra /functions/v1/* (que respondem sem apikey).
- Se o trigger on_auth_user_created existe hoje em producao e NAO VERIFICADO. A migration supabase/migrations/20261122220000_WMS9_restaura_trigger_handle_new_user.sql:1-13 afirma que ele nao existia e que todo usuario novo nascia sem papel, mas AGENTS.md registra que a aplicacao de DDL e manual e que nao ha ledger neste repo. Consequencia: o cenario A25 (role null) pode estar ativo ou ja corrigido.
- src/integrations/supabase/types.ts esta desatualizado em relacao as migrations WMS-9: user_roles (types.ts:4155-4174) nao tem tenant_id, embora supabase/migrations/20261122141000 adicione a coluna, e effective_tenant_id/default_tenant_id nao aparecem entre as Functions. Nao da para saber daqui se as fases 3 e 3b foram aplicadas - o achado de papel tenant-blind foi avaliado pelo codigo do frontend, que e tenant-blind nos dois cenarios.
- Nao foi exercitado o bypass do passkey ponta a ponta (seria preciso um e-mail real com passkey cadastrada e isso criaria linha em webauthn_challenges e um token de sessao - escrita, fora do escopo somente-leitura). O que esta EXECUTADO e que as duas funcoes respondem a chamador anonimo; a ausencia de verificacao da assinatura esta RASTREADA no codigo (supabase/functions/webauthn-auth-verify/index.ts:60-72).
- O tempo de expiracao do access token (cenario A32) e as configuracoes de rate limit/CAPTCHA do GoTrue ficam no painel do Supabase, nao no repo - nao verificados.
- Qual host serve a producao (Lovable x Vercel) continua NAO VERIFICADO, conforme AGENTS.md. Isso afeta o login com Google, que depende de @lovable.dev/cloud-auth-js com redirect_uri = window.location.origin (src/integrations/lovable/index.ts:13-21): se a producao viva nao for o dominio registrado no broker da Lovable, o botao Google falha - hipotese nao testada.
- Nao foram executados testes de interface para os cenarios de concorrencia (duas abas, duplo clique, rede caindo): nao existe teste E2E de autenticacao em tests/e2e/ e os unicos testes da jornada sao os 3 arquivos/9 testes rodados (Auth.test.tsx, authService.test.ts, role.test.ts), que cobrem render do formulario, chamada do signIn e highestRole - nenhum cobre ProtectedRoute, AuthContext, logout ou MFA.

### Lacunas da jornada: Picking

- Sem acesso ao banco de producao nesta sessao: o MCP `supabase-estoki` nao esta disponivel e o repositorio nao tem `.env` (so `.env.example`), entao nao consegui ler `pg_policies`, `pg_trigger` nem `pg_proc` ao vivo. Tudo que e policy/trigger foi deduzido lendo as 163 migrations em ordem — o achado da RLS do operador (P03) e, por isso, RASTREADO no banco, ainda que o comportamento do service tenha sido EXECUTADO.
- Nao consegui confirmar se as duas migrations mais recentes (20261122100000_WMS38 e 20261122134000_WMS9) estao aplicadas em producao: `src/integrations/supabase/types.ts:3857-3881` nao traz nem `warehouse_id` nem `tenant_id` em `tarefas`, ou seja, ou os types estao desatualizados ou as colunas nao existem no banco. Isso afeta a certeza dos cenarios P28 e P29.
- O teto de linhas do PostgREST do projeto (`db-max-rows`) nao foi medido, entao o ponto em que tarefas pendentes comecam a sumir da lista (P25) e hipotese; o desenho sem filtro e sem limit esta confirmado no codigo.
- Nenhum teste de interface foi executado: nao subi `npm run dev` nem rodei Playwright, logo tudo que depende de render (duplo clique real, duas abas, voz, toasts) foi seguido pelo codigo. As verificacoes EXECUTADO sao probes de unidade sobre `pickingService` rodadas com `npx vitest run --config /tmp/claude-0/-home-user-Estoki-V2/dcb40ce0-aa19-5d25-b60c-17289e1e8ddf/scratchpad/probe/vitest.probe.config.ts` (6 asserts, todos passaram), mais a suite existente `npx vitest run src/features/picking` (3 testes, passaram).
- Nao verifiquei quem cria as tarefas tipo=separacao em producao: `src/hooks/useTarefas.ts:26-36` tem o insert mas nao tem nenhum consumidor na UI (grep sem resultado), e os scripts `scripts/seed-*.cjs` nao podem ser executados nesta auditoria. Ou seja, a origem real da fila de picking continua NAO VERIFICADA.
- Nao confirmei se `picking-confirm` e `picking-optimize` estao entre as 94 edge functions deployadas; como nenhuma e invocada pelo front, isso nao muda os achados, mas impede afirmar se estao expostas publicamente.

### Lacunas da jornada: Triagem/qualidade

- Nao existe `.env` no repo (so `.env.example`), entao nao foi possivel consultar o Postgres nem o PostgREST de producao. Tudo que e estado de banco — policies efetivas em `pg_policies`, colunas reais de `eventos_triagem`, flag `public` do bucket `triagem-fotos` e seus limites — foi inferido das migrations em supabase/migrations/ e de src/integrations/supabase/types.ts, nao medido. As migrations sao aplicadas manualmente neste projeto (AGENTS.md), entao nao esta provado que o estado do banco corresponde aos arquivos.
- Nao rodei a aplicacao nem o Playwright: os achados de navegacao (rota /triagem/:id inexistente) foram confirmados por leitura exaustiva das definicoes de rota, nao por clique real no navegador.
- O comportamento do cronometro com a aba em segundo plano nao foi medido em navegador real; a conclusao vem do mecanismo do codigo (contagem por tique de setInterval em vez de diferenca de relogio).
- Nao ha nenhum teste automatizado cobrindo a jornada: `src/services/__tests__/qualityService.test.ts` (4 testes, rodei e passam) cobre so o service; nao existe teste para useTriagens, useTriagemFotos, useTriagemTimer, amostragemUtils, FormularioTriagem nem TriagemPage. A cobertura configurada nem mede `pages/` e `hooks/` (vitest.config.ts:20).
- Nao verifiquei se existe edge function de triagem/qualidade publicada que contorne o bloqueio de UPDATE por RLS — a jornada rastreada fala direto com o PostgREST pelo client do navegador.
- Li por amostragem (grep direcionado) os componentes VolumeContagem.tsx (406 linhas), DashboardTriador.tsx (661 linhas) e TriagemHeaderCard.tsx; pode haver validacao ou divergencia adicional nos trechos nao lidos integralmente.

### Lacunas da jornada: Inventario e ajustes

- Nao consultei o banco de producao: o repo nao tem .env (so .env.example), logo nao ha VITE_SUPABASE_URL/ANON_KEY para request REST, e o MCP de leitura do projeto oficial (rls-schema-explorer:supabase) falhou ao conectar nesta sessao (ERR_PROXY_TUNNEL). Tudo sobre o estado real de RLS, policies vigentes e existencia de audit_logs ficou em nivel de migration, nao de banco.
- Existencia de public.audit_logs em producao: NAO VERIFICADO. Tres migrations a criam, mas ela nao esta em src/integrations/supabase/types.ts nem na lista de tabelas medidas como existentes, e a aplicacao de DDL neste repo e manual sem ledger. Isso decide se C36 e um bug de saldo ou um bloqueio total da aprovacao.
- Se a migration 20261122134000_WMS9_fase2_tenant_isolation.sql esta aplicada: NAO VERIFICADO. Dela depende se o cenario C42 (supervisor de outra filial vendo e aprovando ajuste alheio) e teorico ou real.
- Nenhum cenario foi executado na UI: as rotas /inventario, /ajustes e /inventory nao foram abertas em navegador (exigiria subir o app com credenciais de producao e sessao de cada papel, fora do escopo somente leitura). Todas as marcas EXECUTADO se referem a grep, eslint e reproducao em node da logica pura, nao a clique na tela.
- Comportamento exato do PostgREST em dois pontos ficou por inferencia de contrato, nao por execucao: o erro PGRST116 do .single() com duas linhas (C21) e o retorno sem erro de um UPDATE que a RLS filtrou para zero linhas (C18/C19). Ambos exigiriam Postgres descartavel com as policies carregadas.
- Nao avaliei o impacto a jusante nos consumidores de ajustes_estoque fora da jornada (src/pages/admin/AuditoriaCriticaPage.tsx:200-210 le a tabela), nem se alguma das 94 edge functions deployadas escreve em inventario_contagens ou ajustes_estoque por fora do frontend.

### Lacunas da jornada: Expedicao

- RLS efetiva em produção não foi consultada. Não há .env neste checkout (só .env.example) e o MCP supabase-estoki não está disponível nesta sessão (plugin:rls-schema-explorer:supabase falhou a conectar com ERR_PROXY_TUNNEL), então não consultei pg_policies. Todas as afirmações sobre quem vê/escreve romaneios são RASTREADAS pelas migrations, que são append-only mas podem divergir do banco. Em particular: não confirmei se a policy aberta 'Authenticated users can manage manifests' (USING true) foi realmente substituída pela versão admin/supervisor em produção — se as duas coexistirem, qualquer autenticado escreve em romaneios.
- Não executei nenhum fluxo autenticado na aplicação: sem anon key não há como logar como operador, supervisor ou admin. Os comportamentos de RLS vistos pelo usuário (lista vazia para operador, toast de sucesso sem efeito) são inferidos do código e da semântica do PostgREST, não observados em tela.
- Não disparei carrier-track com payload válido de propósito: a função faz UPDATE em public.shipments (carrier-track/index.ts:75-86) e isso é escrita em produção, fora do escopo somente-leitura. A prova de que ela está pública veio de um POST com body {} que parou na validação Zod antes de qualquer escrita (400). Por isso não medi o conteúdo da resposta simulada em produção nem o estado real da tabela shipments.
- Não verifiquei se CORREIOS_USER/CORREIOS_TOKEN estão configurados como secrets do projeto (exigiria acesso ao painel/supabase secrets). Se estiverem, o caminho real do rastreio funciona e o achado da entrega fabricada vale apenas para o período de indisponibilidade dos Correios; se não estiverem, ele vale sempre. Essa é a diferença entre Crítica permanente e Crítica intermitente.
- Não confirmei qual é a produção viva (Lovable vs Vercel) — AGENTS.md já marca isso como NÃO VERIFICADO. Os probes HTTP que fiz foram no Supabase (ookjbflsnoefnsixrspc), não no front.
- Não contei linhas reais nas tabelas romaneios / romaneio_itens / comprovantes_entrega. Os cenários de 'vazio', '1 registro', 'muitos' e 'no limite' foram avaliados pelo que o código faz em cada caso, não contra o volume real do banco. Em particular, não sei se existem romaneios em produção com status além de 'rascunho' (o que indicaria escrita por fora do app) nem se existem linhas legadas com tenant_id NULL.
- Não rodei npm run lint nem npm run typecheck nesta sessão (os fatos medidos pelo orquestrador dizem exit 0 com 990 warnings e eu os reaproveitei). Rodei apenas npx vitest run src/features/shipping (3 testes, passaram) e um script Node isolado no scratchpad para exercitar o romaneioSchema e a geração do código do romaneio.

### Lacunas da jornada: Produtos e estoque

- Nada foi executado contra o banco de produção (auditoria somente leitura, e o MCP `rls-schema-explorer:supabase` falhou ao conectar com ERR_PROXY_TUNNEL). Logo, as policies e os corpos de função que cito vêm das migrations em supabase/migrations/, que são append-only mas aplicadas à mão (AGENTS.md) — não há garantia de que produção reflita o último arquivo. Em particular: a ausência de policy FOR DELETE em produtos (achado 7) e o ON CONFLICT sem constraint em move_stock/transferir_estoque (achado 2) precisam ser confirmados em pg_policies e pg_proc antes de qualquer correção.
- O ON CONFLICT (posicao_id, lote_id) de move_stock é a divergência de maior impacto e ficou como HIPÓTESE: o fato medido pelo orquestrador diz que move_stock 'existe e funciona', o que seria incompatível com o erro 42P10 que o código das migrations produziria em toda movimentação com destino. Ou existe em produção um índice único em (posicao_id, lote_id) criado fora das migrations, ou a função em produção é outra versão, ou a função nunca foi exercida com destino. Não consegui distinguir sem ler produção.
- Nenhum cenário foi validado em navegador: o Playwright MCP e o app em http://localhost:8080 não foram usados (subir o dev server e navegar foge do escopo somente-leitura combinado, e exigiria credencial de um usuário real de cada papel). Logo, os efeitos de UI que descrevo (toast com texto cru do Postgres, estado vazio no lugar de erro, botão oculto do EmptyState em /estoque) são rastreados pelo código, não observados.
- Comportamento por papel (operador vs supervisor vs admin) não foi exercido com sessão real: não tenho usuário de teste para cada papel e criar um seria escrita. As conclusões sobre o que o operador vê e onde ele é barrado vêm de wmsRoutes.tsx, ProtectedRoute.tsx e das policies nas migrations.
- O comportamento multi-tenant (C52) foi inferido da ausência de coluna de filial em produtos.Row e da policy USING (true). Se a separação por filial existir em outra camada (view, edge function, claim de JWT), não a encontrei no caminho desta jornada.
- Não medi o corpo real de log_audit_event em produção: a conclusão de que entity_id fica nulo vem do encadeamento useProdutos -> useAuditLog.custom -> auditService.log (que não envia p_entity_id) mais a migration 20260513140135, que grava o parâmetro recebido. Se uma versão posterior da função derivar entity_id do metadata, o achado 11 cai.
- Não avaliei o caminho de recebimento/triagem que também pode criar lotes e saldos (fora do escopo desta jornada), então a afirmação 'não existe caminho funcional para dar entrada de saldo' vale para os caminhos listados na jornada (Armazenamento, Endereçamento, EstoqueToolbar); pode haver entrada por edge function ou por outra tela não rastreada aqui.

### Lacunas da jornada: Alertas e reposicao

- Nao consultei o banco de producao: o repo nao tem chave (apenas .env.example com campos vazios) e o MCP `supabase-estoki` nao esta nesta sessao (o MCP de RLS falhou com ERR_PROXY_TUNNEL). Tudo sobre RLS, tenant_id, backfill, existencia das colunas novas de `products` e volume de linhas e leitura estatica das 163 migrations — e, como o AGENTS.md avisa, verde no rls-audit nao prova RLS em producao. Confirmar com `pg_policies` e `information_schema.columns`.
- Nao consigo provar por execucao que o POST sem Authorization em stock-alert/reorder-check e aceito, porque a chamada escreveria em `alertas_historico`/`reorder_suggestions` (proibido nesta auditoria). O que executei foi o preflight: OPTIONS respondeu 200 nas duas (deployadas) e 404 em alert-stock-low e reorder-suggestions. A conclusao de ausencia de autorizacao vem de supabase/config.toml:3-7 + leitura dos handlers.
- NAO VERIFICADO se as migrations 20261121090000/110000/120000 foram aplicadas em producao: o repo nao tem ledger de migrations e o apply e manual. Se nao foram, os jobs `reorder-check-daily` e `stock-alert-daily` nunca existiram e a jornada inteira esta morta por outro motivo. Checar `cron.job`.
- Nenhuma migration executa `CREATE EXTENSION` para pg_cron ou pg_net (a unica mencao a pg_net esta comentada em supabase/migrations/20260522141942_*.sql:7). Se o pg_net estiver em outro schema, `net.http_post` nos crons nao resolve e os jobs falham a cada execucao — sem ninguem olhando, porque nada le `net._http_response`.
- O fuso do `cron.schedule` nao foi verificado: se o banco esta em UTC, '45 6 * * *' roda 03:45 no horario de Brasilia, nao 06:45 como diz o comentario da migration.
- O teto de linhas do PostgREST do projeto (`db-max-rows`) nao foi verificado, entao o corte silencioso das varreduras sem `.limit()` e hipotese quanto ao valor exato, nao quanto a ausencia de paginacao (essa e certa).
- Nao rodei o front (sem .env valido) nem testes para esta jornada: nao existe nenhum teste cobrindo /alertas, stock-alert ou reorder-check (os 21 arquivos de teste nao incluem nenhum deles, e `vitest.config.ts:20` nem mede cobertura de pages/components/hooks). Todos os cenarios de UI sao RASTREADO; executei apenas eslint nos arquivos da jornada (limpo) e uma simulacao em Node da logica de classificacao do stock-alert.

### Lacunas da jornada: Administracao

- Não consultei o banco de produção: não há .env no repo (só .env.example) e nenhum MCP do projeto oficial ookjbflsnoefnsixrspc está conectado nesta sessão (os MCP Supabase disponíveis apontam para outros projetos, que o AGENTS.md proíbe tocar). Tudo que envolve GRANT, RLS e dados reais foi lido nas migrations, que o próprio AGENTS.md diz serem aplicadas manualmente e sem ledger — por isso o achado do REVOKE de log_audit_event está marcado como hipótese.
- Não executei a aplicação nem o fluxo de UI (auditoria é somente leitura; subir o dev server e autenticar como operador/admin exigiria credenciais de produção). Todas as linhas de UI são RASTREADO por leitura de código.
- Não confirmei se profiles tem alguma policy de tenant aplicada diretamente em produção fora das migrations (o cenário A18/A19 depende disso); a verificação é um SELECT em pg_policies WHERE tablename='profiles'.
- Não medi o comportamento real de concorrência (A16, A25): a conclusão vem da constraint UNIQUE declarada na migration da Fase 3 e do padrão SELECT-então-INSERT no código, não de duas sessões disparando ao mesmo tempo.
- Das 248 edge functions, verifiquei por HTTP apenas as 8 citadas nesta jornada (backend-health, metrics e as 6 de integração). Não checei o deploy das 10 funções que o Simulador de Stress dispara, então o volume real de escrita em produção no cenário A44 pode ser menor do que o código sugere.
- Não li AuditoriaEnterpriseViewer, TelemetryCharts, TelemetryTable nem os componentes de /seguranca em profundidade — entraram na matriz apenas pelo ponto de acesso a dados.

### Lacunas da jornada: Recebimento e conferencia

- Sem .env local e sem chave anon (só existe .env.example com placeholder), não fiz nenhum request REST ao projeto ookjbflsnoefnsixrspc. Estado real das policies, existência da coluna tenant_id em trocas_devolucoes e contagem de linhas: NÃO VERIFICADO.
- Não existe ledger de migrations no repo (confirmado em AGENTS.md). Três migrations mexem nas policies de trocas_devolucoes (20251220120926, 20260317222353, 20260317224322) e uma quarta adiciona tenant_id (20261122134000); qual conjunto está aplicado em produção é dedução pela ordem dos nomes de arquivo, não medição.
- Não subi a aplicação (npm run dev) nem usei Playwright: todo o comportamento de UI (abas, diálogos, toasts, duplo clique) é RASTREADO pelo código, não observado em execução. As marcas EXECUTADO cobrem apenas eslint, find/grep e simulações em node da lógica pura de mapeamento de status e de parseInt.
- Não há nenhum teste automatizado da jornada, então não existia asserção prévia para confirmar ou refutar qualquer comportamento. O que afirmo sobre runtime vem de leitura de código.
- Nenhuma edge function referencia trocas_devolucoes (grep em supabase/functions/ = vazio), então não há lado servidor a auditar nesta jornada. Se existir função deployada fora do repo tocando essa tabela, está fora do que consegui ver.
- Não verifiquei na prática o comportamento do PostgREST para UPDATE que casa zero linhas (cenário C29): a conclusão vem do contrato do PostgREST e da ausência de .select() no código, não de uma chamada feita.
