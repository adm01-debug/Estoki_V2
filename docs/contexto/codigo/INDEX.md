# Contexto do projeto para agentes de IA

GERADO AUTOMATICAMENTE por scripts/ai-context/gerar.mjs — não editar à mão; será sobrescrito.
Publicado em `docs/contexto/codigo/` na branch `contexto` (gerada por workflow, nunca abra PR dela) a cada push em `main` e a cada 10 minutos; índice único das três fontes em `docs/contexto/00-INDEX.md`. Gere local com `node scripts/ai-context/gerar.mjs`. Commit-base: `f06b8d0e1bb5c94dec33c44e700797aa1e767385` (2026-11-14T09:13:09-03:00).

## Como usar (leia antes de planejar ou executar qualquer tarefa)
1. **Tela/rota/menu** → `rotas.json` (url/vista/menu → arquivo → hooks → tabelas → edges; `rotas_http_backend` para APIs) e `modulos.json` (módulo inteiro + dependências entre módulos).
2. **Hook/serviço/lógica** → `hooks.json`, `logica.json` (quem usa, o que toca, se tem teste).
3. **Edge function / serverless** → `edge-functions.json` (verify_jwt, tabelas, env, quem chama, órfãs).
4. **Banco** → `banco.json` (colunas, RLS, policies, índices, FKs, triggers, cron jobs, buckets, drift migration×types, uso no código) — visão do código; para o banco vivo use o MCP.
5. **Antes de criar arquivo** → `convencoes.json` (onde ficam as coisas, nomenclatura, alias), `componentes.json` (nomes duplicados, órfãos), `grafo.json` (hubs, ciclos de import) e `grafo-graphify.json` (grafo por AST: comunidades, símbolos mais chamados, comunidade de cada arquivo).
6. **CI/scripts/deploy/env/integrações/permissões/flags** → `ferramentas.json` e `scripts.json`.
7. **Antes de abrir PR** → `testes.json` (o que tem e não tem teste, onde os testes ficam), `baseline.json` (alertas, TODOs, hotspots, últimos commits).
Os JSONs são grandes: filtre com `grep`/`jq` pelo caminho/arquivo/tabela da sua tarefa; não carregue tudo.

## Stack
- linguagens: TypeScript (1575), SQL (172), JavaScript (78), Markdown (37), JSON (24), YAML (10), Python (5), Shell (3)
- linguagem_principal: TypeScript
- framework: React
- backend_http: n/d
- bundler: Vite
- roteador: react-router
- banco: Supabase
- testes: vitest, playwright, cypress
- ui: tailwind, radix/shadcn
- estado: react-query, zustand, jotai
- gerenciador_pacotes: bun
- node: n/d
- python: n/d
- deploy: vercel, docker
- monorepo: n/d
- pastas_fonte: src

## Números
| item | qtd |
|---|---|
| arquivos_total | 1926 |
| arquivos_codigo | 1654 |
| linhas_codigo | 161275 |
| rotas | 86 |
| rotas_http_backend | 11 |
| vistas_por_id | 0 |
| itens_menu | 70 |
| modulos | 124 |
| componentes | 645 |
| hooks | 324 |
| edge_functions | 249 |
| tabelas | 101 |
| migrations | 163 |
| cron_jobs | 0 |
| testes | 84 |
| workflows | 9 |
| scripts | 74 |
| docs_md | 37 |

## Onde ficam as coisas
- telas: src/pages (71), src/features (13), src/components (2)
- componentes: src/components (468), src/pages (93), src/features (67)
- hooks: src/hooks (286), src/features (16), src/components (7)
- servicos_logica: src/lib (107), src/services (25), src/utils (14)
- testes: co-localizado (*.test) (42), co-localizado (__tests__) (17), outro (15)
- edge_functions: supabase/functions
- migrations: supabase/migrations
- scripts: scripts/db-audit (11), scripts/ci (7), scripts/inventario (5)
- docs: docs (9), (raiz) (7)
- nomenclatura: {"componentes":"PascalCase (87%)","hooks":"use + PascalCase","servicos":"camelCase (95%)","edge_functions":"kebab-case (97%)","tabelas":"snake_case (79%)"}
- instruções para agentes no repo: AGENTS.md, CLAUDE.md

