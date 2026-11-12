# AGENTS.md — Estoki V2

Regras do dono para qualquer agente de IA; vencem `docs/` (histórico) e `CONTRIBUTING.md` onde divergirem.
Detalhe em `docs/agentes/<tema>.md`, citado aqui como "ler quando <situação>"; divergiu da realidade →
corrija no mesmo PR do fix. **Responda sempre em PT-BR** — resposta, código, commit, PR.

## Postura

- O dono não é dev: decide negócio; o agente executa a engenharia inteira via MCP. Nunca passo manual do
  dono nem pedir que ele revise diff, rode comando ou teste local.
- Qualidade + velocidade, mínimo de tokens. Decida como dev sênior; pergunte só com custo, arquitetura,
  dado destrutivo em produção, trade-off de negócio ou item "chame o dono". Para ler, não peça permissão.
- Verdade acima de validação: não sabe → diga; falhou → diga. Afirmação sobre código cita evidência
  (arquivo:linha, diff, saída de comando); sem evidência = "NÃO VERIFICADO" + motivo; nunca "testado" sem
  ter rodado. Branch/commit/PR não provam nada — leia o código.
- Diff mínimo, zero churn: causa raiz, não reescrita; não refatore, renomeie ou comente o que não foi
  pedido; não reescreva arquivo inteiro para mudar 3 linhas. Dependência nova ou bump major só se
  indispensável (avise na PR) — e `npm ci` já está quebrado aqui (ver `## Qualidade e guardas`).
- `APROVADO` = execute o plano como descrito, sem reconfirmar.
- Uma tarefa por vez, cada uma com sua branch/PR. Outro bug → "Próximos passos". Travou → reporte o erro
  exato e pare; não contorne regra. Releia o pedido antes de concluir.
- Tokens: leia só o trecho necessário; `ESTADO_ATUAL.md` e `docs/agentes/mapa-repo.md` antes de grep;
  exploração ampla → subagente; nenhuma tool "por garantia"; não gere código que não será aplicado.
- Segredos nunca em código, commit ou resposta — só em env/secret do serviço (nas edges, via
  `supabase secrets set`). `VITE_*` entra no bundle e é público. Exposto em chat → rotacionar na hora.
  Nunca imprima nem commite `.env`, token ou `service_role`. **Este repo já tem senha de produção em
  `scripts/apply_rls_helper.cjs:18` — não copie, não execute, não imprima; rotação só com o dono.**

## Bugs e funcionalidades

- Diagnóstico antes de patch: logs e estado real, ponto exato (arquivo:linha), causa; várias causas →
  liste todas, corrija a pedida.
- Antes da PR: `npm run lint`, `npm run typecheck` e os testes do que tocou. Só erro seu conta; erro
  herdado da `main` → "Próximos passos".
- "Pronto" = PR mergeada + deploy confirmado + comportamento verificado (log, query ou request real);
  faltou um → diga onde parou. Código existir não é pronto.
- Funcionalidade pronta = integrada ponta a ponta (rota em `src/routes/`, entrada na UI, hook/service
  chamado, edge function publicada, tabela com RLS, estados erro/loading/vazio, submit), sem mock,
  hardcode ou TODO. Pela metade não é pronto; não cabe na sessão → entregue o funcional e liste o que
  falta, em ordem, com arquivos. Nunca deixe código morto ou feature "quase" sem dizer.
- Antes de editar tela, confirme qual arquivo a rota carrega: `src/pages/` e `src/features/` convivem e há
  página morta (`docs/agentes/regras-dominio.md`).

## Comunicação

- Resultado primeiro, só o que muda decisão do dono. Sem introdução, recapitulação, narração, hedging,
  disclaimer, lição de moral ou cortesia. Efeito no negócio; técnica só se perguntarem. Resposta e plano
  proporcionais ao tamanho do fix; não despeje log — cite a linha que importa. Caminhos, comandos e links
  completos. Destrutivo de verdade: uma linha ("isso apaga X, sem volta — confirma?").
- Toda execução fecha com exatamente 3 "Próximos passos" (`N. [título] — [por quê] · [arquivo]`), por
  impacto, do que você viu, executáveis via MCP, para não-dev; nada de genérico ("adicionar testes",
  "melhorar documentação", "revisar segurança"). É um menu: `1`, `1 e 3`, `APROVADO 2`, "todos" ou o bloco
  devolvido = executar na ordem, sem reconfirmar. Só consulta, já rejeitadas ou nada pendente →
  `Próximos passos: nada pendente neste escopo.`

## Fluxo Git — detalhe em `docs/agentes/github-ci.md`

