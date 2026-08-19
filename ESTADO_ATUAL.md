# ESTADO ATUAL DO SISTEMA — ESTOKI V2

> Auditoria de estado executada em **16/08/2026** sobre a branch `claude/system-status-features-87vzl5`.
> Método: medição direta do código e do banco de produção (somente leitura). Documentação do projeto
> tratada como hipótese a testar, nunca como fonte.
>
> ⚠️ **Esta auditoria está INCOMPLETA.** Leia a seção _Cobertura desta auditoria_ antes de decidir
> qualquer coisa com base nela. O que está aqui foi verificado; o que não foi está declarado.

---

## Veredito em uma tela

O ESTOKI V2 é, na prática, **dois sistemas sobrepostos com maturidade muito diferente**:

1. **Frontend + banco de dados: coerente e real.** 81 rotas declaradas, 53 páginas na raiz de
   `src/pages` mais subpastas, e o frontend acessa 68 tabelas — das quais **63 existem de fato** no
   banco de produção. Essa camada foi construída contra o schema real e conversa com ele.

2. **Camada de Edge Functions: majoritariamente desconectada.** São **248 funções** no repositório.
   Apenas **18 têm chamador comprovado** (7,3%). E **52 delas (21,0%) acessam tabelas ou funções de
   banco que não existem** — de um
   total de 82 tabelas que as funções referenciam, **47 (57%) não existem**, e **43 dessas nunca
   foram declaradas em nenhuma das 163 migrations**. Não é drift: é código escrito contra um schema
   imaginado que nunca existiu.

O risco estrutural nº 1 não é falta de funcionalidade — é que **o ambiente de produção não nasce do
repositório**. O banco não tem tabela de controle de migrations (`supabase_migrations.schema_migrations`
não existe). As 163 migrations versionadas não têm registro de aplicação. Não há caminho comprovado
para reconstruir o ambiente a partir do código.

**O que está bom, e é justo dizer:** todas as 86 tabelas de `public` têm RLS habilitado; o frontend
está bem ancorado no schema real; o desenho do CI é completo (lint, type-check, testes, build, size-limit e E2E Playwright em duas
matrizes) — ainda que hoje ele não execute, ver risco 🔴 4; a arquitetura `src/features/` existe e funciona onde foi adotada.

---

## Contagem honesta

As classificações abaixo cobrem **as dimensões que consegui medir de ponta a ponta**. Não é o
inventário funcionalidade-a-funcionalidade que o método exige — esse não foi concluído.

| Dimensão medida                                           | Medida                | Classificação predominante       |
| --------------------------------------------------------- | --------------------- | -------------------------------- |
| Edge Functions com chamador comprovado                    | **18 de 248 (7,3%)**  | 🟦 SUGERIDO_OU_INICIADO          |
| Edge Functions quebradas (tabela ou RPC inexistente)      | **52 de 248 (21,0%)** | 🟦 (não podem funcionar)         |
| Tabelas referenciadas por functions que existem           | **35 de 82 (43%)**    | —                                |
| Tabelas referenciadas pelo frontend que existem           | **63 de 68 (93%)**    | ✅                               |
| Tabelas de `public` com ao menos 1 linha                  | **57 de 86 (66%)**    | 🟨 (origem do dado não separada) |
| Tabelas de `public` com zero linhas                       | **29 de 86 (34%)**    | 🟦 dormentes                     |
| Tabelas vivas que ninguém acessa (nem src, nem functions) | **9 de 86 (10,5%)**   | ⬛                               |
| Rotas apontando para `src/features` (arquitetura nova)    | **12 de 81 (14,8%)**  | 🟨 refactor parcial              |
| Páginas órfãs em `src/pages`                              | **24 de 108 (22,2%)** | ⬛                               |
| Páginas em `src/features` não roteadas                    | **2**                 | 🟦                               |
| Arquivos de teste                                         | **35**, 12 sem runner | 🟨                               |
| Jobs de cron ativos                                       | **1**                 | 🟦 automações sem disparo        |
| Execuções recentes do CI em `main` que passaram           | **0 de 8**            | 🔴 pipeline quebrado             |

