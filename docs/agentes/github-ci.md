# GitHub, CI e workflows — referência para agentes

Ler quando mexer em `.github/workflows/`, settings do repo, ou quando um merge ou um workflow falhar
de forma estranha.

## Escrita no GitHub

- Repo **`adm01-debug/Estoki_V2`**, **privado**, branch padrão `main`. `homepage` do repo aponta para
  `https://estoki-v2.vercel.app`, que **não** está na lista de domínios do projeto Vercel — ver
  `docs/agentes/deploy.md`.
- **Escrita: somente MCP `GITHUB - MCP - FOREVER`** (`github_push_files`: aceita `files` + `delete` no
  mesmo commit, 1 commit atômico). O MCP padrão do GitHub devolve 403 em write. `github_push_files`
  sobrescreve o arquivo — mande o conteúdo integral com apenas a mudança semântica e confira depois que
  o arquivo remoto bate com o que você testou.
- Para listar PRs abertas com os arquivos que cada uma toca em **uma** chamada, use `github_graphql`
  (`pullRequests(states:OPEN){ nodes { number headRefName files { nodes { path } } } }`).
  `github_list_pull_requests` devolve o repositório inteiro em cada nó e estoura o contexto.
- Commits em PT-BR, Conventional Commits. Tipos aceitos pelo `CONTRIBUTING.md:21-22`:
  `feat fix perf refactor test docs chore ci`. **Não há hook de `commit-msg` neste repo** (ver abaixo) —
  o padrão é convenção, não é cobrado por máquina. Siga mesmo assim.

## Perímetro do GitHub — estado canônico (verificado nesta sessão via API)

| Campo                       | Estado real                                                                                                                                   | Observação                                                                                               |
| --------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------- |
| Visibilidade                | `private`                                                                                                                                     | —                                                                                                        |
| Branch protection em `main` | **nenhuma** (`GET /branches/main/protection` → 404 "Branch not protected")                                                                    | não há required check, nem `enforce_admins`, nem histórico linear                                        |
| Rulesets                    | **nenhum** (`GET /rulesets` → `[]`)                                                                                                           | —                                                                                                        |
| Merge                       | `allow_squash_merge=true` · `allow_merge_commit=true` · `allow_rebase_merge=true` · `allow_auto_merge=false` · `delete_branch_on_merge=false` | merge commit e rebase estão **abertos**; a regra de squash-only é do dono, não do repo                   |
| Squash                      | `squash_merge_commit_title=COMMIT_OR_PR_TITLE` · `squash_merge_commit_message=COMMIT_MESSAGES`                                                | diferente do Zapp (que usa PR_TITLE/PR_BODY)                                                             |
| Environments                | **4**: `copilot` · `Preview` · `Production` · `staging`                                                                                       | **nenhum tem protection rule** (`protection_rules: []`), nem revisor obrigatório, nem política de branch |
| PRs abertas                 | **10**, todas do `dependabot`, todas tocando só `package.json` + `package-lock.json`                                                          | nenhuma toca `src/`, `supabase/` ou docs                                                                 |
| Issues abertas              | **0** (o `open_issues_count=10` do repo conta as PRs)                                                                                         | —                                                                                                        |

**Consequência prática:** nada no GitHub impede um push direto em `main` nem um merge com CI vermelha.
A disciplina é inteiramente das regras do `AGENTS.md`. Não trate "o merge passou" como "o CI aprovou".

## Workflows — 3 arquivos

| Arquivo                                | Gatilho                                | O que faz                                                                                                                                                                                                                                                                                      |
| -------------------------------------- | -------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `ci.yml` ("CI Pipeline")               | push e PR em `main`/`master`/`develop` | job `validate`: `npm ci` → `format:check` → `lint` → `typecheck` → `test` → `build`. Job `e2e-tests` (matriz `preview`/`build`, depende de `validate`): Playwright com `SUPABASE_URL`/`SUPABASE_ANON_KEY` dos secrets, sobe relatório HTML e artefatos de falha                                |
| `qa.yml` ("QA Checklist (PR)")         | PR em `main`/`master`/`develop`        | roda tudo com `continue-on-error: true`, consolida em `.qa-report/` via `scripts/qa-report.mjs`, comenta/atualiza um único comentário no PR, e **só no fim** derruba o job                                                                                                                     |
| `cd.yml` ("CD — Staging & Production") | push em `main` e `workflow_dispatch`   | `build` (lint, typecheck, test, build, `size-limit`, artefato `dist-<sha>`) → `deploy_staging` (smoke em staging) → `deploy_production` (só via dispatch com `environment=production`; smoke + `gh release create`). A publicação em si é da hospedagem Lovable — ver `docs/agentes/deploy.md` |

