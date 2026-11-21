# AUTO-01 — Produção sem automação agendada (cron.job = 0)

- **Origem:** ESTADO_ATUAL.md 3 (audit: 1 job update-profile-nome-daily-v3; 16/08/2026).
- **Estado real (20/11/2026):** cron.job retorna **0 jobs** em produção. Existem 10+ funções de alerta/rotina deployadas: alert-expiration, alert-monitor, alert-pending-orders, alert-productivity, alert-quality, alert-sla-breach, alert-stock-low, check-expiration, cron-daily, cron-weekly, cleanup-old-data, cleanup-sessions, db-alert-monitor. Nenhuma estava agendada.
- **Diagnóstico (20/11/2026):** a maioria das funções listadas **não está deployada** (ex.: cron-daily, cron-weekly, cleanup-sessions, alert-stock-low, alert-expiration, alert-pending-orders, alert-sla-breach, alert-quality, alert-productivity) e as que estão (expiration-check, alert-monitor) são **stubs** que apenas ecoam o payload. As orquestradoras (cron-daily/cron-weekly) dependem de tabelas/RPCs inexistentes em produção (sessions, cron_logs, activity_logs, lots, get_reorder_point, get_min_stock_threshold, recalculate_weekly_stats) — **não podem ser ligadas sem antes criar essas dependências**.
- **Solução aplicada (20/11/2026):** criado o job `db-health-check` no pg_cron (frequência `@hourly`), que executa a RPC `public.check_db_alert_thresholds(500, 0.05)` com claims `service_role` (via `set_config`). A RPC insere snapshot em `db_health_snapshots` e cria alertas condicionais em `alertas_historico` (WAL > 500MB, rollback ratio > 5%, deadlocks), com deduplicação de 6h — **não destrutivo**.
- **Validação REAL (evidência):** teste em transação ROLLBACK; execução real do scheduler confirmada via `cron.job_run_details` (jobid 4, status succeeded, 2026-11-20 21:39:00); snapshot gravado em `db_health_snapshots` (wal_bytes 83886544, xact_commit 145780); RPC retornou wal_mb 80 < limite 500 com alerts_created []. Pg_cron 1.6.4 com worker ativo (shared_preload_libraries).
- **O que falta para os demais alertas:** criar as tabelas/RPCs ausentes (sessions, cron_logs, activity_logs, lots, get_reorder_point, get_min_stock_threshold, recalculate_weekly_stats) e a edge function `cleanup-old-data` é **destrutiva** (deleta alertas_historico/notificacoes por idade) — exige decisão de negócio sobre retenção antes de ligar.
- **Camadas:** banco (pg_cron), edge functions.
- **Raio de impacto:** nenhum dado existente é alterado; apenas inserções aditivas de monitoramento (1 snapshot/hora).
- **Critério de aceite:** crons documentados e ativos com verificação de execução (job log). ✅ ATIVO E VERIFICADO.
- **Estado:** EXECUTADO (parcial — apenas monitor de saúde; demais dependem de dependências inexistentes ou decisão de negócio).

## Atualização 21/11/2026 — alertas de estoque individuais ativos (EST01 fechado)

- **stock-alert reescrito (PR #147, mergeada 21/11, commit 80e5d4a7):** passa a ler o schema real em produção — `produtos` (PT) + `estoque_posicao.quantidade` (soma em memória) — em vez do `products` (EN) inexistente, e grava em `alertas_historico` (a tabela que a Central de Alertas consome) com enums PT (`estoque_minimo`/`ponto_pedido`, severidade `aviso`/`critico`, status `ativo`).
- **Validação real em produção (deploy confirmado):** execução #1 criou 10 alertas (estoque_minimo/critico, FK produto válida); execução #2 com dedup 0 novas + 10 pending_dup (sem duplicatas); count banco = 10 por fonte stock-alert. RLS select authenticated — visível na UI Central de Alertas.
- **Cron ativo:** `stock-alert` @06:45 (jobid 9) — continua agendado e agora produz alertas consumíveis pela UI.
- **Pendente:** `alertas_config` vazio — thresholds reorder/min_stock por produto ainda não definidos; alertas de validade (`vencimento_proximo`) dependem de blend com `lotes.data_validade` + `quantidade_atual>0`.

## Atualização 21/11/2026 — alerta de validade (vencimento_proximo) ativo

- **alert-expiration reescrito (PR #149, mergeada 21/11, commit b6fac326):** recupera o trabalho de outro agente (escrito contra schema EN inexistente `location_stock`/`alerts`) — agora lê `lotes` (schema PT, inclui `quantidade_atual`) e grava em `alertas_historico` com enums PT (`vencimento_proximo`, severidade `urgente`/`critico`/`aviso`, status `ativo`), dedup por lote+status ativo.
- **Validação real (produção):** lotes reais só vencem em 2027+ (threshold 365 → 0 alertas, correto e sem espúrio); lote de teste com validade em 10 dias → execução criou 1 alerta (severidade critico, FK lote válida), 2ª execução dedup 0 novos/1 pending_dup; caminho do cron validado via `net.http_post` (pg_net) → function → alerta gravado. Dados de teste removidos (0 resíduos).
- **Cron ativo:** `alert-expiration-daily` @07:00 (jobid 10) com `days_threshold:30` — idempotente, migration versionada `20261121130000_AUTO01_alert-expiration-cron.sql`.
- **Pendente:** `alertas_config` vazio — thresholds reorder/min_stock por produto; alertas de estoque máximo/posição ociosa/divergência dependem do fluxo de inventário ser alimentado.