---

## Riscos estruturais, por gravidade

### 🔴 1. O ambiente não é reconstruível a partir do repositório

`supabase_migrations.schema_migrations` **não existe** no banco de produção (erro `42P01` ao
consultar). Há 163 arquivos de migration versionados e **zero registro de aplicação**. Consequência
prática: ninguém consegue provar que o banco atual corresponde às migrations, nem recriar o ambiente
em staging/DR a partir do código. Este é o achado mais grave da auditoria.

### 🔴 2. 52 Edge Functions operam sobre um schema que não existe

Exemplos verificados linha a linha:

- `supabase/functions/reorder-check/index.ts:42` grava em `reorder_suggestions` — tabela inexistente.
- `supabase/functions/integration-mercado-livre/index.ts:118` grava em `integration_logs` — inexistente.

Além das tabelas, **5 das 8 funções de banco (RPC) chamadas pelas Edge Functions não existem**:
`decrease_location_stock`, `get_inventory_summary`, `get_min_stock_threshold`, `get_reorder_point`,
`recalculate_weekly_stats` — quebrando `picking-confirm`, `reports`, `stock-alert`, `cron-weekly` e
`check-reorder` (esta última não aparecia na contagem por tabela).

43 tabelas (`users`, `suppliers`, `sales_orders`, `shipments`, `invoices`, `payments`, `pick_lists`,
`picking_waves`, `stock_balances`, `stock_transfers`, `sessions`, `notifications`, `lots`, `nfe`,
`categories`, `units_of_measure`…) **nunca foram declaradas em migration alguma**. O código de
backend foi escrito contra um modelo de dados que nunca saiu do papel.

Note a gravidade específica: `users`, `suppliers`, `sales_orders` e `shipments` são entidades
centrais de um WMS. O backend as pressupõe; o banco tem `profiles`, `orders`, `fornecedor_scores`.

### 🔴 3. Automações agendadas não têm quem as dispare

O `pg_cron` tem **exatamente 1 job ativo**: `update-profile-nome-daily-v3` (`0 9 * * *`). O
repositório contém `cron-daily`, `cron-weekly`, `scheduler-daily-tasks`, `scheduler-reports`,
`scheduler-sync`, `scheduler-cleanup`, `alert-*` (10 funções), `check-*`, `cleanup-*`. Nenhuma
delas tem agendamento no banco. São exatamente as features que **falham sem erro visível** e por
isso nunca viram chamado.

### 🔴 4. O CI está quebrado — nenhum check passa desde antes desta auditoria

`npm ci` falha com `EUSAGE: package.json and package-lock.json are not in sync` (faltam entradas
`@esbuild/*@0.28.2` no lockfile). **Todo job do CI começa por `npm ci`**, então lint, format,
typecheck, teste, build, size-limit e Playwright **nunca chegam a executar**.

Verificado: as **8 execuções mais recentes do `ci.yml` na branch `main` terminaram em `failure`**
(commits `455831e`, `a28624d`, `f7e3df5`, `6018de8`, `41e54c9`, `1b3f27e`, `3ae6127`, `11d7229` —
todos de 16/08/2026). O lockfile provavelmente dessincronizou numa das PRs recentes do Dependabot.

Consequência direta: **nenhum dos gates de qualidade do repositório está em vigor hoje.** Qualquer
afirmação de que "o CI valida" o código é falsa no estado atual — inclusive as dos relatórios em
`.qa-report/`.

Correção provável: `npm install` para regenerar o `package-lock.json`, e commit do lockfile. Não a
apliquei: regenerar um lockfile de ~1 milhão de linhas é mudança de repositório inteiro, fora do
escopo desta auditoria, e merece PR própria. Ver _Próximos passos_.

### 🟠 5. Gate de cobertura quase vazio

