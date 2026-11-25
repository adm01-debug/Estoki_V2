# diag - provas de producao (somente leitura)

Recuperado dos branches `claude/diag-probe-seguranca` e `claude/diag-e2e-real-261124-1745` (trabalho
de outro agente que nunca chegou a `main`). Rodar pelo workflow manual `.github/workflows/diag-producao.yml`
ou a mao.

| Script                          | Env                                         | Efeito               | Prova                                                                            |
| ------------------------------- | ------------------------------------------- | -------------------- | -------------------------------------------------------------------------------- |
| `probe-refs.sh`                 | `S_URL S_KEY V_URL V_KEY V_PID` (opcionais) | leitura              | a que projeto do Supabase cada secret aponta (nunca imprime a chave)             |
| `probe-anon.sh`                 | `SB_URL SB_ANON`                            | leitura              | quais RPCs a chave publica executa sem sessao e o RLS de `system_settings`       |
| `probe-auth.sh`                 | `SB_URL SB_ANON EU EP`                      | leitura              | login real e o que um JWT de usuario consegue ler/chamar                         |
| `probe-db.sh`                   | `SUPABASE_ACCESS_TOKEN SB_URL`              | leitura              | catalogo, grants de `anon`/`authenticated`, RLS, policies e migrations aplicadas |
| `dryrun-migration.sh <arquivo>` | `SUPABASE_ACCESS_TOKEN SB_URL`              | `begin ... rollback` | a migration aplica, os grants resultantes e que nada ficou persistido            |

Contrato:

- `SUPABASE_ACCESS_TOKEN` e o token da Management API (`secrets.SUPABASE_MANAGEMENT_TOKEN`). O caminho
  `scripts/db-audit` (psql) ainda nao roda porque `DESTINO_URL` nao existe no repositorio; este e o
  caminho que funciona hoje para provar "repo = banco".
- `dryrun-migration.sh` recusa arquivo fora de `supabase/migrations/` e arquivo com `COMMIT`/`ROLLBACK`/
  `END`/meta-comando psql, que anulariam o `ROLLBACK` e deixariam DDL aplicada.
- Nao versionados de proposito: `probe-signup.sh` (cria usuario em `auth.users` de producao e nao
  limpa; o caminho vivo e `E2E_USER_EMAIL`/`E2E_USER_PASSWORD` + `tests/e2e/auth-real.spec.ts`),
  `_mig_teste.sql` (fixture de teste; o script ja recebe o arquivo) e `supabase/functions/migrate-helper`
  (removida em #182 por expor `service_role`).
