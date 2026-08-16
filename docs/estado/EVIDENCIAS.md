# Evidências — Auditoria de Estado ESTOKI V2

Anexo de [`ESTADO_ATUAL.md`](../../ESTADO_ATUAL.md). Data: 16/08/2026.
Todas as consultas ao banco de produção foram executadas com `read_only:true`. Nada foi alterado.

---

## 1. Dimensão medida do sistema

| Escopo | Linhas | Arquivos |
|---|---:|---:|
| `src/` | 115.860 | 1.249 |
| `supabase/functions/` | 19.265 | 305 (248 com `index.ts`) |
| `supabase/migrations/` | 9.211 | 163 |
| `scripts/` | ~2.000 | 38 |
| **Total** | **~146.000** | **~1.760** |

Maiores blocos em `src/`: `components/` 46.570 · `pages/` 16.887 · `features/` 16.398 ·
`hooks/` 15.212 · `lib/` 5.109 · `integrations/` 4.689.

---

## 2. Banco de produção — estado verificado

**VERIFICADO** via MCP Supabase (Estoki V2), leitura apenas.

- PostgreSQL 17.6 · 19 MB · schema `public` com **86 tabelas**, 0 views
- Extensões: `pg_cron` 1.6.4, `pg_stat_statements` 1.11, `pg_trgm`, `pgcrypto`, `unaccent`,
  `uuid-ossp`, `supabase_vault`
- **Todas as 86 tabelas têm `relrowsecurity = true`** (RLS habilitado)
- `supabase_migrations.schema_migrations` → **erro `42P01: relation does not exist`**
- `cron.job` → **1 linha**: `jobid=1`, `update-profile-nome-daily-v3`, `0 9 * * *`, `active=true`

### 2.1 Tabelas com zero linhas — 29 de 86 (34%)

`agv_devices` · `agv_missions` · `alertas_config` · `analytics_events` · `comprovantes_entrega` ·
`desafios_usuarios` · `eventos_picking` · `gamificacao_transacoes` · `geo_whitelist` ·
`inventario_config` · `ip_whitelist` · `job_queue` · `login_attempts` · `lot_movements` ·
`passkey_credentials` · `password_reset_requests` · `pick_orders` · `produtividade_operador` ·
`purchase_orders` · `putaway_orders` · `query_telemetry` · `receiving_items` · `receivings` ·
`recuperacao_materiais` · `regras_ponto_pedido` · `saved_filters` · `setores_checkpoint` ·
`stock_movements` · `streaks_historico` · `user_devices` · `webauthn_challenges`

Leitura de negócio: **recebimento** (`receivings`, `receiving_items`, `purchase_orders`),
**putaway** (`putaway_orders`), **picking** (`pick_orders`, `eventos_picking`), **movimentação de
estoque** (`stock_movements`, `lot_movements`), **fila de jobs** (`job_queue`), **telemetria**
(`analytics_events`, `query_telemetry`) e **autenticação por passkey** (`passkey_credentials`,
`webauthn_challenges`, `user_devices`) nunca registraram uma única linha.

### 2.2 Tabelas com mais dado (top 10)

`rastreamento_historico` 500 · `locations` 384 · `posicoes_estoque` 164 · `posicao_status_log` 76 ·
`tarefas` 66 · `audit_log` 61 · `role_permissions` 60 · `inventario_contagens` 40 ·
`romaneio_itens` 40 · `lotes` 37

⚠️ **NAO_VERIFICADO:** não separei dado semeado de dado operacional. Existem 20 scripts
`scripts/seed-*.cjs` (`seed-triagens`, `seed-conferencia`, `seed-expedicao`, `seed-qualidade`,
`seed-curva-abc`, `seed-inventario-geral`, `seed-putaway`, `seed-trocas`, `seed-aprovacoes`,
`seed-kpis`, `seed-cadastros`…). Volumes redondos (500, 40, 30, 25) sugerem seed, mas não confirmei.

### 2.3 Tabelas vivas sem nenhum consumidor — 10 de 86

Nenhuma referência em `src/` nem em `supabase/functions/`:
`db_health_snapshots` · `inventario_config` · `ip_whitelist` · `login_attempts` ·
`produtividade_operador` · `quality_inspections` · `recuperacao_materiais` · `regras_ponto_pedido` ·
`setores_checkpoint` · `tenants`

