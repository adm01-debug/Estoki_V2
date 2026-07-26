# 📡 Observabilidade — ESTOKI WMS

Item **P2 #26** do plano de melhorias. Duas camadas complementares: **logs estruturados**
(diagnóstico por requisição) e **métricas Prometheus** (séries temporais / alertas).

---

## 1. Logs estruturados (`_shared/logger.ts`)

Todo log é uma linha JSON — parseável por Supabase Logs, Loki, Datadog ou CloudWatch sem regex.

```ts
import { withLogging, type Logger } from "../_shared/logger.ts";

const handler = async (req: Request, log: Logger) => {
  log.info("pedido.criado", { order_id: id, itens: items.length });
  return new Response("ok");
};

Deno.serve(withLogging("create-sales-order", handler));
```

Campos emitidos automaticamente:

| Campo | Descrição |
|---|---|
| `ts` | ISO-8601 UTC |
| `level` | `debug` \| `info` \| `warn` \| `error` |
| `msg` | `request.start`, `request.end`, `request.failed` ou evento de domínio |
| `fn` | nome da Edge Function |
| `requestId` | correlação; reaproveita `x-request-id`/`x-correlation-id` de entrada |
| `duration_ms` | latência total (em `request.end` / `request.failed`) |
| `status` | HTTP status da resposta |

**Segurança:** `redact()` mascara chaves que casam com
`pass|token|secret|apikey|authorization|cookie|cpf|cnpj` antes de serializar. A resposta
sempre carrega o header `x-request-id`, permitindo ao suporte cruzar um erro de tela com o log.

### Queries úteis (Supabase Logs Explorer)

```sql
-- p95 de latência por função nas últimas 6h
select json_extract(event_message, '$.fn') as fn,
       approx_quantiles(cast(json_extract(event_message, '$.duration_ms') as int64), 100)[95] as p95_ms
from function_edge_logs
where json_extract(event_message, '$.msg') = '"request.end"'
group by fn order by p95_ms desc;
```

---

## 2. Endpoint Prometheus — `GET /functions/v1/metrics`

Formato: text exposition `v0.0.4`. Renderizado por `_shared/prometheus.ts`
(`PrometheusRegistry`, sem dependências externas; HELP/TYPE emitidos uma vez por família,
labels escapadas, valores não finitos normalizados para `0`).

### Autenticação

1. `Authorization: Bearer <METRICS_TOKEN>` — recomendado para scrapes automatizados
   (comparação em tempo quase-constante). Configure o secret `METRICS_TOKEN` no backend.
2. JWT de usuário com papel `admin` — permite reutilizar o endpoint em dashboards internos.

Sem credencial válida: `401`. O endpoint **nunca** é público — telemetria expõe o formato
operacional do sistema.

### Métricas expostas

| Métrica | Tipo | Labels | Significado |
|---|---|---|---|
| `estoki_queries_total` | gauge | — | Queries na telemetria (24h) |
| `estoki_query_errors_total` | gauge | — | Queries com erro (24h) |
| `estoki_query_duration_ms` | gauge | `quantile=0.5\|0.95\|0.99` | Latência por quantil |
| `estoki_operation_requests_total` | gauge | `operation` | Chamadas por operação (top 20) |
| `estoki_operation_errors_total` | gauge | `operation` | Erros por operação (top 20) |
| `estoki_db_connections_active` / `_total` | gauge | — | Conexões no Postgres |
| `estoki_db_cache_hit_ratio` | gauge | — | Buffer cache hit (0–1) |
| `estoki_db_locks_waiting` | gauge | — | Locks em espera |
| `estoki_db_slow_queries` | gauge | — | Queries lentas detectadas |
| `estoki_db_size_bytes` | gauge | — | Tamanho do banco |
| `estoki_alerts_total` | gauge | `severity` | Alertas por severidade (24h) |
| `estoki_audit_events_total` | gauge | — | Eventos de auditoria (24h) |
| `estoki_metrics_scrape_duration_ms` | gauge | — | Custo do próprio scrape |
| `estoki_metrics_up` | gauge | — | `1` sucesso, `0` falha |

> **Cardinalidade:** a série por operação é limitada às 20 mais frequentes — evita explosão
> de séries no TSDB, que é a causa nº 1 de OOM em Prometheus.

### Scrape config

```yaml
scrape_configs:
  - job_name: estoki-backend
    scrape_interval: 60s
    scheme: https
    metrics_path: /functions/v1/metrics
    static_configs:
      - targets: ["<projeto>.supabase.co"]
    authorization:
      type: Bearer
      credentials_file: /etc/prometheus/estoki_metrics_token
```

### Regras de alerta sugeridas

```yaml
groups:
  - name: estoki
    rules:
      - alert: EstokiMetricsDown
        expr: estoki_metrics_up == 0
        for: 5m
      - alert: EstokiErrorRateAlta
        expr: estoki_query_errors_total / clamp_min(estoki_queries_total, 1) > 0.05
        for: 10m
      - alert: EstokiLatenciaP95Alta
        expr: estoki_query_duration_ms{quantile="0.95"} > 1000
        for: 10m
      - alert: EstokiCacheHitBaixo
        expr: estoki_db_cache_hit_ratio < 0.95
        for: 15m
      - alert: EstokiLocksEmEspera
        expr: estoki_db_locks_waiting > 5
        for: 5m
```

### Dashboard Grafana

Painéis mínimos: latência p50/p95/p99 (timeseries), taxa de erro (stat + threshold 5%),
top operações (bar gauge), conexões e cache hit (gauges), alertas por severidade (pie).
O painel nativo em **`/admin/saude-backend`** continua disponível para quem não roda Grafana.

---

## 3. Testes

`supabase/functions/_shared/prometheus_test.ts` — 5 testes Deno cobrindo sanitização de nomes,
escaping de labels, declaração única de HELP/TYPE, normalização de `NaN` e redação de segredos.

```bash
deno test --allow-all supabase/functions/_shared/prometheus_test.ts
```
