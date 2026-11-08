# Deploy, hospedagem e build — referência para agentes

Ler quando for confirmar um deploy, mexer em env var de hospedagem, domínio, PWA ou budget de bundle.

## Onde o front roda — estado real (verificado nesta sessão)

| O que                        | Valor                                                                                                                                              |
| ---------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------- |
| Hospedagem declarada no CI   | **Lovable** — `cd.yml:56` e `cd.yml:77` dizem "publish handled by Lovable hosting"                                                                 |
| URL de produção no CI        | `https://estoki.lovable.app` (`cd.yml:78`)                                                                                                         |
| URL de staging no CI         | `https://staging.estoki.lovable.app` (`cd.yml:60`)                                                                                                 |
| Projeto Vercel               | **`estoki-v2`** — `prj_ieFhclSWA3KUvArgWbzHYBkx2Nd8`, team `juca` (slug `juca1`, `team_QyN41X0q8hrqhW80AwokbFLv`), framework `vite`, Node **24.x** |
| Domínios do projeto Vercel   | `estoki-v2-juca1.vercel.app`, `estoki-v2-git-main-juca1.vercel.app`                                                                                |
| Último deploy na Vercel      | `readyState: ERROR`, `target: null`; o projeto está com **`live: false`**                                                                          |
| `homepage` do repo no GitHub | `https://estoki-v2.vercel.app` — **não** consta nos domínios do projeto                                                                            |
| Proteção na Vercel           | `ssoProtection: all_except_custom_domains` (preview exige login no time)                                                                           |

**Isto é uma contradição não resolvida: o CI diz Lovable, o repo aponta para a Vercel, e o último deploy
da Vercel falhou.** Nenhuma das três URLs pôde ser testada por HTTP nesta sessão (a rede do container
bloqueia `estoki.lovable.app`, `staging.estoki.lovable.app` e `estoki-v2.vercel.app`) — portanto **qual é
a produção viva hoje é NÃO VERIFICADO**. Antes de dizer "deploy confirmado", abra a URL e cite o que viu.
Decidir qual hospedagem é a oficial é decisão do dono.

Não há `vercel.json` nem `netlify.toml` no repo. `package.json:43` tem um `deploy:preview` que chama
`netlify deploy` — resíduo, não use.

## Como o deploy acontece

- **Push em `main`** → `cd.yml`: job `build` (lint, typecheck, test, build, `size-limit`, artefato
  `dist-<sha>`) → `deploy_staging` (baixa o artefato, smoke `curl` em staging). Merge em `main` = produção
  (ou pelo menos staging) — trate todo merge como ato de produção.
- **Produção** só por `workflow_dispatch` com `environment=production`: smoke + `gh release create
release-<data>-<sha7>`. O environment `Production` **não tem revisor obrigatório** (ver
  `docs/agentes/github-ci.md`) — o "gate manual" é só o fato de precisar disparar à mão.
- **Rollback** está documentado como comentário no fim do `cd.yml`: re-rodar o dispatch apontando para a
  tag boa anterior; a hospedagem republica aquele bundle; exige registro em `CHANGELOG.md`.
- **Edge functions não têm deploy automático.** Nenhum workflow roda `supabase functions deploy` — ver
  `docs/agentes/edge-functions.md`.

## Env vars

- Só `VITE_*` chega ao bundle, e **`VITE_*` é público** — nunca segredo com esse prefixo.
- Secrets de servidor vivem **apenas** nos secrets das Edge Functions (`supabase secrets set` ou painel):
  `CORREIOS_USER`, `CORREIOS_TOKEN`, `RESEND_API_KEY`, `METRICS_TOKEN`, `WEBHOOK_SECRET`,
  `SUPABASE_SERVICE_ROLE_KEY` (`.env.example:30-33`).
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
  `vite.config.ts:188-201` registra que separar mais causou o crash de produção
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
  **está quebrado**: faz `COPY nginx.conf` e **`nginx.conf` não existe no repo**; além disso usa Node 18
  contra o requisito Node 20+. Não há `docker-compose*`.
- `Dockerfile.dev` expõe **5173**, mas o Vite deste repo serve em **8080**.
- `capacitor.config.ts` é PoC: `appId: app.lovable.d9a2e2d9...`, `appName: cart-bloom-connect` (nem
  "estoki"), e `server.url` apontando para o sandbox `*.lovableproject.com` com `cleartext: true` e
  `allowMixedContent: true` — é config de hot-reload em device, **não** de app publicável.
