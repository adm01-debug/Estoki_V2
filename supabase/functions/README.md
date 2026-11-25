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
`deploy-functions.yml` / `edges-guarda-cron.yml`), com verificacao de que existe
`index.ts` antes de enviar. Nunca `deploy --all`: publicaria 153 endpoints novos
de uma vez.

## 3. Guarda de sessao nao cobre cron

`pg_cron` chama a funcao por HTTP sem sessao de usuario. Quem depende de cron leva
`verify_jwt = false`, guarda no codigo e credencial no header enviado pelo job
(hoje: service role lido de `vault.decrypted_secrets`).