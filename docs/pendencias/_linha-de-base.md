# Linha de base — Estoki_V2 (WMS)

> Estado real verificado em 2026-11-20 (main @ 94df929c; lint local revalidado pós-merge #131 @ 7d0945e).
> Tudo aqui é medido, não suposição. Fontes: CI GitHub (runs), Management API Supabase (ookjbflsnoefnsixrspc), leitura de código.

## Build / typecheck / lint / testes

- **Type-check** (tsc --noEmit): **0 erros** (node v22.23.4).
- **Vitest**: 20 arquivos / 64 testes — **0 falhas**.
- **ESLint**: **0 errors**, 1085 warnings preexistentes — idêntico ao CI.
  - Obs: antes disto, lint local acusava 12731 errors **falsos** vindo de .vercel/output/static/* (build Vercel local não ignorado). Corrigido no merge #131 (eslint.config.js agora ignora .vercel/**). Evidência: aggregate eslint — top file .vercel/output/static/assets/index-*.js (2743 erros), top rule
    o-unused-expressions (9570).
- **CI main**: 8 runs success em 20/11/2026, incluindo QA Checklist, CI Pipeline, Automação local.
- **Cobertura (vitest.config.ts)**: thresholds reais lines 6 / branches 7 / functions 5 / statements 5 (include: src/services/**, src/features/**/services/**, src/lib/**). Gate definido para subir 5pp/rodada até 70/60/60/70 (comentário no próprio config).

## Banco de produção (Supabase ookjbflsnoefnsixrspc, via Management API)

- **86 tabelas** em public; **0 tabelas sem RLS**; **250 policies**; **56 triggers O** (todos os não-internos ativos).
- **supabase_migrations.schema_migrations existe** — controle de migrations OK (audit dizia 42P01).
- **cron.job: 0 jobs** — nenhuma automação agendada ativa (audit dizia 1 job).
- **Dados**: **1 tabela com linhas** — desafios_diarios (5). Todas as demais 86 têm 0 linhas (produção essencialmente vazia/limpa).
- **Edge functions deployadas: 100** (limite plano); **diretórios locais: 250**.

## Funções (cross-check .from() vs tabelas reais)

- **20 das 100 deployadas** fazem .from() para **tabela inexistente** (schema EN refactor pela metade): sales_orders, shipments, lots, lerts, location_stock, integration_logs, cron_logs, pick_lists etc.
- **Nenhuma das 20 é referenciada pelo app** (0 imports em src/) → código morto, não quebra funcionalidade ativa.
- Das 47 tabelas-inexistentes citadas via .from() no total (51 funções locais), 27 não estão deployadas.

## Páginas / rotas / menu

- **120 arquivos de página** em disco (src/pages/** + src/features/*/pages/**).
- **85 referências de página** nos routers (App/wms/admin/analytics/feature/public) → **0 rota apontando para arquivo inexistente**.
- **35 páginas órfãs** (sem nenhuma rota): inclui duplicatas de features (src/pages/Recebimento vs src/features/receiving/pages/RecebimentoPage, ConferenciaRecebimento, Triagem, Estoque) e legadas (CurvaABC, DashboardTempoReal, KPIsOperacionais, PrevisaoDemandaIA, report pages EN, etc.).
- **Menu**: 72 itens declarados em sidebarNavData.ts + mobileNavItems.

## Riscos do audit (ESTADO_ATUAL.md, 16/08/2026) — reverificado

| #    | Risco (audit)                   | Estado real (20/11/2026)      | Veredito               |
| ---- | ------------------------------- | ----------------------------- | ---------------------- |
| 🔴1  | Migrations sem controle (42P01) | schema_migrations existe      | RESOLVIDO              |
| 🔴2  | 52 fns p/ tabelas inexistentes  | 20 deployadas + 0 refs no app | CONFIRMADO (gap morto) |
| 🔴3  | Cron sem trigger manual         | 0 crons ativos                | MUDOU (sem automação)  |
| 🔴4  | CI quebrado (0/8)               | CI verde (8/8 hoje)           | RESOLVIDO              |
| 🟠5  | Coverage gate falso             | thresholds 6/7/5/5 reais      | CONFIRMADO (baixo)     |
| 🟠6  | Docs defasadas                  | ESTADO_ATUAL.md 16/08         | CONFIRMADO             |
| 🟠7  | Workflow morto github/          | diretório removido            | RESOLVIDO              |
| 🟡8  | Páginas órfãs                   | 35 órfãs (não 24)             | CONFIRMADO             |
| 🟡9  | Math.random/TODO/mock           | 47 + 11 + 10 em src/          | CONFIRMADO             |
| 🟡10 | 10 tabelas sem consumidor       | 0 tabelas sem ref em código   | OBSOLETO               |

## Decisões

- Prevalece o comportamento real verificado (código + banco), não o que o doc afirma.
- Nada que funciona hoje foi alterado; deploys feitos anteriormente nesta sessão (8 edge functions resgatadas, 8 slots mortos removidos) são rastreáveis em git main @ 94df929c.