## Módulos (menu → domínio)
| módulo | itens de menu | telas/rotas | arquivos | hooks locais | edges | tabelas |
|---|---|---|---|---|---|---|
| components | 0 | 0 | 11 | 53 | 1 | 23 |
| components/a11y | 0 | 0 | 6 | 0 | 0 | 0 |
| components/auth | 0 | 0 | 5 | 1 | 0 | 2 |
| components/charts | 0 | 0 | 24 | 0 | 0 | 0 |
| components/common | 0 | 1 | 31 | 20 | 0 | 9 |
| components/conferencia | 0 | 0 | 6 | 2 | 0 | 1 |
| components/dashboard | 0 | 0 | 12 | 4 | 0 | 9 |
| components/data | 0 | 0 | 20 | 0 | 0 | 0 |
| components/display | 0 | 0 | 14 | 0 | 0 | 0 |
| components/divergencias | 0 | 0 | 5 | 0 | 0 | 0 |
| components/dnd | 0 | 0 | 5 | 0 | 0 | 0 |
| components/etiquetas | 0 | 0 | 5 | 1 | 0 | 0 |
| components/feedback | 0 | 0 | 11 | 0 | 0 | 0 |
| components/forms | 0 | 0 | 46 | 0 | 0 | 0 |
| components/fornecedores | 0 | 0 | 5 | 2 | 0 | 2 |
| components/gamificacao | 0 | 0 | 15 | 7 | 1 | 11 |
| components/ImportExport | 0 | 0 | 6 | 0 | 0 | 1 |
| components/inventario | 0 | 0 | 5 | 3 | 0 | 4 |
| components/kanban | 0 | 0 | 7 | 2 | 0 | 1 |
| components/layout | 1 | 1 | 31 | 50 | 1 | 21 |
| components/maps | 0 | 0 | 5 | 0 | 0 | 0 |
| components/navigation | 0 | 0 | 6 | 0 | 0 | 0 |
| components/ocupacao | 0 | 0 | 5 | 1 | 0 | 1 |
| components/print | 0 | 0 | 6 | 0 | 0 | 0 |
| components/produtividade | 0 | 0 | 5 | 0 | 0 | 0 |
| components/produtos | 0 | 0 | 8 | 7 | 0 | 5 |
| components/security | 0 | 0 | 10 | 9 | 4 | 9 |
| components/trocas | 0 | 0 | 8 | 2 | 0 | 1 |
| components/ui | 0 | 0 | 83 | 17 | 0 | 0 |
| components/wms | 0 | 0 | 18 | 0 | 0 | 0 |
| config | 0 | 0 | 9 | 2 | 0 | 0 |
| constants | 0 | 0 | 5 | 0 | 0 | 0 |
| contexts | 0 | 0 | 7 | 7 | 0 | 5 |
| features/analytics | 4 | 4 | 16 | 50 | 1 | 21 |
| features/dashboard | 0 | 1 | 10 | 12 | 0 | 10 |
| features/inventory | 1 | 1 | 30 | 51 | 1 | 23 |
| features/picking | 1 | 1 | 4 | 49 | 1 | 21 |
| features/quality | 1 | 3 | 25 | 59 | 2 | 28 |
| features/receiving | 3 | 2 | 11 | 52 | 1 | 21 |
| features/shipping | 1 | 1 | 6 | 49 | 1 | 21 |
| hoc | 0 | 0 | 5 | 2 | 0 | 2 |
| hooks | 0 | 0 | 285 | 249 | 7 | 44 |
| lib | 0 | 0 | 68 | 50 | 1 | 22 |
| lib/schemas | 0 | 0 | 32 | 0 | 0 | 0 |
| lib/transitions | 0 | 0 | 5 | 0 | 0 | 0 |
| pages | 40 | 41 | 53 | 75 | 8 | 52 |
| pages/admin | 6 | 11 | 12 | 49 | 1 | 25 |
| pages/auth | 0 | 4 | 6 | 2 | 0 | 2 |
| pages/categories | 1 | 1 | 1 | 2 | 0 | 1 |
| pages/customers | 1 | 2 | 2 | 2 | 0 | 1 |
| pages/help | 1 | 1 | 1 | 49 | 1 | 21 |
| pages/inventory | 1 | 2 | 2 | 50 | 1 | 22 |
| pages/notifications | 1 | 1 | 1 | 50 | 1 | 21 |
| pages/orders | 1 | 2 | 2 | 49 | 1 | 23 |
| pages/profile | 2 | 1 | 1 | 49 | 1 | 21 |
| pages/putaway | 1 | 1 | 1 | 50 | 1 | 21 |
| pages/quality | 1 | 1 | 1 | 50 | 1 | 22 |
| pages/reports | 0 | 0 | 5 | 0 | 0 | 0 |
| pages/serials | 1 | 1 | 1 | 1 | 0 | 1 |
| pages/warehouses | 1 | 2 | 2 | 2 | 0 | 1 |
| routes | 0 | 0 | 5 | 81 | 8 | 60 |
| services | 0 | 0 | 25 | 0 | 0 | 20 |
| types | 0 | 0 | 26 | 0 | 0 | 0 |
| utils | 0 | 0 | 14 | 1 | 0 | 6 |