---

## 3. Edge Functions — o achado central

### 3.1 Distribuição por tamanho (248 arquivos `index.ts`)

| Faixa | Funções |
|---|---:|
| < 30 linhas | 114 |
| 30–59 | 52 |
| 60–119 | 54 |
| 120–299 | 25 |
| ≥ 300 | 3 |

⚠️ **Tamanho pequeno NÃO implica função vazia.** Verifiquei: `reorder-check/index.ts` tem lógica de
negócio completa (busca produtos abaixo do ponto de reposição, calcula quantidade sugerida com
lead time e estoque de segurança, persiste). Ver seção 7 (correção).

### 3.2 Funções com chamador comprovado — 8 de 248 (3,2%)

Via `supabase.functions.invoke(...)` em `src/`:
`gerar-desafios-diarios` · `scanner-ocr` · `send-email-alert` · `webauthn-auth-options` ·
`webauthn-auth-verify` · `webauthn-register-options` · `webauthn-register-verify`

Via `fetch`: `src/pages/admin/SimulationPage.tsx:65` monta
`${SUPABASE_URL}/functions/v1/${s.fn}` — chamada dinâmica a partir de uma lista de simulação.

**Critério e seu limite:** busquei `functions.invoke(` e `functions/v1`. Um nome montado
dinamicamente em runtime escaparia. A chamada em `SimulationPage.tsx` é justamente desse tipo, e eu
a encontrei — mas não posso garantir que não haja outras. Trate 8 como piso, não como número exato.

### 3.3 Tabelas referenciadas × tabelas existentes

- Tabelas distintas em `.from("…")` nas Edge Functions: **82**
- Dessas, existentes no banco: **35 (43%)**
- **Inexistentes: 47 (57%)**
- Das 47, declaradas em alguma migration: **4**. **Nunca declaradas em lugar nenhum: 43**

Tabelas que o backend pressupõe e que nunca existiram:
`activity_logs` · `ai_logs` · `ajustes_inventario` · `alerts` · `backups` · `boletos` ·
`cache_entries` · `categories` · `cron_logs` · `edi_documents` · `files` · `images` ·
`integration_logs` · `inventory_reservations` · `invoices` · `location_stock` · `lot_tracking` ·
`lots` · `merged_documents` · `nfe` · `packings` · `payments` · `pick_list_items` · `pick_lists` ·
`picking_routes` · `picking_waves` · `pix_payments` · `receiving_documents` · `reorder_suggestions` ·
`sales_orders` · `sessions` · `shipments` · `shipping_labels` · `shipping_manifests` ·
`stock_alerts` · `stock_balances` · `stock_transfers` · `suppliers` · `temp_files` · `temp_tokens` ·
`units_of_measure` · `user_sessions` · `users`

### 3.4 As 51 funções que tocam tabela inexistente

| Função | Tabela(s) inexistente(s) |
|---|---|
| `adjust-inventory` | ajustes_inventario |
| `ai-classification` | ai_logs |
| `alert-expiration` | alerts, location_stock |
| `alert-pending-orders` | alerts |
| `alert-stock-low` | alerts |
| `backup-database` | backups |
| `batch-import` | categories, import_logs, receiving_documents, suppliers, units_of_measure |
| `boleto-generate` | boletos |
| `cancel-order` | sales_orders |
| `carrier-label` | shipping_labels |
| `carrier-track` | shipments |
| `check-expiration` | lots |
| `cleanup-sessions` | cache_entries, cron_logs, temp_files, temp_tokens, user_sessions |
| `create-lot` | lots |
| `create-sales-order` | sales_orders |
| `create-shipment` | shipments |
| `cron-daily` | cron_logs, sessions |
| `cron-weekly` | activity_logs, cron_logs |
| `edi-process` | edi_documents |
| `generate-pdf-report` | recebimentos |
| `generate-pick-list` | location_stock |
| `integration-amazon` | integration_logs |
| `integration-ifood` | integration_logs |
| `integration-mercado-livre` | integration_logs |
| `integration-rappi` | integration_logs |
| `integration-sap` | integration_logs |
| `integration-totvs` | integration_logs |
| `inventory-reserve` | inventory_reservations |
| `invoice-generate` | invoices |
| `label-print` | shipments |
| `merge-pdfs` | merged_documents |
| `nfe-process` | nfe |
| `notifications` | notifications |
| `packing-start` | packings |
| `payment-create` | payments |
| `picking-assign` | pick_lists, users |
| `picking-confirm` | pick_list_items, pick_lists |
| `picking-optimize` | picking_routes |
| `pix-generate` | pix_payments |
| `receiving-putaway` | location_stock |
| `reorder-check` | reorder_suggestions |
| `reports` | lot_tracking, receiving_documents, shipments, stock_balances |
| `shipping-label` | shipments |
| `shipping-manifest` | shipments, shipping_manifests |
| `stock-alert` | stock_alerts |
| `stock-movement` | notifications, stock_balances, stock_reservations |
| `transfer-stock` | location_stock, stock_transfers |
| `upload-file` | files |
| `upload-image` | images |
| `wave-planning` | picking_waves |
| `wave-release` | pick_list_items, pick_lists, picking_waves |