`vitest.config.ts:29-33` define thresholds de **lines 12%, statements 12%, functions 25%**. Pior:
`vitest.config.ts:20` restringe a medição a `src/services/**`, `src/features/**/services/**` e
`src/lib/**` — ou seja, a cobertura **não mede** `src/components` (46.570 linhas), `src/pages`
(16.887), `src/hooks` (15.212). Um "✅ cobertura" no CI não diz nada sobre 80% do código.

### 🟠 6. Documentação canônica desatualizada

- `.qa-report/rls-audit.md` afirma **76 tabelas** em `public`. O banco tem **86**. Defasagem de 10.
- `.qa-report/execucao-final-v4.md` carimba **"10/10"** em Segurança, Performance, RLS, Índices e
  Health, e conclui _"Nenhum gap crítico"_. Os três achados 🔴 acima não aparecem em nenhum desses
  relatórios.
- `docs/ROADMAP.md` planeja Q1–Q4 **2025**. Hoje é agosto de **2026**: o roadmap está vencido há um
  ano e não foi reconciliado.
- `.lovable/plan.md` declara _"certified Elite WMS interface"_ e _"operational excellence"_.

### 🟠 7. Workflow morto em `github/` (sem ponto)

Existe `github/workflows/ci.yml` (42 linhas), **diferente** de `.github/workflows/ci.yml`. O GitHub
lê apenas `.github/` — esse arquivo nunca executou e nunca executará. É um pipeline fantasma que
pode enganar quem for auditar o CI pelo diretório.

### 🟡 8. Refactor `src/features/` parado no meio, e 24 páginas órfãs

Apenas **12 das 81 rotas** apontam para `src/features`; 69 ainda apontam para `src/pages`. Efeito
colateral já materializado: `src/pages/DashboardTempoReal.tsx` está **morto** — a rota
`src/routes/featureRoutes.tsx:30` carrega `@/features/analytics/pages/RealtimeDashboardPage`. Quem
editar a página antiga não muda nada em produção. Outras 2 páginas em `src/features` não estão
roteadas (`dashboard/pages/DashboardPage.tsx`, `analytics/pages/OperationalMonitorPage.tsx`).

Efeito colateral maior: **24 das 108 páginas de `src/pages` não têm nenhum importador** (22,2%).
Nove diretórios inteiros estão órfãos — `products/`, `reports/`, `suppliers/`, `lots/`, `locations/`,
`receiving/`, `alerts/`, `cycle-count/`, `error/`. São páginas de negócio completas que nenhuma rota
alcança.

### 🟡 9. Sinais de trabalho inacabado e dado fabricado

Em `src/`: **47 ocorrências de `Math.random(`** (concentradas em `hooks/` 6, `lib/` 3, `charts/` 2,
`feedback/` 2), **219 `TODO`**, **221 ocorrências de `mock`**, **265 de `placeholder`**. Não
classifiquei uma a uma — ver limitações.

### 🟡 10. Dez tabelas vivas sem nenhum consumidor

`db_health_snapshots`, `inventario_config`, `ip_whitelist`, `login_attempts`, `produtividade_operador`,
`quality_inspections`, `recuperacao_materiais`, `regras_ponto_pedido`, `setores_checkpoint`, `tenants`
não são acessadas nem pelo frontend nem pelas Edge Functions. `tenants`/`tenant_members` (1 linha cada)
indicam multi-tenant iniciado e não concluído.

---

## Errata — erros da própria auditoria, encontrados na revisão

Submeti este documento a uma revisão adversarial, refazendo cada medição com um método diferente do
original. **Seis afirmações estavam erradas.** Os números acima já estão corrigidos; registro aqui o
que estava errado e por quê, para que a versão errada não circule.