## Rotas (url → arquivo)
- `/` [tela] → src/components/layout/AppLayout.tsx
- `/` [tela] → src/features/dashboard/pages/DashboardPage.tsx
- `/*` [tela] → src/pages/NotFound.tsx
- `/2fa` [tela] → src/pages/TwoFactorAuth.tsx (protegida)
- `/admin/api` [tela] → src/pages/admin/ApiPortalPage.tsx (protegida)
- `/admin/auditoria` [tela] → src/pages/admin/AuditLogPage.tsx (protegida)
- `/admin/auditoria-critica` [tela] → src/pages/admin/AuditoriaCriticaPage.tsx (protegida)
- `/admin/circuit-breakers` [tela] → src/pages/admin/CircuitBreakersPage.tsx (protegida)
- `/admin/configuracoes` [tela] → src/pages/admin/SettingsPage.tsx (protegida)
- `/admin/integracoes` [tela] → src/pages/admin/IntegrationsPage.tsx (protegida)
- `/admin/roles` [tela] → src/pages/admin/RolesPage.tsx (protegida)
- `/admin/saude-backend` [tela] → src/pages/admin/BackendHealthPage.tsx (protegida)
- `/admin/simulacao` [tela] → src/pages/admin/SimulationPage.tsx (protegida)
- `/admin/telemetria` [tela] → src/pages/admin/AdminTelemetriaPage.tsx (protegida)
- `/admin/usuarios` [tela] → src/pages/admin/UsersPage.tsx (protegida)
- `/ajuda` [tela] → src/pages/help/HelpPage.tsx
- `/ajustes` [tela] → src/pages/AjustesEstoque.tsx
- `/alertas` [tela] → src/pages/AlertasInteligentes.tsx (protegida)
- `/aprovacoes` [tela] → src/pages/AprovacaoMovimentacoes.tsx (protegida)
- `/armazenamento` [tela] → src/pages/Armazenamento.tsx
- `/armazens` [tela] → src/pages/warehouses/WarehousesPage.tsx
- `/armazens/:id` [tela] → src/pages/warehouses/WarehouseDetailPage.tsx
- `/assistente-ia` [tela] → src/pages/AssistenteIA.tsx
- `/auth` [tela] → src/components/common/LoadingFallback.tsx (protegida)
- `/auth/forgot-password` [tela] → src/pages/auth/ForgotPassword.tsx
- `/auth/login` [tela] → src/pages/auth/Login.tsx
- `/auth/reset-password` [tela] → src/pages/auth/ResetPassword.tsx
- `/auth/verify-email` [tela] → src/pages/auth/VerifyEmail.tsx
- `/automacoes` [tela] → src/pages/Automacoes.tsx (protegida)
- `/categorias` [tela] → src/pages/categories/CategoriesPage.tsx
- `/clientes` [tela] → src/pages/customers/CustomersPage.tsx
- `/clientes/:id` [tela] → src/pages/customers/CustomerDetailPage.tsx
- `/conferencia` [tela] → src/features/receiving/pages/ConferenciaRecebimento.tsx
- `/configuracoes` [tela] → src/pages/Configuracoes.tsx
- `/curva-abc` [tela] → src/features/analytics/pages/ABCAnalysisPage.tsx (protegida)
- `/dashboard` [tela] → src/pages/Dashboard.tsx
- `/dashboard-realtime` [tela] → src/features/analytics/pages/RealtimeDashboardPage.tsx
- `/divergencias` [tela] → src/pages/RelatorioDivergencias.tsx (protegida)
- `/enderecamento` [tela] → src/pages/EndereçamentoAutomatico.tsx
- `/estoque` [tela] → src/features/inventory/pages/EstoquePage.tsx
- `/etiquetas` [tela] → src/pages/Etiquetas.tsx
- `/expedicao` [tela] → src/features/shipping/pages/ShippingPage.tsx
- `/formulario-triagem` [tela] → src/features/quality/pages/FormularioTriagem.tsx
- `/fornecedores` [tela] → src/pages/RelatorioFornecedores.tsx (protegida)
- `/fornecedores-avancado` [tela] → src/pages/FornecedoresAvancado.tsx (protegida)
- `/gamificacao` [tela] → src/pages/Gamificacao.tsx
- `/governanca` [tela] → src/pages/Governanca.tsx (protegida)
- `/hub` [tela] → src/pages/Hub.tsx
- `/import-export` [tela] → src/pages/ImportExport.tsx
- `/inventario` [tela] → src/pages/InventarioCiclico.tsx (protegida)
- `/inventory` [tela] → src/pages/inventory/InventoryPage.tsx
- `/inventory/movements` [tela] → src/pages/inventory/StockMovementsPage.tsx
- `/kanban` [tela] → src/pages/KanbanPipeline.tsx
- `/kpis-operacionais` [tela] → src/features/analytics/pages/KPIsPage.tsx (protegida)
- `/lotes` [tela] → src/pages/Lotes.tsx
- `/modo-offline` [tela] → src/pages/ModoOffline.tsx
- `/monitor` [tela] → src/pages/DashboardOperacional.tsx
- `/movimentacao` [tela] → src/pages/Movimentacao.tsx
- `/notificacoes` [tela] → src/pages/notifications/NotificationsPage.tsx
- `/ocupacao` [tela] → src/pages/OcupacaoVisual.tsx
- `/ondas` [tela] → src/pages/Ondas.tsx (protegida)
- `/pedidos` [tela] → src/pages/orders/OrdersPage.tsx
- `/pedidos/:id` [tela] → src/pages/orders/OrderDetailPage.tsx
- `/perfil` [tela] → src/pages/profile/ProfilePage.tsx
- `/picking` [tela] → src/features/picking/pages/PickingPage.tsx
- `/posicoes` [tela] → src/pages/Posicoes.tsx (protegida)
- `/previsao-demanda` [tela] → src/features/analytics/pages/DemandForecastPage.tsx (protegida)
- `/produtividade` [tela] → src/pages/Produtividade.tsx (protegida)
- `/produtos` [tela] → src/pages/Produtos.tsx
- `/putaway` [tela] → src/pages/putaway/PutawayPage.tsx
- `/qualidade` [tela] → src/pages/quality/QualityPage.tsx
- `/rastreabilidade` [tela] → src/pages/Rastreabilidade.tsx (protegida)
- `/recebimento` [tela] → src/features/receiving/pages/RecebimentoPage.tsx
- `/relatorios` [tela] → src/pages/Relatorios.tsx (protegida)
- `/relatorios-agendados` [tela] → src/pages/RelatoriosAgendados.tsx (protegida)
- `/romaneios` [tela] → src/pages/Romaneios.tsx
- `/scanner` [tela] → src/pages/Scanner.tsx
- `/seguranca` [tela] → src/pages/Seguranca.tsx (protegida)
- `/seriais` [tela] → src/pages/serials/SerialsPage.tsx
- `/tarefas` [tela] → src/pages/GestaoTarefas.tsx
- `/transportadoras` [tela] → src/pages/IntegracaoTransportadoras.tsx
- `/triador` [tela] → src/features/quality/pages/DashboardTriador.tsx
- `/triagem` [tela] → src/features/quality/pages/TriagemPage.tsx
- `/trocas` [tela] → src/pages/TrocasDevolucoes.tsx (protegida)
- `/trocas-dashboard` [tela] → src/pages/DashboardTrocas.tsx (protegida)
- `/unauthorized` [tela] → src/pages/Unauthorized.tsx (protegida)