Fluxos inteiros de WMS estão nessa lista: **expedição** (`create-shipment`, `shipping-label`,
`shipping-manifest`, `carrier-track`, `carrier-label`, `label-print`), **ondas e picking**
(`wave-planning`, `wave-release`, `picking-assign`, `picking-confirm`, `picking-optimize`,
`generate-pick-list`), **financeiro/fiscal** (`invoice-generate`, `payment-create`, `pix-generate`,
`boleto-generate`, `nfe-process`), **integrações** (as 6 `integration-*` gravam todas em
`integration_logs`).

### 3.5 Agendamento

Funções que pressupõem cron: `cron-daily`, `cron-weekly`, `scheduler-daily-tasks`,
`scheduler-reports`, `scheduler-sync`, `scheduler-cleanup`, `alert-monitor`, `db-alert-monitor`,
`alert-expiration`, `alert-pending-orders`, `alert-productivity`, `alert-quality`,
`alert-sla-breach`, `alert-stock-low`, `check-expiration`, `check-reorder`, `cleanup-old-data`,
`cleanup-sessions`, `reorder-check`, `expiration-check`, `report-daily`, `report-weekly`,
`report-monthly`, `inventory-snapshot`.

`cron.job` tem **1 linha**, e não é nenhuma delas. **VERIFICADO.**

⚠️ **NAO_VERIFICADO:** não confirmei se há agendamento externo (GitHub Actions `schedule`, webhook
de terceiro, `supabase/config.toml`). Precisa ser checado antes de concluir abandono.

---

## 4. Frontend — camada bem ancorada

- Tabelas distintas referenciadas em `src/`: **67**
- Existentes no banco: **63 (94%)**
- Inexistentes: **4** → `backups`, `entity_versions`, `feature_flags`, `produtos_estoque`

Contraste direto com as Edge Functions (43% de aderência). É a evidência mais forte de que frontend
e banco evoluíram juntos, e o backend serverless não.

### 4.1 Rotas

- **81 rotas** declaradas em `src/routes/` (`adminRoutes`, `analyticsRoutes`, `featureRoutes`,
  `publicRoutes`, `wmsRoutes`)
- Alvos em `src/pages/`: **69 (85,2%)** · em `src/features/`: **12 (14,8%)**

### 4.2 Páginas órfãs — 3 de 53 na raiz de `src/pages`

| Página | Situação | Prova |
|---|---|---|
| `src/pages/DashboardTempoReal.tsx` | ⬛ morta — substituída | `src/routes/featureRoutes.tsx:30` carrega `@/features/analytics/pages/RealtimeDashboardPage`; a página de mesmo nome em `src/pages` não é importada por ninguém |
| `src/pages/Error.tsx` | ⬛ sem importador | grep do nome em `src/` retorna só ocorrências de `ApiError`/`Error` nativo, nenhum import |
| `src/pages/Maintenance.tsx` | ⬛ sem importador | grep do nome em `src/` retorna **zero** ocorrências fora do próprio arquivo |

**Critério e seu limite:** busquei por `pages/<Nome>` e depois pelo nome puro em todo `src/`, o que
cobre import direto, `lazy(() => import(...))` e re-export por `index.ts`. Não cobre string montada
dinamicamente. Os três casos foram confirmados por busca ampla, não só pelo primeiro padrão.