- Repo `adm01-debug/Estoki_V2`, `main`, **privado**. Escrita no GitHub: MCP **`GITHUB - MCP - FOREVER`**
  (`github_push_files`: `files` + `delete` num commit); `git push`/`gh` só em repo autorizado na sessão.
- **Nada no GitHub te protege:** `main` sem branch protection e sem ruleset, 4 environments sem revisor,
  merge commit e rebase habilitados. A disciplina é só esta lista.
- Nunca commite em `main`. Só escreva em branch que **você** criou nesta sessão; branch alheia ou já
  existente é somente leitura. Antes do push, confira que o último commit é seu.
- PR aberta nos mesmos arquivos → pare e avise o dono (liste via `github_graphql`).
- Branch de `main` atualizado: `claude/<fix|feat|chore|ci>-<slug>-<AAMMDD-HHMM>`. Sem carimbo não é aceito.
  Trabalho local em worktree isolado (`git worktree add`), nunca `git checkout -b` no clone principal;
  cleanup ao fim (`git worktree remove --force` + `git worktree prune`).
- Commit PT-BR, 1 atômico, `<tipo>(<escopo>): <assunto>`; tipos `feat fix perf refactor test docs chore ci`.
  **Não há hook de commit** (`prepare` é no-op, sem `.husky/`, `.lintstagedrc*` é config morta) — é
  convenção, siga mesmo assim.
- PR sempre: título = o que muda; corpo = causa + o que foi verificado, com evidência.
- Mergeie sem aprovação (squash, apague a branch) PR sua pronta: CI verde, sem conflito, escopo comum
  (front, edge function, config). **Deixe aberta e chame o dono**: DDL/migration em produção;
  CI/workflows, segredos, Dockerfile; deleção de dado, arquitetura ou custo; escolha de gerenciador de
  pacote; conflito com PR de outro agente.
- Conflito: rebase em `main`; `--force-with-lease` só na sua branch. Nunca em `main` nem em branch alheia.
- Merge = produção: confira o deploy e reporte (`docs/agentes/deploy.md`). CI vermelha → leia o resumo da
  falha antes de qualquer patch; do seu merge → `fix:` em branch nova na mesma sessão.
- Fim: link da PR + estado (mergeada / aberta aguardando o dono / CI vermelha e por quê).

## Banco — ler `docs/agentes/banco.md` antes de SQL, migration ou deploy

- Oficial: Supabase Cloud **`ookjbflsnoefnsixrspc`** (`supabase/config.toml:1`), SQL pelo MCP
  **`supabase-estoki`** (`.mcp.json`).