## Rotas HTTP de backend
- `GET /{t}` → scripts/ai-context/cenarios.mjs
- `GET /a` → scripts/ai-context/cenarios.mjs
- `GET /a` → scripts/ai-context/cenarios.mjs
- `POST /b` → scripts/ai-context/cenarios.mjs
- `POST /b` → scripts/ai-context/cenarios.mjs
- `DELETE /c` → scripts/ai-context/cenarios.mjs
- `PUT /d` → scripts/ai-context/cenarios.mjs
- `GET /items` → scripts/ai-context/gerar.unit.mjs
- `GET /u` → scripts/ai-context/cenarios.mjs
- `GET /users` → scripts/ai-context/cenarios.mjs
- `POST /users/:id` → scripts/ai-context/cenarios.mjs

## Vistas por id (menu/ViewRouter → arquivo)
- (nenhum)

## Edge functions
- `abc-analysis` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `adjust-inventory` — tabelas: ajustes_inventario, estoque_posicao; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `agv-dispatch` — tabelas: agv_devices, agv_missions; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `ai-assistant` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `ai-classification` — tabelas: ai_logs; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `ai-classify` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `ai-completion` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `ai-embedding` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `ai-sentiment` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `ai-summarize` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `ai-translate` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `alert-expiration` — tabelas: alerts, location_stock; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `alert-monitor` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `alert-pending-orders` — tabelas: alerts, orders; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `alert-productivity` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `alert-quality` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `alert-sla-breach` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `alert-stock-low` — tabelas: alerts, products; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `alerta-divergencia-fornecedor` — tabelas: alertas_historico, lotes, notificacoes; chamada por 1 arquivo(s) do front
- `analytics` — tabelas: analytics_events; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `audit-log` — tabelas: audit_log; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-2fa-setup` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-2fa-verify` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-change-password` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-login` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-logout` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-refresh-token` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-register` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-reset-password` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-session-list` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-session-revoke` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-social-login` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `auth-verify-email` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `backend-health` — tabelas: alertas_historico, audit_log, query_telemetry, user_roles; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `backup-database` — tabelas: backups; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `batch-import` — tabelas: categories, import_logs, locations, products, receiving_documents, receiving_items, suppliers, units_of_measure; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `batch-processor` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `boleto-generate` — tabelas: boletos; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `broadcast-event` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `bulk-delete` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `bulk-insert` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `bulk-update` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `bulk-upsert` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `cache` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `cache-invalidate` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `calculate-kpis` — tabelas: eventos_triagem, metricas_operacionais, posicoes_estoque; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `calculate-shipping` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `cancel-order` — tabelas: products, sales_orders; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `carrier-book` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `carrier-cancel` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `carrier-label` — tabelas: shipping_labels; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `carrier-quote` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `carrier-quote-correios` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `carrier-quote-jadlog` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `carrier-rates-cache` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `carrier-track` — tabelas: shipments; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `carrier-webhooks` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `check-expiration` — tabelas: lots; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `check-permission` — tabelas: user_roles; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `check-reorder` — tabelas: products; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `cleanup-old-data` — tabelas: alertas_historico, notificacoes; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `cleanup-sessions` — tabelas: cache_entries, cron_logs, temp_files, temp_tokens, user_sessions; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `complete-job` — tabelas: job_queue; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `create-customer` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `create-lot` — tabelas: lots; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `create-payment-intent` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `create-purchase-order` — tabelas: purchase_orders; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `create-sales-order` — tabelas: sales_orders; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `create-shipment` — tabelas: orders, shipments; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `create-subscription` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `cron-daily` — tabelas: cron_logs, sessions; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `cron-weekly` — tabelas: activity_logs, cron_logs, products, profiles; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `cte-import` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `cycle-count` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `danfe-generate` — tabelas: nfe_documents; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `dashboard-stats` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `data-migration` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `db-alert-monitor` — tabelas: user_roles; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `delete-file` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `demand-forecast` — tabelas: rastreamento_historico; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `download-file` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `edi-process` — tabelas: edi_documents; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `expiration-check` — tabelas: -; chamada por 0 arquivo(s) do front
- `export-data` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `export-pdf` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `export-products` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `external-db-bridge` — tabelas: query_telemetry; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-barcode` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-csv` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-excel` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-pdf-report` — tabelas: eventos_triagem, posicoes_estoque, recebimentos; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-pick-list` — tabelas: location_stock, pick_orders; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-putaway-list` — tabelas: locations, putaway_orders; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-report` — tabelas: eventos_triagem, posicoes_estoque; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `generate-sku` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `gerar-desafios-diarios` — tabelas: desafios_diarios; chamada por 1 arquivo(s) do front
- `get-permissions` — tabelas: user_roles; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `health` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `health-check` — tabelas: profiles; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `import-csv` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `import-data` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `import-products` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `integration-accounting` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `integration-amazon` — tabelas: integration_logs; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `integration-correios` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `integration-ecommerce` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `integration-erp` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `integration-ifood` — tabelas: integration_logs; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `integration-marketplace` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `integration-mercado-livre` — tabelas: integration_logs, products; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `integration-rappi` — tabelas: integration_logs; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `integration-sap` — tabelas: integration_logs; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `integration-totvs` — tabelas: integration_logs, products; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `inventory-batch-adjust` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `inventory-count` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `inventory-reconcile` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `inventory-release` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `inventory-reserve` — tabelas: inventory_reservations; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `inventory-snapshot` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `inventory-sync` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `inventory-transfer` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `inventory-valuation` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `invoice-generate` — tabelas: invoices; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `kpi-calculator` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `label-print` — tabelas: locations, products, shipments; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `location-utilization` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `lot-tracking` — tabelas: inventory_lots, lot_movements; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `merge-pdfs` — tabelas: merged_documents; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `metrics` — tabelas: alertas_historico, audit_log, query_telemetry, user_roles; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `migrate-helper` (verify_jwt=false) — tabelas: -; chamada por 0 arquivo(s) do front
- `nfe-cancel` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `nfe-correct` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `nfe-distribution` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `nfe-import` — tabelas: nfe_documents, nfe_items; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `nfe-manifest` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `nfe-process` — tabelas: nfe; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `nfe-validate` — tabelas: nfe_documents; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notification-email` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notification-push` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notification-sms` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notification-whatsapp` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notifications` — tabelas: notifications, profiles; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notify-slack` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `notify-user` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `packing-cancel` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `packing-confirm` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `packing-repack` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `packing-split` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `packing-start` — tabelas: audit_log, orders, packings; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `parse-excel` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `parse-pdf` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `payment-create` — tabelas: payments; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `picking-assign` — tabelas: pick_lists, users; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `picking-batch` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `picking-cancel` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `picking-confirm` — tabelas: orders, pick_list_items, pick_lists, stock_movements; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `picking-optimize` — tabelas: order_items, picking_routes; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `picking-skip` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `picking-split` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `pix-generate` — tabelas: pix_payments; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `previsao-demanda` — tabelas: produtos, rastreamento_historico; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `print-label` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `process-queue` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `process-sales-order` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `push-notification` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `quality-inspection` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `queue-add` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `queue-job` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `queue-process` — tabelas: job_queue; chamada por 0 arquivo(s) do front
- `queue-retry` — tabelas: job_queue; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `rate-limit` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `rate-limiter` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `receive-purchase-order` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `receiving-cancel` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `receiving-confirm` — tabelas: audit_log, receiving_items, receivings; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `receiving-create` — tabelas: audit_log, receiving_items, receivings; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `receiving-inspect` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `receiving-putaway` — tabelas: audit_log, location_stock, locations, receiving_items, receivings, stock_movements; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `receiving-reject` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `register-serial` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `release-stock` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `reorder-check` — tabelas: products, reorder_suggestions; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `reorder-suggestions` — tabelas: products; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-custom` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-daily` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-export-excel` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-export-pdf` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-inventory` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-inventory-accuracy` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-monthly` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-picking-performance` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-receiving` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-shipping` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-supplier-performance` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-turnover` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-valuation` — tabelas: products; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `report-weekly` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `reports` — tabelas: locations, lot_tracking, products, receiving_documents, shipments, stock_balances, stock_movements; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `reserve-stock` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `return-order` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `safety-stock` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `scan-barcode` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `scanner-ocr` — tabelas: -; chamada por 1 arquivo(s) do front
- `schedule-task` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `scheduler-cleanup` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `scheduler-daily-tasks` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `scheduler-reports` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `scheduler-sync` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `search-locations` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `search-orders` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `search-products` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `send-email` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `send-email-alert` — tabelas: -; chamada por 1 arquivo(s) do front
- `send-push` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `send-sms` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `send-whatsapp` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `shipping-cancel` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `shipping-label` — tabelas: orders, shipments; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `shipping-manifest` — tabelas: shipments, shipping_manifests; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `shipping-pod` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `shipping-rate` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `shipping-track-webhook` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `simulation-test` — tabelas: alertas_historico; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `stock-alert` — tabelas: products, stock_alerts; chamada por 0 arquivo(s) do front
- `stock-movement` — tabelas: notifications, products, stock_balances, stock_movements, stock_reservations; chamada por 0 arquivo(s) do front
- `stripe-webhook` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `sync-external-api` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `sync-inventory` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `tests` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `track-shipment` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `transfer-stock` — tabelas: location_stock, stock_transfers; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `upload-file` — tabelas: files; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `upload-image` — tabelas: images; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `upload-multiple` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `validate-data` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `validate-ean` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `warehouse-metrics` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `wave-cancel` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `wave-merge` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `wave-optimize` — tabelas: ondas_separacao, order_items; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `wave-planning` — tabelas: orders, picking_waves; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `wave-release` — tabelas: order_items, orders, pick_list_items, pick_lists, picking_waves; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `wave-split` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `webauthn-auth-options` — tabelas: passkey_credentials, webauthn_challenges; chamada por 1 arquivo(s) do front
- `webauthn-auth-verify` — tabelas: passkey_credentials, webauthn_challenges; chamada por 1 arquivo(s) do front
- `webauthn-register-options` — tabelas: passkey_credentials, webauthn_challenges; chamada por 1 arquivo(s) do front
- `webauthn-register-verify` — tabelas: passkey_credentials, webauthn_challenges; chamada por 1 arquivo(s) do front
- `webhook-handler` — tabelas: alertas_historico; chamada por 0 arquivo(s) do front — **ÓRFÃ**
- `webhook-receiver` — tabelas: -; chamada por 0 arquivo(s) do front — **ÓRFÃ**

## Cron jobs (pg_cron / vercel)
- (nenhum)

## Integrações externas
- SDKs: HTTP (axios), Sentry, Supabase, i18next, react-query, zod
- hosts mais citados: api.openai.com, x.supabase.co, ai.gateway.lovable.dev, api.qrserver.com, api.resend.com, viacep.com.br, agv.local, ai.lovable.dev, api.correios.com.br, api.mercadolibre.com, api.pwnedpasswords.com, api.supabase.com, app.promobrindes.com.br, cart-bloom-connect.lovable.app, compra-vibe-connect.lovable.app
- webhooks recebidos: migrate-helper
- env de integração (só nomes): CORREIOS_TOKEN, LOVABLE_API_KEY, METRICS_TOKEN, OPENAI_API_KEY, RESEND_API_KEY, STRIPE_SECRET_KEY, SUPABASE_AUTH_JWT_SECRET, VITE_BITRIX24_WEBHOOK_URL, VITE_CORREIOS_API_KEY, VITE_SENTRY_DSN, WEBHOOK_SECRET

## Permissões / papéis
- papéis no código: admin (17), user (8), supervisor (7), alert (4), operador (4), group (3), status (3), authenticated (2), button (2), list (2), listitem (2), system (2), application (1), assistant (1), combobox (1), link (1), navigation (1), owner (1), presentation (1), progressbar (1), region (1), separator (1)
- enums de papel: app_role: operador|supervisor|admin
- guards: src/components/auth/ProtectedRoute.tsx, src/components/common/LeaveGuard.tsx, src/guards/AuthGuard.tsx, src/guards/PermissionGuard.tsx, src/guards/RoleGuard.tsx · rotas protegidas: 34 · públicas: /, /, /*, /ajuda, /ajustes, /armazenamento, /armazens, /armazens/:id, /assistente-ia, /auth/forgot-password, /auth/login, /auth/reset-password, /auth/verify-email, /categorias, /clientes, /clientes/:id, /conferencia, /configuracoes, /dashboard, /dashboard-realtime, /enderecamento, /estoque, /etiquetas, /expedicao, /formulario-triagem, /gamificacao, /hub, /import-export, /inventory, /inventory/movements, /kanban, /lotes, /modo-offline, /monitor, /movimentacao, /notificacoes, /ocupacao, /pedidos, /pedidos/:id, /perfil, /picking, /produtos, /putaway, /qualidade, /recebimento, /romaneios, /scanner, /seriais, /tarefas, /transportadoras, /triador, /triagem
- feature flags: ENABLE_GAMIFICATION, ENABLE_OFFLINE_MODE, ENABLE_PWA, novo-inbox

## Alertas (baseline.json → alertas)
- rotas_sem_arquivo: 0
- componentes_ambiguos: 0
- menu_sem_destino: 0
- edges_orfas: 236 — ex.: abc-analysis, adjust-inventory, agv-dispatch
- edges_chamadas_sem_pasta: 0
- tabelas_sem_rls: 0
- tabelas_usadas_sem_definicao: 43 — ex.: activity_logs, ai_logs, ajustes_inventario
- tabelas_com_drift_migration_vs_types: 8 — ex.: armazens, audit_log, categorias
- rpcs_sem_definicao: 5 — ex.: decrease_location_stock, get_inventory_summary, get_min_stock_threshold
- componentes_orfaos: 161 — ex.: src/components/a11y/Announce.tsx, src/components/a11y/FocusScope.tsx, src/components/a11y/FocusTrap.tsx
- componentes_com_nome_duplicado: 52 — ex.: Alert, AvatarGroup, Breadcrumbs
- scripts_orfaos: 0
- env_usadas_nao_declaradas: 4 — ex.: DEV, MODE, PROD
- ciclos_de_import: 2
- possiveis_segredos_no_codigo: 1 — ex.: supabase/functions/health-check/index.test.ts:10

## Grafo de código (graphify)
- não gerado neste run. uvx --from "graphifyy[sql]" graphify update .  (ou: bun run graph:update); saída em graphify-out/ — graph.json e graph.html NÃO são versionados (dezenas de MB); use `graphify query/path/explain` localmente

## Hotspots (arquivos mais alterados, 90 dias)
- package.json (38)
- package-lock.json (36)
- .github/workflows/cd.yml (11)
- .github/workflows/qa.yml (8)
- .github/workflows/ci.yml (6)
- ESTADO_ATUAL.md (4)
- docs/estado/EVIDENCIAS.md (4)
- docs/estado/scripts-autonomos.md (4)
- src/integrations/supabase/types.ts (4)
- src/pages/categories/CategoriesPage.tsx (4)
- src/pages/customers/CustomersPage.tsx (4)
- src/pages/warehouses/WarehousesPage.tsx (4)
- .github/workflows/branch-hygiene-audit.yml (3)
- .github/workflows/contexto.yml (3)
- .github/workflows/db-manifesto.yml (3)

## Workflows
- `automation-local.yml` — Automação local (pull_request, push, workflow_dispatch)
- `branch-hygiene-audit.yml` — Branch Hygiene Audit (schedule, workflow_dispatch; cron 56 7 * * 1)
- `cd.yml` — CD - Deploy Vercel (push, workflow_dispatch)
- `ci.yml` — CI Pipeline (pull_request, push)
- `contexto.yml` — Contexto para agentes de IA (push, schedule, workflow_dispatch; cron 23 */6 * * *)
- `db-manifesto.yml` — Manifesto do banco (catalogo, manifesto e grants) (push, schedule, workflow_dispatch; cron 13 6 * * 1)
- `inventario-estado.yml` — Inventario do estado real (semanal) (schedule, workflow_dispatch; cron 23 10 * * 1)
- `notifica-falha-main.yml` — Notifica falha na main (workflow_run)
- `qa.yml` — QA Checklist (PR) (pull_request)

## Scripts npm
- `dev`: `vite`
- `build`: `vite build`
- `build:dev`: `vite build --mode development`
- `lint`: `eslint .`
- `preview`: `vite preview`
- `test`: `vitest`
- `test:ui`: `vitest --ui`
- `test:coverage`: `vitest run --coverage`
- `test:e2e`: `playwright test`
- `test:e2e:ui`: `playwright test --ui`
- `test:e2e:build`: `PW_TARGET=build VITE_APP_URL=http://localhost:4173 playwright test`
- `type-check`: `npm run typecheck`
- `format`: `prettier --write .`
- `format:check`: `prettier --check .`
- `prepare`: `echo 'skip husky'`
- `test:watch`: `vitest --watch`
- `lint:fix`: `eslint . --fix`
- `typecheck`: `tsc --noEmit`
- `validate`: `npm run lint && npm run typecheck && npm run test`
- `storybook`: `storybook dev -p 6006`
- `build-storybook`: `storybook build`
- `analyze`: `npx vite-bundle-visualizer`
- `analyze:stats`: `ANALYZE=true vite build`
- `size`: `size-limit`
- `qa:rls`: `node scripts/rls-audit.mjs`
- `qa:report`: `node scripts/qa-report.mjs`
- `qa:all`: `npm run lint && npm run typecheck && npm run test:coverage && npm run build && npm run size && npm run qa:rls && npm run audit:deps`
- `coverage:check`: `vitest run --coverage`
- `i18n:check`: `node scripts/i18n-check.mjs`
- `audit:zod`: `node scripts/audit-zod.mjs`
- `clean`: `rm -rf dist node_modules/.cache`
- `db:generate`: `supabase gen types typescript --local > src/integrations/supabase/types.ts`
- `db:migrate`: `supabase db push`
- `db:seed`: `supabase db seed`
- `db:reset`: `supabase db reset`
- `deploy:preview`: `netlify deploy`
- `release`: `semantic-release`
- `i18n:hardcoded`: `node scripts/i18n-hardcoded-check.mjs`
- `audit:deps`: `node scripts/dep-audit.mjs --level=high`
- `audit:deps:prod`: `node scripts/dep-audit.mjs --level=moderate --prod`
- `contexto:ia`: `node scripts/ai-context/gerar.mjs --out docs/contexto/codigo`
- `contexto:ia:test`: `node --test scripts/ai-context/gerar.unit.mjs`
- `contexto:regras`: `python3 scripts/regras_negocio/generate.py --repo . --out docs/contexto/regras --profile regras --schema-snapshot docs/contexto/supabase --index-path docs/contexto/00-INDEX.md --no-pointer`
- `contexto:banco`: `python3 scripts/supabase_snapshot/snapshot.py`
- `inventario:rotas`: `node scripts/inventario/gerar-rotas.mjs`
- `inventario:rotas:check`: `node scripts/inventario/gerar-rotas.mjs --check`
- `inventario:edges`: `node scripts/inventario/gerar-repo.mjs < /dev/null`
- `inventario:banco`: `node scripts/inventario/gerar-banco.mjs`
- `inventario:mudou`: `node scripts/inventario/mudou-conteudo.mjs`
- `maintenance:doctor`: `sh scripts/maintenance/run.sh doctor --root .`
- `maintenance:check`: `sh scripts/maintenance/run.sh check --root . --ref origin/main`
- `maintenance:heal`: `sh scripts/maintenance/run.sh heal --root . --ref origin/main`
- `test:maintenance`: `node --test scripts/maintenance/maintenance.unit.mjs`
- `automation:doctor`: `node scripts/automation.mjs doctor`
- `automation:test`: `node scripts/automation.mjs test`
- `automation:check`: `node scripts/automation.mjs check --ref HEAD`
- `automation:heal`: `node scripts/automation.mjs heal --ref origin/main`
- `automation:nightly`: `node scripts/automation.mjs nightly --ref origin/main`
- `automation:graph`: `node scripts/automation.mjs graph`
- `automation:status`: `node scripts/automation.mjs graph status`
- `automation:install-hooks`: `node scripts/automation.mjs install-hooks`
- `automation:uninstall-hooks`: `node scripts/automation.mjs uninstall-hooks`