### 4.3 Páginas em `src/features` não roteadas — 2

`src/features/dashboard/pages/DashboardPage.tsx` · `src/features/analytics/pages/OperationalMonitorPage.tsx`

---

## 5. Testes e CI

### 5.1 Inventário de testes — 23 arquivos para ~146.000 linhas

**14 unitários** (Vitest): `ExportButton.error.test.tsx`, `ExportButton.test.tsx`,
`ProductGrid.test.tsx`, `useDashboard.test.tsx`, `pickingService.test.ts`,
`shippingService.test.ts`, `ProdutosPage.test.tsx`, `Auth.test.tsx`, `registry.test.ts`,
`movimentacaoService.test.ts`, `qualityService.test.ts`, `receivingService.test.ts`,
`stockService.test.ts`, `logger.test.ts`

**9 E2E** (Playwright): `a11y-smoke`, `auth-flow`, `auth-navigation`, `basic-flow`,
`export-reports`, `global-search`, `routes-smoke`, `stress`, `wms-flow`

Todos os 23 possuem ao menos 1 import local — **nenhum é teste-espelho puro** (nenhum reimplementa o
alvo sem importá-lo). `tests/e2e/a11y-smoke.spec.ts` tem 1 `skip`.

⚠️ **NAO_VERIFICADO:** não abri cada teste para conferir se o import é do alvo declarado, se as
asserções são substantivas, ou se há asserção vacuamente verdadeira. Só verifiquei que importam algo
local e contei skips. **Não posso afirmar que os testes passam** — `node_modules` está vazio e
`npm ci` falhou nesta sessão (exit 1).

### 5.2 Gate de cobertura — `vitest.config.ts`

```
linha 20:  include: ["src/services/**", "src/features/**/services/**", "src/lib/**"]
linhas 29-33: thresholds — lines 12, branches 55, functions 25, statements 12
```

Comentário no próprio arquivo (`vitest.config.ts:28`): *"Coverage gate — sobe 5pp por rodada até
70/60/60/70"*. O plano existe; o patamar atual é 12%. E o `include` exclui `src/components`,
`src/pages`, `src/hooks` — **78.000 linhas fora da medição**.

### 5.3 Workflows

| Workflow | Gatilho | Observação |
|---|---|---|
| `.github/workflows/ci.yml` | push + PR em main/master/develop | lint, format, typecheck, test, build + Playwright em matriz `preview`/`build` com `fail-fast: false` |
| `.github/workflows/cd.yml` | push em main + `workflow_dispatch` | build → staging (`staging.estoki.lovable.app`) |
| `.github/workflows/qa.yml` | pull_request | checklist de QA |
| `github/workflows/ci.yml` | ⬛ **nunca executa** | 42 linhas, conteúdo **diferente** do `.github/`. O GitHub só lê `.github/workflows/` |

⚠️ **NAO_VERIFICADO:** a conclusão real desses checks no GitHub. Li o YAML, não o histórico de
execuções. Também não verifiquei se o deploy das 248 Edge Functions está automatizado em algum
workflow.

---

## 6. Documentação × realidade medida

