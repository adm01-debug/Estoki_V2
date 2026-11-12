# db-audit — artefatos do banco e prova de identidade

Portado do Zapp Web V2. Mantém três artefatos do banco oficial (`ookjbflsnoefnsixrspc`) versionados
no repo, para quem for mexer em SQL saber o que existe **em produção** sem abrir o painel:

| Artefato | Gerado por | O que é |
|---|---|---|
| `supabase/schema-catalog.json` | `catalog.sql` | catálogo: tabelas, colunas, views, funções, enums |
| `supabase/schema-manifest.json` | `manifest.sql` | manifesto v2, 17 seções fechadas (colunas, defaults, constraints, índices, RLS, policies, triggers, funções e os 6 tipos de grant) |
| `scripts/db-audit/grants-baseline.json` | `grants-baseline.sql` | ACL: o que `anon`, `authenticated` e `service_role` podem executar e ler |

Quem compara e propõe a atualização é o workflow `.github/workflows/db-manifesto.yml` (cron semanal
+ push em `supabase/migrations/**`). Ele abre PR e **deixa aberta**: mudança de catálogo ou de grants
merece leitura humana.

## Contrato dos comparadores

`check-catalog-fresh.mjs`, `check-manifest-fresh.mjs` e `check-grants-fresh.mjs` recebem o arquivo
recém-gerado do banco e comparam com o commitado:

- `0` = igual e identidade comprovada
- `1` = divergência revisável → pode virar PR
- `2` = entrada inválida ou identidade não comprovada → **nunca** atualiza artefato

Comparam **conjuntos**, não bytes: formatação de `jsonb_pretty` não conta como divergência, e
`check-grants-fresh.mjs` ignora `generated_at`/`note`/`how_to_regenerate` (metadados que mudam a cada
geração e já derrubaram a `main` do projeto de origem).

## Segurança do caminho da credencial

- `database-identity.json` guarda o project-ref como **SHA-256**, nunca em claro, mais `database`,
  `schema` e `server_major` esperados. `database-identity.mjs` prova a identidade do endpoint antes
  de qualquer consulta e endurece a conexão para `sslmode=verify-full` com a CA Supabase versionada
  em `certs/`, pinada por SHA-256 do arquivo e por `fingerprint256`.
- `psql-environment.mjs` traduz a connection string em `PGHOST`/`PGUSER`/`PGPASSFILE`: a credencial
  **nunca entra no argv** (visível em `ps`). `psql-safe.mjs` é o proxy para usar no lugar de
  `psql "$DESTINO_URL"`.
- No workflow, o job que toca a credencial tem `permissions: contents: read` e entrega os candidatos
  por artifact; o job que escreve no repo não vê a credencial.

## Rodar à mão

```bash
export DESTINO_URL='postgresql://...'   # porta 5432 ou 6543 session-mode
node scripts/db-audit/psql-safe.mjs -X -v ON_ERROR_STOP=1 -At -f scripts/db-audit/manifest.sql > /tmp/manifest.new.json
node scripts/db-audit/check-manifest-fresh.mjs /tmp/manifest.new.json   # 0 | 1 | 2
node scripts/db-audit/diff.mjs supabase/schema-manifest.json /tmp/manifest.new.json
```

Testes (não precisam de banco nem de rede):

```bash
node --test scripts/db-audit/*.test.mjs
```

## Estado desta porta — leia antes de confiar

- **Os três SQLs nunca foram executados neste banco.** Vieram prontos do Zapp Web V2 (catálogo puro,
  sem nome de tabela de domínio) e passaram só por conferência estática. O primeiro run do
  `db-manifesto.yml` com `DESTINO_URL` é a prova real.
- **`server_major: 17` em `database-identity.json` é suposição**, não medição: não havia acesso ao
  banco quando este arquivo foi portado. Se o projeto roda outra versão, o guard falha fechado com
  `identidade ... server_major esperado=17 obtido=<X>` — corrija o número no JSON, nada é corrompido.
- `gen-types.sh` (geração de `src/integrations/supabase/types.ts` a partir do banco) **não** foi
  portado: depende de Supabase CLI pinada + Docker + proxy pgbouncer local. O repo continua com
  `npm run db:generate` (CLI contra o banco local).