## Documentos (raiz e docs/)
- `AGENTS.md` — AGENTS.md — Estoki V2 (154 linhas)
- `CHANGELOG.md` — Changelog (27 linhas)
- `CLAUDE.md` (2 linhas)
- `CONTRIBUTING.md` — Contribuindo com o ESTOKI WMS (76 linhas)
- `ESTADO_ATUAL.md` — ESTADO ATUAL DO SISTEMA — ESTOKI V2 (290 linhas)
- `README.md` — 📦 ESTOKI — Warehouse Management System (124 linhas)
- `README_PT.md` — 📦 ESTOKI — Sistema de Gestão de Armazém (WMS) (124 linhas)
- `docs/ARCHITECTURE.md` — Arquitetura Técnica - ESTOKI (257 linhas)
- `docs/AUTOMACAO_LOCAL.md` — Automação local — Estoki_V2 (151 linhas)
- `docs/OBSERVABILIDADE.md` — 📡 Observabilidade — ESTOKI WMS (190 linhas)
- `docs/OBSERVABILITY.md` — Observabilidade & QA (57 linhas)
- `docs/PLANO_MELHORIAS_2026.md` — 📋 Plano de Melhorias ESTOKI WMS — 2026 (85 linhas)
- `docs/PLUGIN_SDK.md` — ESTOKI Plugin SDK (v0.1 — MVP) (49 linhas)
- `docs/ROADMAP.md` — Roadmap ESTOKI WMS (44 linhas)
- `docs/SECURITY.md` — 🔒 Política de Segurança - ESTOKI (168 linhas)
- `docs/SOC2_GAP_ANALYSIS.md` — SOC 2 Type II — Gap Analysis Formal (ESTOKI WMS) (166 linhas)
- subpastas de docs/: docs/agentes (6), docs/contexto (2), docs/estado (2), docs/history (2), docs/adr (1)
- CHANGELOG topo: [Unreleased]

