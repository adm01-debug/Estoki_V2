# Regras de domínio WMS que o código não deixa óbvio — referência para agentes

Ler antes de mexer em recebimento, triagem/qualidade, armazenagem, picking, expedição, inventário,
trocas ou alertas. Fonte dos enums: `docs/history/DOCUMENTACAO_TECNICA_ESTOKI_WMS.md` (doc histórico, não
linkado no README, mas é onde os valores estão escritos) — confirmado por amostragem nesta sessão.

## Fluxo macro

recebimento (NF-e XML, conferência cega, alerta de divergência) → triagem/qualidade (cronometrada, foto
obrigatória, amostragem **ISO 2859-1**) → armazenagem/putaway (mapa de **120 posições**, heatmap,
sugestão de endereçamento) → picking (ondas, rota TSP `nearestNeighbor` + `twoOpt`) → expedição (romaneio,
cotação/rastreio Correios, comprovante) → trocas/devoluções em **5 etapas**.

## Máquinas de estado (enums canônicos)

| Entidade            | Estados                                                                                                                     | Fonte                                        |
| ------------------- | --------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------- |
| Recebimento         | `aguardando → em_transito → recebido → em_conferencia → conferido`, desvios `divergencia`, `cancelado`                      | `DOCUMENTACAO_TECNICA_ESTOKI_WMS.md:284-294` |
| Triagem (resultado) | `Aprovado` (vai para estoque) · `Reprovado` (defeito) · `Parcial` (parte aprovada)                                          | `:316-322`                                   |
| Tarefa (status)     | `pendente \| atribuida \| em_andamento \| concluida \| bloqueada`                                                           | `:349-357`                                   |
| Tarefa (tipo)       | `separacao \| armazenagem \| transferencia \| inventario \| expedicao`                                                      | `:1025-1033`                                 |
| Onda de picking     | `pendente \| em_andamento \| concluida \| cancelada`                                                                        | `:391-398`                                   |
| Romaneio            | `rascunho \| confirmado \| em_transito \| entregue \| parcial`                                                              | `:424-432`                                   |
| Entrega             | `pendente \| em_rota \| entregue \| recusado \| parcial \| reagendado`                                                      | `:435-443`                                   |
| Inventário cíclico  | ciclo `agendado \| em_andamento \| concluido \| cancelado`; contagem `pendente \| em_andamento \| concluido \| divergencia` | `:482-498`                                   |
| Troca/devolução     | `aberto \| em_analise \| aprovado \| recusado \| em_transito \| recebido \| finalizado`                                     | `:702-710`                                   |
| Posição             | tipo `porta_palete \| box`; status `livre \| ocupado \| reservado \| bloqueado`                                             | `:1009-1023`                                 |

Eventos de triagem usados no código: `triagem_pendente`, `triagem_inicio`, `triagem_fim`,
`triagem_conferencia`, `triagem_concluida`. Funções: `triage-start`, `triage-complete`,
`quality-inspection`, `quality-control`.

## Rastreabilidade (cadeia de custódia)

`recebimento_nf → conferencia → triagem_inicio → triagem_fim → armazenamento → reserva → separacao →
conferencia_expedicao → carregamento → saida_transporte → entrega`, mais `devolucao`
(`:1035-1048`). Quem inserir etapa nova no fluxo tem que inserir o elo aqui também, senão a tela de
rastreabilidade mostra buraco.

## Regras numéricas

- **Curva ABC:** A = alto giro, 80% do movimento · B = 15% · C = 5% (`:245-251`). Função `abc-analysis`,
  página `ABCAnalysisPage`.
- **Consumo de lote / picking:** FIFO, **FEFO** (First Expire First Out) e LIFO (`:237-243`). FEFO é o
  default para item com validade — não troque sem decisão de negócio.
- **Alertas:** `estoque_minimo | estoque_maximo | ponto_pedido | posicao_ociosa | vencimento_proximo |
gargalo_triagem | divergencia_inventario | item_sem_movimentacao`; severidades
  `info | aviso | critico | urgente` (`:604-625`).