| #   | Afirmação original                                                     | Valor correto           | Causa do erro                                                                                                                                                                                                             |
| --- | ---------------------------------------------------------------------- | ----------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | `reorder-check/index.ts:41` e `integration-mercado-livre/index.ts:112` | linhas **42** e **118** | Citei número de linha sem conferir. Violação direta da regra "não invente evidência" — a mais grave desta lista, porque evidência falsa contamina tudo                                                                    |
| 2   | 8 Edge Functions com chamador (3,2%)                                   | **18 (7,3%)**           | Meu regex casava `invoke("x")` mas não `invoke<T>("x")`, nem chamada quebrada em várias linhas, nem o dispatcher `aiInvoke(nome)`. É exatamente a armadilha de falso-negativo que eu tinha listado na Fase B — e caí nela |
| 3   | 3 páginas órfãs de 53                                                  | **24 de 108**           | Só varri a raiz de `src/pages`. As 55 páginas em subpastas ficaram fora da varredura inteira                                                                                                                              |
| 4   | 10 tabelas sem consumidor                                              | **9**                   | `tenants` é consumida em `src/hooks/useCurrentTenant.ts:24`, via join embutido no `select` — forma que meu grep de `.from()` não enxerga                                                                                  |
| 5   | 63 de 67 tabelas do frontend existem                                   | **63 de 68**            | Faltou `triagem` na lista de inexistentes (são 5, não 4)                                                                                                                                                                  |
| 6   | 23 arquivos de teste                                                   | **35**                  | Ignorei 12 testes Deno em `supabase/functions/`                                                                                                                                                                           |

**Dois achados novos surgiram da revisão:**

- 🔴 **5 das 8 funções de banco (RPC) chamadas pelas Edge Functions não existem** — quebra que a
  contagem por tabela não capturava. Incorporado ao risco 2.
- 🟠 **Os 12 testes Deno não têm runner.** Nenhum workflow nem script do `package.json` executa
  `deno test`. São testes que não protegem nada. Incorporado ao risco 5.

**Um resultado positivo confirmado:** as 5 RPCs chamadas pelo **frontend**
(`collect_challenge_reward`, `get_current_user_permissions`, `log_audit_event`, `move_stock`,
`registrar_checkin_diario`) **existem todas** no banco. A camada de RPC do frontend é sólida.

**Limitação de método que fica declarada:** busca por `.from("tabela")` é cega a tabelas acessadas
apenas por join embutido no `select` do PostgREST. Testei o alcance disso: afeta somente `profiles`
e `tenants`. As demais conclusões sobre tabelas sem consumidor se sustentam.

**O que a revisão _confirmou_, sem alteração:** as 86 tabelas e 29 vazias; a inexistência de
`supabase_migrations.schema_migrations`; o job único de cron; as 47 tabelas inexistentes e as 43
nunca declaradas (testei com regex ampla, incluindo identificadores entre aspas — nenhum falso
negativo); o denominador de 248 funções (250 diretórios, menos `_shared/` e `tests/`); as 81 rotas;
a quebra do CI. Também confirmei que `.from()` com aspas simples não existe nas Edge Functions —
zero ocorrências —, então esse grep não teve falso-negativo.

---

## Correção de rota durante a auditoria

Um dos agentes desta auditoria relatou que as Edge Functions curtas _"instanciam um cliente Supabase
que nunca é usado e ecoam a entrada"_. **Verifiquei e refutei.** Abri `reorder-check/index.ts` (29
linhas de corpo útil) e `integration-mercado-livre/index.ts`: ambas têm lógica de negócio real, e a
segunda chama a API do Mercado Livre de verdade (`https://api.mercadolibre.com`, 7 ações). O
problema dessas funções **não é serem vazias — é gravarem em tabelas inexistentes**, que é um
diagnóstico diferente e leva a uma correção diferente. Registro aqui para que a afirmação errada não
circule.

---

## Cobertura desta auditoria — o que NÃO foi feito

Sejamos exatos: **a auditoria funcionalidade-a-funcionalidade não foi concluída.** Lancei 10
subagentes em paralelo sobre ~146.000 linhas e **todos foram interrompidos pelo limite de sessão da
API antes de gravar qualquer saída**. Nenhum arquivo de detalhe por dimensão foi produzido. O que
está neste documento foi medido diretamente por mim, depois da falha, com análise estática e
consultas de leitura ao banco.

**Não coberto:**

