# Edge Functions

Regras que a auditoria usa como referencia. Os numeros abaixo sao medidos em
producao (`ookjbflsnoefnsixrspc`), nunca estimados: para refazer a medicao,
`SUPABASE_ACCESS_TOKEN=... node scripts/inventario/gerar-banco.mjs` — o bloco
`edge_functions` do relatorio traz `publicadas`, `no_repo` e
`publicadas_sem_codigo_no_repo`.

Medicao de 24/11/2026: **247 fontes neste diretorio, 94 publicadas no projeto,
153 nunca publicadas, 0 publicadas sem fonte no repo.**

## 1. `verify_jwt = false` exige guarda no codigo

A chave publica do site (`sb_publishable_*`, que vai no bundle) passa pelo gateway.
Logo `verify_jwt` nao separa visitante de usuario: funcao sem JWT declarado em
`supabase/config.toml` e sem checagem propria fica executavel por qualquer um.
Toda funcao nessa condicao chama `exigirSessao` (ou checa o header, no caso das
`webauthn-*`, que rodam antes do login) de `_shared/auth.ts`.

Achado de 25/11/2026, antes dessa correcao: `reorder-check` respondia HTTP 200 com
produto/estoque/fornecedor para quem mandasse so a chave publica, e `stock-alert`
e `alert-expiration` executavam e gravavam.

## 2. Fonte no repo nao significa publicada

As 153 fontes sem deploy sao trabalho versionado que nunca subiu — nao viram
endpoint sozinhas. Deploy e sempre por lista explicita (workflows
`deploy-functions.yml` / `edges-guarda-cron.yml` / `edges-produtos-sync.yml`), com
verificacao de que existe `index.ts` antes de enviar. Nunca `deploy --all`:
publicaria 153 endpoints novos de uma vez.

## 3. Guarda de sessao nao cobre cron

`pg_cron` chama a funcao por HTTP sem sessao de usuario. Quem depende de cron leva
`verify_jwt = false`, guarda no codigo e credencial no header enviado pelo job
(hoje: service role lido de `vault.decrypted_secrets`).

## 4. Superficie publica, medida em 25/11/2026

Sweep das 94 publicadas com a chave publica do site (`sb_publishable_*`, POST `{}`):

| Resposta | Quantas | Leitura |
| --- | --- | --- |
| 404 | 38 | removidas de producao (lista `remover` de 24/11; hoje `removido`) |
| 401 | 38 | guarda de sessao no codigo (`exigirSessao`) |
| 400 | 9 | `auth-*`/`webauthn-*` pre-login: validacao de payload recusou `{}` |
| 403 | 1 | `backend-health` (papel insuficiente) |
| 200 | 8 | `health` (probe) + 7 stubs sem corpo: 4 `integration-*`, `auth-logout`, `auth-session-list`, `auth-session-revoke` |

As 38 marcadas `removido` nao existem mais em producao; o fonte continua no repo
(redeploy: `npx supabase@3.1.0 functions deploy <slug> --project-ref ookjbflsnoefnsixrspc --use-api`).
As 7 que respondiam 200 sem executar nada nao tem chamador no repo nem no app e
estao marcadas `remover`.

Nao confundir casca com stub: `auth-login` valida o payload com rate limit e chama
`supabase.auth.signInWithPassword` de verdade, e `auth-2fa-*` exige sessao (HTTP 401
sem ela). As 3 removidas nesta rodada eram as unicas `auth-*` sem nenhuma acao —
devolviam `{success:true}` e ecoavam a entrada. O app autentica pelo GoTrue
(`supabase.auth`), nunca por `/functions/v1/auth-*`.

Heuristica de "funcao sem acesso a dados" (`grep '.from(' | '.rpc(' | 'fetch('`)
da falso-positivo: `auth-login` so usa `supabase.auth.*` e aparece como casca. Antes
de marcar algo como stub, ler o `index.ts`.