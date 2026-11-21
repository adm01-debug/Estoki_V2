# _ordem.md — Backlog verificado (Fase 1)

> Gerado em 2026-11-20. Estado real conferido no código (main @ 94df929c) e no banco de produção (ookjbflsnoefnsixrspc), NÃO no que o documento de auditoria afirma.

## Ordem de execução (fundação → dependentes)

### Já resolvidos nesta sessão (não entram no backlog)

- **RLS-audit/CI** — PR #131 mergeada: lint local passou a bater com CI (0 errors; antes 12731 falsos por .vercel/). CI main verde.

### Backlog (gap real, código/banco em produção)

1. **BANCO-01 — 20 edge functions deployadas com .from() para tabela inexistente** — ✔ EXECUTADO (20/11/2026): 20 deploys mortos removidos (100→80), source preservado em supabase/functions/. Ver docs/pendencias/BANCO-01-functions-tabelas-inexistentes.md.
2. **FRONT-01 — 34 páginas órfãs (sem rota)** — ✔ EXECUTADO (20/11/2026): 34/34 removidas com prova (varredura completa de imports no src/ incl. relativos e alias); OperationalMonitorPage excluída da lista por ter consumidor real (/monitor). typecheck+lint+testes+build verdes. Ver docs/pendencias/FRONT-01-paginas-orfas.md. · src/pages/
3. **CICD-01 — Cobertura gate baixo (6/7/5/5)** — ✔ EXECUTADO (20/11/2026): thresholds 6/8/5/6 via medição real (antes 6/7/5/5), PR #135 mergeada, CI 100% verde. Ver docs/pendencias/CICD-01-cobertura-gate.md. · vitest.config.ts
4. **AUTO-01 — cron.job 0 jobs** — ✔ EXECUTADO (21/11/2026): 4 crons ativos em produção — db-health-check (@hourly), reorder-check-daily (06:30), stock-alert-daily (06:45) e alert-expiration-daily (07:00) — stock-alert e alert-expiration validados end-to-end (dedup confirmado). Ver docs/pendencias/AUTO-01-cron-automacao.md. · Supabase cron
5. **EST01 — backbone para alertas de estoque** — ✔ EXECUTADO (21/11/2026): PRs #138/#139 mergeadas; reorder-check deployada e testada (sugestão real); cron 06:30 ativo; thresholds 12%/35% aplicados. Ver docs/pendencias/EST01-stock-alert-backbone.md. · banco
6. **QUAL-01 — Math.random (47), TODO (11), MOCK (10) em src/** — riscos 🟡9 do audit. Triar: hardcode de teste? aleatoriedade real? · src/
7. **QUAL-02 — Swagger/OpenAPI para Edge Functions** — ✔ EXECUTADO (21/11/2026): openapi.json com 248 paths (PR #144) + portal /admin/api. Ver docs/pendencias/QUAL-02-doc-api-openapi.md. · supabase/functions/
8. **DOC-01 — ESTADO_ATUAL.md e docs/estado defasados (16/08/2026)** — ✅ EXECUTADO (21/11/2026): seção “Atualização 21/11/2026” no ESTADO_ATUAL.md + nota em EVIDENCIAS.md, histórico preservado; link para _linha-de-base.md. · ESTADO_ATUAL.md

### Itens OBSOLETOS (auditoria defasada — já resolvidos)

- **🔴1 Migrations sem controle** — supabase_migrations.schema_migrations existe.
- **🔴4 CI quebrado (0/8)** — CI verde (8/8 em 20/11/2026).
- **🟠7 Workflow morto github/** — diretório removido.
- **🟡10 Tabelas sem consumidor** — 0 tabelas sem referência em código.

### Itens AGUARDANDO HUMANO (decisão / credencial / produção)

- **SEC-01 — Rotacionar o Management token sbp\_...** — foi exposto em chat/.env local (aparou na conversa). Tem poder de deploy/delete de functions.
- **SEC-02 — Conferir publishable key ativa no Vercel** — a sb_publishable_... retornou 401 em momento anterior; confirmar qual o Vercel injeta para o Simulador de Stress.

## Regras herdadas (repo)

- Migration aditiva somente. Nunca DROP/TRUNCATE massa em dados existentes. Toda mudança em branch própria claude/<tipo>-<slug>-<AAMMDD-HHMM> com PR. Regra 8 (workflows/infra) exige aprovação do dono para merge.