| Escopo                                                    | Situação                                                |
| --------------------------------------------------------- | ------------------------------------------------------- |
| `src/components/` (46.570 linhas, 520 arquivos)           | ⛔ não inventariado — órfãos não identificados          |
| `src/hooks/` (15.212 linhas, 288 arquivos)                | ⛔ não inventariado individualmente                     |
| `src/features/` (16.398 linhas)                           | 🟡 só o mapeamento de roteamento                        |
| `src/pages/` (16.887 linhas)                              | 🟡 só órfãos e alvos de rota; conteúdo não classificado |
| Classificação das 47 `Math.random`                        | ⛔ contadas, não analisadas                             |
| Conteúdo das 248 Edge Functions                           | 🟡 2 lidas integralmente + medição de tabelas em todas  |
| Integrações de terceiros, uma a uma                       | ⛔ só Mercado Livre verificada                          |
| Migrations duplicadas (`20240115_*` × `20240115000001_*`) | ⛔ detectadas, não analisadas                           |
| Dado semeado × dado operacional (20 scripts `seed-*.cjs`) | ⛔ não separado                                         |
| Políticas RLS permissivas (`USING (true)`)                | ⛔ não verificadas                                      |

**`NAO_VERIFICADO` — sem acesso, não simulei:**

- **Quais Edge Functions estão de fato deployadas.** A Management API do Supabase exige token
  `sbp_...`, indisponível via `service_role`. As 248 podem estar todas deployadas, ou nenhuma.
- **Se o código compila, se os testes passam, se o bundle cabe no budget.** `node_modules` está
  vazio e `npm ci` falhou nesta sessão (exit 1). Nenhuma afirmação de build/teste/lint neste
  documento — inclusive as do `.qa-report/` foram tratadas como não confirmadas.
- **Conclusão real dos checks do CI** no GitHub.
- **Se as tabelas com dado têm uso real ou apenas seed.**

**Nada foi alterado em produção.** Todas as consultas ao banco usaram `read_only:true`. Nenhum DDL,
DML, migration ou deploy. Nenhum arquivo pré-existente do repositório foi editado.

---

## Próximos passos, por valor

### Barato e seguro (posso fazer sozinho, sem tocar produção)

1. **Concluir a auditoria** nas dimensões faltantes, em lotes sequenciais menores — sem frota
   paralela, que foi o que estourou a sessão. Prioridade: `src/components` (órfãos) e `src/hooks`
   (dado fabricado).
2. **Listar as 51 Edge Functions quebradas** com a tabela inexistente de cada uma, para virar
   backlog acionável.
3. **Reconciliar `docs/ROADMAP.md`** com o estado real de 2026 e corrigir a contagem de tabelas no
   `.qa-report/rls-audit.md` — via errata, sem apagar o original.
4. **Remover `github/`** (sem ponto): workflow que nunca roda.

5. **Regenerar o `package-lock.json`** (`npm install` + commit) para destravar o CI. É a correção
   de maior retorno imediato: sem ela, nenhum gate de qualidade do repositório funciona. Merece PR
   própria, separada desta.

### Decisão sua — toca produção ou muda arquitetura

6. **Restabelecer o controle de migrations.** Decidir entre baseline do schema atual (`supabase db
pull`) ou reconstrução verificada. É a única correção que devolve reprodutibilidade ao ambiente,
   e é DDL em produção: não faço sem sua palavra.
7. **Decidir o destino das 51 funções quebradas**: criar as 43 tabelas ausentes, reescrever contra o
   schema real, ou arquivar. São três custos muito diferentes.
8. **Agendar as automações** (`cron-daily`, `alert-*`, `scheduler-*`) ou assumir que não existem.
   Hoje há 1 job para ~15 funções que pressupõem agendamento.
9. **Concluir ou reverter o refactor `src/features/`.** 14,8% das rotas migradas é o pior dos dois
   mundos: mantém duas arquiteturas vivas e produz código morto silencioso.
10. **Subir o gate de cobertura e ampliar o escopo medido.** 12% de linhas sobre 3 diretórios não
    protege nada.

---

_Evidências detalhadas em [`docs/estado/EVIDENCIAS.md`](docs/estado/EVIDENCIAS.md)._
