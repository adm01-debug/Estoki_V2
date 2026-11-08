# Edge Functions e integrações externas — referência para agentes

Ler antes de criar, alterar ou debugar qualquer função em `supabase/functions/`.

## Panorama

- `supabase/functions/` tem **250 diretórios**: **248 funções** (as que têm `index.ts`) + `_shared/` +
  `tests/`, que só guarda três `*_test.ts` e não é função.
- Maiores grupos por prefixo: `report-*` 14 · `auth-*` 12 · `integration-*` 11 · `inventory-*` 9 ·
  `carrier-*` 9 · `generate-*` 8 · `ai-*` 8 · `picking-*` 7 · `nfe-*` 7 · `create-*` 7 · `alert-*` 7 ·
  `wave-*`/`shipping-*`/`receiving-*` 6 cada. **Não existe prefixo `wms-*`.**
- Há **pares redundantes PT/EN** que fazem a mesma coisa: `demand-forecast`/`previsao-demanda`,
  `expiration-check`/`check-expiration`, `reorder-check`/`check-reorder`, `rate-limit`/`rate-limiter`.
  Antes de criar função nova, procure o par que já existe.
- **Função ≠ função em uso.** `ESTADO_ATUAL.md` mediu, em 16/08/2026, 18 funções com chamador conhecido
  (7,3%) e 52 quebradas (21%); `docs/estado/EVIDENCIAS.md` §3.4 (`:127`) lista 51 delas. Isso é medição
  datada: confirme no código antes de tratar uma função como viva ou morta.

## `config.toml` — tudo que ele declara

```toml
project_id = "ookjbflsnoefnsixrspc"

[functions.migrate-helper]
verify_jwt = false
```

Só isso. Logo: **as outras 248 funções herdam `verify_jwt = true`** (qualquer JWT válido entra; a
plataforma não checa papel), e **`migrate-helper` é pública, sem auth de plataforma** — trate-a como
superfície exposta.

## Padrão canônico (medido sobre os 248 `index.ts`)

| Traço                                                    | Quantas       |
| -------------------------------------------------------- | ------------- |
| importam `../_shared/cors.ts`                            | 239 / 248     |
| importam `_shared/schemas.ts` ou `_shared/validation.ts` | 207 / 248     |
| importam Zod direto de `deno.land`/`esm.sh`              | 11            |
| usam `SUPABASE_SERVICE_ROLE_KEY`                         | **201 / 248** |
| casam `auth.getUser` ou `Authorization` no texto         | **36 / 248**  |
| **leem o header `Authorization` da requisição**          | **21 / 248**  |

Referência mais completa: `supabase/functions/auth-login/index.ts:1-43`. A sequência é:

1. `serve()` de `https://deno.land/std@0.168.0/http/server.ts` + `createClient` de
   `https://esm.sh/@supabase/supabase-js@2` — imports por URL; **não há `import_map.json` nem `deno.json`**.
2. Preflight: `if (req.method === "OPTIONS")` devolvendo `getCorsHeaders(req)`.
3. Method guard manual → 405.
4. Rate limit onde é sensível: `rateLimit(req, { key, ...RateLimitPresets.auth })`.
5. `await req.json()` → `validateInput(XSchema, body)` → 400 com `{ error, details }`.
6. Cliente Supabase criado **por request**.
7. `try/catch` devolvendo `{ error: error.message }`.

**Risco estrutural a respeitar:** autenticação de usuário é a exceção (35/248), enquanto service_role —
que **bypassa RLS** — é a regra (201/248). Em `supabase/functions/adjust-inventory/index.ts:22-24` a
checagem de usuário está **comentada** e a função grava em `estoque_posicao`/`ajustes_inventario` com
service_role. Ao tocar numa função que usa service_role, confira se existe guard de papel/tenant no
corpo; se não existir, não piore — e registre na PR.

`_shared/cors.ts` tem allowlist estática de 5 origens (`cors.ts:9-15`) e, para origem desconhecida,
devolve `ALLOWED_ORIGINS[0]` em vez de recusar (`cors.ts:20`).

## `_shared/` — 13 módulos + 7 testes (20 arquivos)