- NÃO escrever em `pgxfvjmuubtbowutlide` ("GESTÃO DE CLIENTES"), `doufsxqlfjyuvxuezpln` ("GESTÃO DE
  PRODUTOS") nem `tnnnlkbymytvtqngbbqh` ("ZAPP WEB V2") — vários MCP de Supabase podem estar na mesma
  sessão; confira qual respondeu antes de rodar SQL.
- Diagnóstico = produção só leitura; teste de banco = Postgres descartável. **Nunca** `npm run db:migrate`
  nem `db:reset` para "testar": miram o projeto linkado (produção) e o segundo é destrutivo. `db:seed`
  roda `supabase/seed.sql` (10 `INSERT`, cabeçalho diz "para produção") contra o mesmo alvo.
- DDL = arquivo em `supabase/migrations/` (163 hoje, **sem ledger neste repo**), ordem arquivo → PR →
  merge → deploy do código → apply. Nenhum workflow aplica DDL: é manual, registre na PR.
- Todo `CREATE TABLE` em `public` leva, na mesma migration, `GRANT` → `ENABLE ROW LEVEL SECURITY` →
  `CREATE POLICY` por `auth.uid()`/`has_role()`; sem `anon` salvo tabela pública; `SECURITY DEFINER` exige
  `SET search_path`, guarda de autorização na 1ª linha do corpo e nasce sem `EXECUTE` para `anon`.
  Migration é append-only.
- Os 23 `scripts/seed-*.cjs` / `probe-*.cjs` apontam para **produção** com `service_role` (bypassa RLS),
  sem check de ambiente. Rodar qualquer um: só com o dono. Destrutivo, segredo e rotação: só com o dono.

## Serviços

- **Edge Functions** — ler `docs/agentes/edge-functions.md` ao criar ou alterar função. **248 funções**
  com `index.ts` (+ `_shared/` e `tests/`, que não são funções); só `migrate-helper` tem
  `verify_jwt = false`; 201/248 usam `service_role` e só 21/248 leem o header `Authorization` de entrada. Sempre CORS + Zod (400) + `try/catch` + `withLogging()`. Deploy é manual.
- **Deploy** — ler `docs/agentes/deploy.md` antes de dizer "deploy confirmado". O CI aponta para Lovable
  (`estoki.lovable.app`), o repo aponta para a Vercel (projeto `estoki-v2`, team `juca1`, `live: false`,
  últimos deploys `BLOCKED`): qual é a produção viva é **NÃO VERIFICADO** e a escolha é do dono.
- **Observabilidade** — Sentry só com `PROD` + `VITE_SENTRY_DSN`, PII removida em `src/lib/sentry.ts`;
  `/functions/v1/metrics` exige `Bearer METRICS_TOKEN` ou JWT `admin`; painel `/admin/saude-backend`.
- **GitHub/CI** — ler `docs/agentes/github-ci.md` ao mexer em workflow ou settings do repo.
- **Regras de domínio** — ler `docs/agentes/regras-dominio.md` ao mexer em recebimento, triagem, picking,
  expedição, inventário, trocas ou alertas.

## Stack e comandos — detalhe em `docs/agentes/mapa-repo.md`

- Vite 5 + React 18 + TS strict (`src/`), Tailwind + shadcn/ui, TanStack Query, Zod, i18next
  (pt-BR/en/es), Supabase (`supabase/functions/` Deno, `supabase/migrations/`), Vitest
  (`src/**/__tests__/`), Playwright (`tests/e2e/`), Capacitor (PoC). **Node 20+**, `npm ci` no CI.
- `npm run dev` sobe em **http://localhost:8080** (`vite.config.ts:40`), não 5173.
- `npx vitest run <caminho>`; `npm run typecheck`; `npx eslint <arquivos>`; `npm run test:e2e`;
  `npm run qa:rls`; `npm run audit:deps`. `npm run qa:all` **não** é o CI (falta `i18n:*` e `audit:zod`).
- Antes de qualquer tarefa: `ESTADO_ATUAL.md` (o que está quebrado) + `docs/agentes/mapa-repo.md` (onde
  fica cada coisa). `docs/ROADMAP.md` está vencido — não use.
- Convenção de código e de commit: skill `estoki-v2` (`.claude/skills/estoki-v2/SKILL.md`) — token
  semântico obrigatório, componente ≤ 150 linhas, sem `any`, texto em `t()`, `.limit(500)`.
- **Não ampliar `manualChunks`** em `vite.config.ts`: separar mais já causou o crash de produção
  `Cannot read properties of undefined (reading 'forwardRef')` (`vite.config.ts:189-194`).

## Qualidade e guardas

- Barram a PR (`qa.yml:167-172` na `main`): `lint`, `typecheck`, testes unitários, `build`, `rls-audit`,
  `dep-audit` — e `check-agents-integrity` quando a PR que liga o guard no CI entrar (aí são 7, em
  `qa.yml:177-183`).
  Rodam e **não** barram: `size-limit`, cobertura Zod, `i18n:check`, `i18n:hardcoded`,
  `migrations-todo-check`, E2E smoke, `npm audit`.
- `scripts/rls-audit.mjs` é **estático** (lê `supabase/migrations/*.sql`, não o banco) e falha só com
  tabela sem `ENABLE ROW LEVEL SECURITY`. Verde nele não prova RLS em produção — consulte `pg_policies`.
- `scripts/dep-audit.mjs` é o gate real de supply chain (`npm audit` dá 404 no mirror); exceção só em
  `.dep-audit-allowlist.json` com justificativa em `docs/SECURITY.md`. **Sem rede o script sai 0** — não
  confunda com "sem advisory".
- `i18n:hardcoded` falha em regressão contra o baseline congelado de 739 ocorrências
  (`.i18n-hardcoded-baseline.json`).
- Cobertura mede só `src/services/**`, `src/features/**/services/**`, `src/lib/**`
  (`vitest.config.ts:20`), thresholds `12/55/25/12`: `components/`, `pages/` e `hooks/` ficam fora —
  cobertura verde não cobre a UI.
- **`npm ci` está quebrado:** as execuções recentes do `ci.yml` falham no step `Install dependencies` e
  `npm ci --dry-run` aborta localmente em `#loadPeerSet` (peer do `vitest@5.0.3`; lockfile **não** está
  dessincronizado). Convivem `package-lock.json`, `bun.lock` e `bun.lockb` sem
  `packageManager` declarado — corrigir exige escolher um gerenciador (decisão do dono).
- `node scripts/check-agents-integrity.mjs` vigia estas instruções: exige os cabeçalhos deste arquivo e
  barra o conjunto vigiado (`AGENTS.md`, `CLAUDE.md`, `docs/agentes/*.md` e os dois `SKILL.md`) encolher
  mais de **30%** em bytes, ou qualquer arquivo dele encolher mais de **50%**, contra a base — proteção
  contra wipe por sessão paralela. Rode ao mexer em qualquer um deles.
