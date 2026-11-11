# Deploy, hospedagem e build — referência para agentes

Ler quando for confirmar um deploy, mexer em env var de hospedagem, domínio, PWA ou budget de bundle.

## Onde o front roda — estado real (verificado nesta sessão)

| O que                        | Valor                                                                                                                                                                                                                       |
| ---------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hospedagem declarada no CI   | **Lovable** — `cd.yml:56` e `cd.yml:77` dizem "publish handled by Lovable hosting"                                                                                                                                          |
| URL de produção no CI        | `https://estoki.lovable.app` (`cd.yml:69` e `cd.yml:80`)                                                                                                                                                                    |
| URL de staging no CI         | `https://staging.estoki.lovable.app` (`cd.yml:48` e `cd.yml:59`)                                                                                                                                                            |
| Projeto Vercel               | **`estoki-v2`** — `prj_ieFhclSWA3KUvArgWbzHYBkx2Nd8`, team `juca` (slug `juca1`, `team_QyN41X0q8hrqhW80AwokbFLv`), framework `vite`, Node **24.x**                                                                          |
| Domínios do projeto Vercel   | `estoki-v2-juca1.vercel.app`, `estoki-v2-git-main-juca1.vercel.app`                                                                                                                                                         |
| Último deploy na Vercel      | `readyState: BLOCKED`, `target: null` (branch da PR #61); o último com `target: production` é `ERROR` (main @811ae01), mas os dois anteriores estão `READY` e são rollback candidates; o projeto está com **`live: false`** |
| `homepage` do repo no GitHub | `https://estoki-v2.vercel.app` — **não** consta nos domínios do projeto                                                                                                                                                     |
| Proteção na Vercel           | `ssoProtection: all_except_custom_domains` (preview exige login no time)                                                                                                                                                    |

**Isto é uma contradição não resolvida: o CI diz Lovable, o repo aponta para a Vercel, e o último deploy
da Vercel falhou.** Nenhuma das três URLs pôde ser testada por HTTP nesta sessão (a rede do container
bloqueia `estoki.lovable.app`, `staging.estoki.lovable.app` e `estoki-v2.vercel.app`) — portanto **qual é
a produção viva hoje é NÃO VERIFICADO**. Antes de dizer "deploy confirmado", abra a URL e cite o que viu.
Decidir qual hospedagem é a oficial é decisão do dono.

Não há `vercel.json` nem `netlify.toml` no repo. `package.json:42` tem um `deploy:preview` que chama
`netlify deploy` — resíduo, não use.

## Como o deploy acontece

- **Push em `main`** → `cd.yml`: job `build` (lint, typecheck, test, build, `size-limit`, artefato
  `dist-<sha>`) → `deploy_staging` (baixa o artefato, smoke `curl` em staging). **Na prática o `cd.yml`
  está morto desde a quebra do `npm ci`:** o último run (#197, 03/10/2026, `main` @811ae01) falhou no step
  `Run npm ci` do job `build`, e `deploy_staging`/`deploy_production` não rodaram. O que de fato reage a
  push hoje é a integração GitHub→Vercel (deployments `Preview`, hoje `BLOCKED`/`FAILURE`). Trate todo
  merge como ato de produção mesmo assim.
- **Produção** só por `workflow_dispatch` com `environment=production`: smoke + `gh release create
release-AAAAMMDD-HHMMSS-<sha7>`. O environment `Production` **não tem revisor obrigatório** (ver
  `docs/agentes/github-ci.md`) — o "gate manual" é só o fato de precisar disparar à mão. **E esse caminho
  provavelmente nunca executaria:** `deploy_production` tem `needs: [build, deploy_staging]` sem
  `if: always()`, e num dispatch de produção o `deploy_staging` é _skipped_ (`cd.yml:44`), o que o Actions
  propaga ao dependente. Consistente com o estado real: 0 runs de `workflow_dispatch`, 0 releases e 0 tags
  no repo. **NÃO VERIFICADO por disparo** — não disparei nada.
- **Rollback** está documentado como comentário no fim do `cd.yml`: re-rodar o dispatch apontando para a
  tag boa anterior; a hospedagem republica aquele bundle; exige registro em `CHANGELOG.md`.
- **Edge functions não têm deploy automático.** Nenhum workflow roda `supabase functions deploy` — ver
  `docs/agentes/edge-functions.md`.

## Integração GitHub → Vercel

É o **único** caminho que reage a push hoje (o `cd.yml` morre no `npm ci`). Cada branch gera um
deployment e a PR recebe dois checks da Vercel (`Vercel Agent Review`, `Vercel Preview Comments`), mais um
status `Vercel`. Estado observado nesta sessão: deployments recentes `BLOCKED`, e os 119 deployments do
GitHub mais novos são `Preview` com `FAILURE`. O status `Vercel` nas PRs #60/#61 falha com
`GitHub couldn't verify an account for the commit` — é vínculo entre o e-mail do autor do commit e a conta
da Vercel, **não** código. Consequência prática: toda PR nasce com um check vermelho que não é do diff —
leia o nome do check antes de culpar a sua mudança.

Existem deployments de produção `READY` com `isRollbackCandidate: true` no histórico, ou seja, a Vercel já
serviu produção. Qual deployment o alias `estoki-v2-juca1.vercel.app` serve hoje é **NÃO VERIFICADO**
(a rede desta sessão não alcança o host).

## Env vars

- Só `VITE_*` chega ao bundle, e **`VITE_*` é público** — nunca segredo com esse prefixo.
- Secrets de servidor vivem **apenas** nos secrets das Edge Functions (`supabase secrets set` ou painel):
  `CORREIOS_USER`, `CORREIOS_TOKEN`, `RESEND_API_KEY`, `METRICS_TOKEN`, `WEBHOOK_SECRET`,
  `SUPABASE_SERVICE_ROLE_KEY` (`.env.example:32-34`).
- Secrets de Actions no repo (8, nomes verificados): `SUPABASE_URL`, `SUPABASE_ANON_KEY`,
  `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `VITE_SUPABASE_PUBLISHABLE_KEY`,
  `VITE_SUPABASE_PROJECT_ID`, `E2E_USER_EMAIL`, `E2E_USER_PASSWORD`.
- `.env.example` declara `VITE_SUPABASE_PUBLISHABLE_KEY`, mas `src/integrations/supabase/client.ts` lê
  `VITE_SUPABASE_ANON_KEY` — as duas convivem; conferir qual o código usa antes de mexer.
- Feature flags comparam estritamente com a string `"true"` (`src/config/environment.ts:59-61`): var
  ausente = **desligado**. Vale para `gamification`, `pwa`, `offlineMode`.

## Build (`vite.config.ts`) — o que não mexer

- Dev server na porta **8080**, host `::`, alias `@ → ./src`.
- **`manualChunks` é deliberadamente mínimo** (só `recharts`/`d3-` e `framer-motion`). O comentário em
  `vite.config.ts:189-194` (dentro do `manualChunks`, `:188-202`) registra que separar mais causou o crash de produção
  `Cannot read properties of undefined (reading 'forwardRef')`. **Não ampliar.**
- PWA (`vite-plugin-pwa`) só em produção: `sw.js`, `injectRegister: null` (o registro é manual em
  `src/lib/register-sw.ts`), `NetworkFirst` para navegação HTML e para o Supabase, `CacheFirst` só para
  asset com hash.
- Sentry: plugin de build só carrega com `SENTRY_AUTH_TOKEN` + `SENTRY_ORG` + `SENTRY_PROJECT`; senão
  sourcemap fica `hidden` sem upload. Em runtime, só ativa com `PROD === true` **e** `VITE_SENTRY_DSN`.
- `visualizer` só com `ANALYZE=true` (gera `dist/stats.html`); terser com `drop_console`/`drop_debugger`.
- Budget de bundle em `.size-limit.json` (7 alvos, gzip): index 220 KB, vendor-recharts 170 KB,
  vendor-motion 50 KB, exceljs 270 KB, jspdf 140 KB, html2canvas 55 KB, CSS 80 KB. Bloqueante no `cd.yml`
  e no `qa:all`; **informativo** no `qa.yml`.

## Container e mobile — não são caminho de deploy

- `Dockerfile` (multi-stage node:18-alpine → nginx:1.25-alpine, usuário 1001, healthcheck `/health`)
  **está quebrado**: faz `COPY nginx.conf` (`Dockerfile:43`) e **`nginx.conf` não existe no repo**; além
  disso usa Node 18 enquanto os 3 workflows fixam Node 20. O repo **não declara** o requisito: não há
  `engines` no `package.json` nem `.nvmrc`. Não há `docker-compose*`.
- `Dockerfile.dev` expõe **5173**, mas o Vite deste repo serve em **8080**.
- `capacitor.config.ts` é PoC: `appId: app.lovable.d9a2e2d9...`, `appName: cart-bloom-connect` (nem
  "estoki"), e `server.url` apontando para o sandbox `*.lovableproject.com` com `cleartext: true` e
  `allowMixedContent: true` — é config de hot-reload em device, **não** de app publicável.