- **Alertas de banco** (`docs/OBSERVABILIDADE.md:146-166`): `wal_size` > 500 MB (crítico),
  `rollback_ratio` > 5% com piso de 100 transações (crítico), `deadlocks` (aviso); **anti-flapping de 6 h**
  por `codigo`; o cálculo usa **delta entre snapshots** porque os contadores do Postgres são cumulativos —
  não troque por leitura absoluta.
- **Previsão de demanda** (`demand-forecast`): lê `rastreamento_historico`, janela 90 dias, holdout 14 dias.

## Papéis (RBAC)

`admin` (76 usos no código), `supervisor` (45), `operador` (31); resíduos de `user`/`viewer`/`manager`
ainda aparecem. Checagem por `has_role()` / RPC `get_current_user_permissions`. **Multi-tenant está na
Fase 1**: existem `tenants`, `tenant_members` (papéis `owner|admin|member`) e helpers
`is_tenant_member`/`is_tenant_admin`/`current_tenant_id()` lendo `request.jwt.claims.tenant_id`, mais o
hook `useCurrentTenant()`. A **Fase 2 (coluna `tenant_id` nas ~15 tabelas raiz + RLS por tenant) está
pendente** — ou seja, **hoje não presuma isolamento por tenant** ao escrever query ou policy.

## Armadilhas de interpretação de dado

1. **Dado semeado × dado operacional nunca foi separado** (`ESTADO_ATUAL.md:238`). Há 17 scripts
   `scripts/seed-*.cjs` cobrindo exatamente os módulos do domínio (`seed-triagens`, `seed-conferencia`,
   `seed-putaway`, `seed-curva-abc`, `seed-expedicao`, `seed-trocas`, `seed-qualidade`,
   `seed-inventario-geral`, `seed-aprovacoes`, `seed-kpis`, `seed-cadastros`…). **"Tabela com linhas" não
   significa "feature em uso".**
2. **Nome de tabela em edge function não é fonte de verdade.** `ESTADO_ATUAL.md:82-88` registra 43
   tabelas pressupostas pelo backend que nunca foram declaradas em migration (`users`, `suppliers`,
   `sales_orders`, `shipments`, `pick_lists`, `stock_balances`…); o banco real tem `profiles`, `orders`,
   `fornecedor_scores`. Tabelas referenciadas por `src/` que não existem: `backups`, `entity_versions`,
   `feature_flags`, `produtos_estoque`, `triagem` (`docs/estado/EVIDENCIAS.md:245`).
3. **Duas arquiteturas de página vivas** (`src/pages/` e `src/features/`): antes de editar uma tela,
   confirme qual arquivo a rota carrega. Exemplo verificado: `src/pages/DashboardTempoReal.tsx` está
   **morto** — a rota usa `@/features/analytics/pages/RealtimeDashboardPage`
   (`src/routes/featureRoutes.tsx:30`).
4. **`grep '.from("tabela")'` é cego a join embutido no `select` do PostgREST** — afeta `profiles` e
   `tenants` (`ESTADO_ATUAL.md:193-195`). Para saber se uma tabela é usada, olhe também os `select`
   com relacionamento.
5. **Relatórios em `.qa-report/` não são fonte de verdade** (`ESTADO_ATUAL.md:125-128`): o
   `rls-audit.md` conta 76 tabelas onde o banco tem 86, e há relatório carimbando "10/10, nenhum gap
   crítico". Use o banco, não o relatório.
6. **`docs/ROADMAP.md` está vencido** (planeja Q1–Q4 de 2025, nunca reconciliado). Não cite como plano.

## Plugin SDK (`docs/PLUGIN_SDK.md`)

Plugin **nunca** importa o cliente Supabase: só `ctx.invoke()` / `ctx.query()`. `permissions[]` são
revisadas no activate; `minHostVersion` é validado por `satisfiesMinVersion()`; handler que lança exceção
é isolado em try/catch e não derruba o host. Superfícies: `nav`, `routes`, `widgets`, `on`, `onActivate`,
`onDeactivate`. Eventos publicados: `lote.recebido`, `picking.confirmado`, `estoque.ajustado`, `xp.ganho`.