| Afirmação | Onde | Realidade medida | Veredito |
|---|---|---|---|
| "Tabelas ativas em `public`: **76**" | `.qa-report/rls-audit.md` | **86** | ❌ Refutado |
| "Sem RLS habilitado: 0" | `.qa-report/rls-audit.md` | 86/86 com RLS | ✅ Confirmado |
| "10/10 · Nenhum gap crítico ou importante" | `.qa-report/execucao-final-v4.md` | 3 achados 🔴 não listados | ❌ Refutado |
| Roadmap Q1–Q4 **2025** | `docs/ROADMAP.md` | hoje é ago/**2026**; nenhum item reconciliado | ❌ Vencido |
| "certified Elite WMS interface" | `.lovable/plan.md` | não mensurável / contradito pelos achados | ⚠️ Não sustentado |
| "Todas as tabelas têm ao menos uma policy" | `.qa-report/rls-audit.md` | **NAO_VERIFICADO** — não contei policies por tabela | ⚪ Não verificado |

⚠️ Não classifiquei uma a uma as demais afirmações dos 5 relatórios `.qa-report/` nem dos 12
documentos em `docs/`. Foi amostragem.

---

## 7. Correção de achado durante a auditoria

**Afirmação original** (de um agente desta auditoria, interrompido antes de concluir): *"os arquivos
de 29 linhas instanciam um cliente Supabase que nunca é usado e ecoam a entrada de volta"*.

**Refutada.** Abri as duas amostras:
- `supabase/functions/reorder-check/index.ts` — usa o cliente, consulta `products` com join em
  fornecedor, calcula quantidade sugerida (`avgDailySales * leadTime + safetyStock - currentStock`)
  e faz `upsert`. Lógica real.
- `supabase/functions/integration-mercado-livre/index.ts` — chama `https://api.mercadolibre.com` de
  verdade em 7 ações (`get_user`, `list_orders`, `get_order`, `list_items`, `update_stock`,
  `get_shipment`, `sync_products`), com validação de schema via `_shared/schemas.ts`.

**Por que importa:** as duas conclusões levam a ações opostas. "Função vazia" → apagar. "Função com
lógica real gravando em tabela inexistente" → criar a tabela ou reescrever o destino. Se a
afirmação errada tivesse passado adiante, o custo teria sido jogar fora trabalho aproveitável.

---

## 8. Sinais de trabalho inacabado — contados, não classificados

| Marcador | Ocorrências em `src/` |
|---|---:|
| `Math.random(` | **47** |
| `TODO` | 219 |
| `mock` | 221 |
| `placeholder` | 265 |
| `FIXME` | 0 |
| `hardcoded` | 0 |

Distribuição das 47 `Math.random`: `hooks/` 6 · `lib/` 3 · `pages/` 2 · `contexts/` 2 ·
`components/ui/` 2 · `components/feedback/` 2 · `components/charts/` 2 · `services/` 1 ·
`config/` 1 · `components/ondas/` 1 · demais 1 cada em `features/`.

⚠️ **NAO_VERIFICADO:** não abri nenhuma dessas 47 ocorrências. `Math.random` é legítimo para gerar
id, jitter de retry ou animação; é ilegítimo para alimentar métrica ou KPI. **A distinção não foi
feita** — as 2 em `components/charts/` e as 6 em `hooks/` são as que mais merecem inspeção.

---

## 9. Feature flags

`src/config/environment.ts:59-61`:

```
gamification:  import.meta.env.VITE_ENABLE_GAMIFICATION === "true"
pwa:           import.meta.env.VITE_ENABLE_PWA === "true"
offlineMode:   import.meta.env.VITE_ENABLE_OFFLINE_MODE === "true"
```

Comparação estrita com `"true"` → **default é `false` quando a variável não está definida**. Toda
funcionalidade atrás dessas três flags é 🟨, não ✅, em qualquer ambiente que não as declare
explicitamente.

⚠️ **NAO_VERIFICADO:** quais valores estão configurados nos ambientes reais (staging/produção).

---

## 10. Método, limites e integridade

**Como esta auditoria foi executada.** O plano original previa 10 subagentes paralelos, um por
dimensão, com arquivo de saída exclusivo. **Todos os 10 foram interrompidos pelo limite de sessão da
API antes de gravar qualquer arquivo.** Nenhum documento de detalhe por dimensão foi produzido.

Tudo neste anexo foi medido diretamente, após a falha, por análise estática do repositório e
consultas de leitura ao banco de produção. Onde um agente interrompido havia deixado uma afirmação
parcial, ela foi verificada por mim antes de entrar (seção 7) — ou descartada.

**Guard-rails respeitados:**
- Produção somente leitura: todas as queries com `read_only:true`. Zero DDL, DML, migration, deploy.
- Nenhum arquivo pré-existente do repositório foi editado. Criei apenas `ESTADO_ATUAL.md` e este
  anexo. As divergências que encontrei em `.qa-report/` e `docs/` viraram linha de relatório, não
  edição.
- Nenhum resultado de execução foi afirmado: sem `node_modules`, não há como dizer que o código
  compila ou que os testes passam.
- Onde faltou evidência verificável, a classificação **não subiu**.

**Esta auditoria não está pronta.** O inventário funcionalidade-a-funcionalidade de
`src/components` (46.570 linhas), `src/hooks` (15.212) e `src/features` (16.398) **não foi feito**.
Uma auditoria honesta sobre os próprios limites vale mais que uma completa e não confiável.