## Últimos commits
- 2026-11-14 `f06b8d0e` fix: rewrites SPA no vercel.json (rotas retas dão 200 em produção) (#102)
- 2026-11-14 `c7a225c5` fix(e2e): elimina flaky da rota /estoque no firefox (2º child no DialogTrigger) (#103)
- 2026-11-13 `01b00ccd` fix(test): stub getClientRects/getBoundingClientRect de Range/Text no setup do Vitest (#101)
- 2026-11-13 `6d12224e` fix(cadastros): alinha front ao schema real do banco (numero_serial, cpf_cnpj, capacidade_total) (#100)
- 2026-11-13 `abc2b0bd` fix(rls): edição/remoção bloqueada pela RLS não mostra mais "sucesso" (#99)
- 2026-11-13 `901c5da4` fix(build): produção sem Supabase — aceitar as variáveis da integração Vercel (#98)
- 2026-11-13 `659405f5` fix(seriais): a tela consultava a coluna inexistente numero_serial (#97)
- 2026-11-13 `eaed9fed` fix(types): tsc 36 → 0, Tiptap alinhado em 3.31.3 e romaneios (#95)
- 2026-11-13 `6aedeabd` fix(cd): concede permissao contents:write ao job de producao para criar release tag (#94)
- 2026-11-13 `5e2d4509` fix(cd): remove flag --prebuilt que falhava no deploy CLI do Vercel (#93)
- 2026-11-13 `8635a414` infra(cd): migra CD de Lovable para Vercel (deploy via token + smoke do dominio real) (#92)
- 2026-11-13 `ee5bf11d` build(deps): bump actions/download-artifact from 7 to 8 (#74)
- 2026-11-13 `c1e08c2d` build(deps): bump actions/setup-python from 6 to 7 (#73)
- 2026-11-13 `db85b5f0` build(deps): bump peter-evans/create-pull-request from 8.1.1 to 8.1.2 (#72)
- 2026-11-13 `cdd2498c` fix(inventario-estado): add-paths vira glob; sem banco.json o literal quebrava (#85)

## Arquivos deste diretório
- `docs/contexto/codigo/rotas.json`
- `docs/contexto/codigo/modulos.json`
- `docs/contexto/codigo/componentes.json`
- `docs/contexto/codigo/hooks.json`
- `docs/contexto/codigo/edge-functions.json`
- `docs/contexto/codigo/banco.json`
- `docs/contexto/codigo/ferramentas.json`
- `docs/contexto/codigo/scripts.json`
- `docs/contexto/codigo/testes.json`
- `docs/contexto/codigo/logica.json`
- `docs/contexto/codigo/grafo.json`
- `docs/contexto/codigo/grafo-arestas.json`
- `docs/contexto/codigo/convencoes.json`
- `docs/contexto/codigo/grafo-graphify.json`
- `docs/contexto/codigo/baseline.json`
- `docs/contexto/codigo/manifest.json` (commit, data, hashes, erros — único arquivo com data/hora)