| Arquivo               | Exporta                                                                                                                                                |
| --------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `cors.ts`             | `getCorsHeaders(req)`, `handleCors(req)`                                                                                                               |
| `schemas.ts` (≈27 KB) | catálogo Zod (`LoginSchema`, `RegisterSchema`, `InventoryAdjustSchema`, `CarrierQuoteRequestSchema`, `NfeImportSchema`…) + `validateInput()`           |
| `validation.ts`       | `methodGuard`, `errorResponse`, `successResponse`, `parseJsonBody`, `checkRateLimit`                                                                   |
| `rate-limit.ts`       | `rateLimit()`, `rateLimitResponse()`, `RateLimitPresets`                                                                                               |
| `logger.ts`           | `Logger`, `createLogger`, `withLogging`, `redact`, `requestIdFrom`                                                                                     |
| `bulk.ts`             | `getServiceClient()`, `mapWithConcurrency()`, `createBulkHandler()` (concorrência 10)                                                                  |
| `prometheus.ts`       | `PrometheusRegistry`, `PROM_CONTENT_TYPE`, `sanitizeName`, `escapeLabelValue`                                                                          |
| `telemetry.ts`        | `trace(name, fn)`                                                                                                                                      |
| `correios.ts`         | `quote()`, `track()`, `prepostagem()`, `hasCredentials()`, `MissingCredentialsError`                                                                   |
| `erp.ts`              | `erpFetch()` com circuit breaker, `sapLogin`, `sapHeaders`, `totvsHeaders`, `isSimulationMode`, `MissingErpCredentialsError`, `ErpCircuitOpenError`    |
| `forecast.ts`         | `naiveForecast`, `smaForecast`, `sesForecast`, `holtForecast`, `holtWintersAdditive`, `accuracy`, `walkForwardBacktest`, `autoForecast`, `bucketDaily` |
| `tsp.ts`              | `nearestNeighbor`, `twoOpt`, `optimizeRoute`, `routeLength`, `manhattan`, `euclidean`, `locationToPoint`                                               |
| `agv.ts`              | `buildVda5050Order()`, `dispatchOrder()` + tipos VDA 5050 (subset v2.0.0)                                                                              |

Testes Deno ao lado: `agv_test.ts`, `erp_test.ts`, `forecast_test.ts`, `inventory_test.ts`,
`prometheus_test.ts`, `shared_test.ts`, `tsp_test.ts`. **Ficam fora do Vitest** (`vitest.config.ts`
exclui `supabase/**`) e **não rodam em nenhum workflow** — rode à mão com `deno test` ao tocar em
`_shared/`.

## Regras ao escrever função (do `CONTRIBUTING.md:60-63`)

- Um `index.ts` por função, sem subpastas.
- Sempre: CORS + validação Zod do body devolvendo **400** + `try/catch` + log estruturado.
- Segredos só por `Deno.env.get()`. Nunca SQL cru vindo do cliente.
- Função sensível usa `_shared/rate-limit.ts`.
- Log: JSON de uma linha via `_shared/logger.ts` + `withLogging("<nome-da-fn>", handler)`; campos
  `ts level msg fn requestId duration_ms status`; `redact()` mascara
  `pass|token|secret|apikey|authorization|cookie|cpf|cnpj`; resposta sempre com `x-request-id`.

## Superfícies que exigem cuidado extra

- **`/functions/v1/metrics` nunca é público:** exige `Bearer METRICS_TOKEN` **ou** JWT de `admin`, senão
  401; cardinalidade capada em 20 séries por operação. **15** famílias `estoki_*`.
- **`external-db-bridge`** tem contrato fixo (`docs/ARCHITECTURE.md:198-230`): `POST` com
  `{action: emit_telemetry|query_telemetry|cleanup_telemetry, payload}`; resposta
  `{success, severity: normal|slow|very_slow|error, persisted}`; 400 payload/ação inválida, 401 JWT,
  403 RLS, 500 interno.
- **RPC que a função chama pode não existir.** `ESTADO_ATUAL.md:77-80` lista 5 de 8 RPCs chamadas por
  edge functions como inexistentes (`decrease_location_stock`, `get_inventory_summary`,
  `get_min_stock_threshold`, `get_reorder_point`, `recalculate_weekly_stats`), quebrando
  `picking-confirm`, `reports`, `stock-alert`, `cron-weekly`, `check-reorder`. Da mesma forma, nome de
  tabela usado em edge function **não é fonte de verdade**: 43 tabelas pressupostas pelo backend nunca
  foram declaradas em migration. Confira no banco antes de assumir.
- **Agendamento:** `docs/OBSERVABILIDADE.md:181-183` afirma que `pg_cron`/`pg_net` **não** estão
  habilitados e que o agendamento é externo; `ESTADO_ATUAL.md` mediu **1** job `pg_cron` ativo
  (`update-profile-nome-daily-v3`, `0 9 * * *`). Os dois se contradizem — **NÃO VERIFICADO**; confirme no
  banco antes de criar função que presuma cron.
- **Deploy é manual.** Nenhum workflow faz `supabase functions deploy`. Mudança em função só vale em
  produção depois de publicada à mão — diga na PR se publicou ou não.