### Quais checks realmente barram a PR

`qa.yml` tem um passo final ("Falhar se qualquer verificação crítica quebrou", `qa.yml:165-172`) que
reavalia os outcomes. **Bloqueiam:** `lint`, `typecheck`, testes unitários, `build`, `rls-audit`,
`dep-audit`. **São informativos** (rodam, relatam, não barram): `size-limit`, cobertura Zod, `i18n:check`,
`i18n:hardcoded`, `migrations-todo-check`, E2E smoke, `npm audit`.

Note a pegadinha: `scripts/migrations-todo-check.mjs` faz `process.exit(1)` por violação, mas **não está
na lista de gates** — então na prática não barra nada.

## Fatos que já custaram retrabalho

- **`npm ci` está quebrado neste repo — e é o primeiro passo de todos os três workflows.** As três
  últimas execuções do `ci.yml` (05/10/2026, PRs do dependabot) terminaram em `failure` no step
  **`Install dependencies`** — ex.: https://github.com/adm01-debug/Estoki_V2/actions/runs/37379691205.
  Reproduzido localmente nesta sessão com Node 22.23.4 / npm 10.9.9: `npm ci --dry-run` aborta com
  `npm error Cannot read properties of null (reading 'edgesOut')`. `ESTADO_ATUAL.md` registra o sintoma
  como `EUSAGE: package.json and package-lock.json are not in sync`. **A causa raiz não foi confirmada
  nesta sessão** — antes de qualquer patch, rode `npm ci` e leia o erro atual.
- **Convivem três lockfiles:** `package-lock.json` (1,0 MB), `bun.lock` (592 KB) e `bun.lockb` (199 KB).
  O CI usa `npm ci` com `cache: npm` e Node **20**; o `package.json` não declara `packageManager`.
  Manter os três sincronizados não é possível na prática — qualquer correção de dependência precisa
  decidir **um** gerenciador primeiro (decisão do dono).
- **Não existe hook de git.** Não há `.husky/`; `package.json` tem `"prepare": "echo 'skip husky'"`; nem
  `husky` nem `lint-staged` estão em `devDependencies`. Logo `.lintstagedrc` **e** `.lintstagedrc.json`
  (que existem, e divergem entre si nos globs) são **config morta**, e `git commit --no-verify` é inócuo.
  Nada é validado no commit: lint/format só no CI.
- **Nenhum workflow aplica DDL nem faz deploy de edge function.** Confirmado por grep em `.github/`:
  zero ocorrência de `db push`, `apply_migration`, `supabase link`, `supabase/setup-cli` ou
  `functions deploy`. Migration e edge function são, hoje, aplicadas à mão.
- **`qa:all` não é o CI.** `npm run qa:all` = `lint + typecheck + test:coverage + build + size + qa:rls +
audit:deps`; **não** inclui `i18n:check`, `i18n:hardcoded` nem `audit:zod`, que o `qa.yml` roda.
- **`npm audit` é inútil aqui** (o mirror devolve 404): o gate real de supply chain é
  `scripts/dep-audit.mjs` (`npm run audit:deps`), bloqueante. Exceção só em `.dep-audit-allowlist.json`
  com justificativa em `docs/SECURITY.md`. Sem rede, o script sai 0 — ou seja, **ausência de falha não é
  evidência de ausência de advisory**.

## Dependabot

`.github/dependabot.yml`: npm semanal (segunda), limite de **10** PRs, grupos `radix-ui`, `testing`,
`types`, com major de `react`/`react-dom` ignorado; GitHub Actions semanal, limite 5. As 10 PRs abertas
hoje são exatamente esse limite saturado — e todas com CI vermelha pelo `npm ci`. Enquanto o `npm ci` não
for corrigido, **nenhuma PR do dependabot pode ser mergeada com CI verde**.

## Guardas que você pode rodar antes da PR

```
npm run lint
npm run typecheck
npm run test
npm run qa:rls
npm run audit:deps
node scripts/check-agents-integrity.mjs
```

`scripts/check-agents-integrity.mjs` vigia `AGENTS.md` + `CLAUDE.md` + `docs/agentes/*.md`: exige os
cabeçalhos obrigatórios do `AGENTS.md` e barra o conjunto encolher mais de 30% (ou um arquivo encolher
mais de 50%) em relação à base — proteção contra wipe por sessão paralela.
