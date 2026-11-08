# Banco de dados — referência para agentes

Ler antes de rodar SQL, criar/aplicar migration ou mexer em RLS. Resumo das regras no `AGENTS.md`;
aqui está o detalhe. Este repo tem armadilhas reais de banco — leia a seção "Armadilhas" antes de agir.

## Banco OFICIAL

| O que            | Valor                                                                                                                                                                      |
| ---------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Projeto Supabase | **`ookjbflsnoefnsixrspc`** (Supabase Cloud) — `supabase/config.toml:1`                                                                                                     |
| URL              | `https://ookjbflsnoefnsixrspc.supabase.co` (pré-conectada em `index.html:75,78`)                                                                                           |
| Dashboard        | https://supabase.com/dashboard/project/ookjbflsnoefnsixrspc                                                                                                                |
| MCP para SQL     | **`supabase-estoki`**, declarado em `.mcp.json` (worker `supabase-estoki-v2-mcp.adm01.workers.dev`); habilitado por `.claude/settings.json` (`enableAllProjectMcpServers`) |
| Tipos gerados    | `src/integrations/supabase/types.ts` (≈143 KB, exporta `Database`)                                                                                                         |
| Cliente do front | `src/integrations/supabase/client.ts` — lê `VITE_SUPABASE_URL` + `VITE_SUPABASE_ANON_KEY` e lança erro no load se faltar                                                   |

### Bancos que NÃO são deste projeto (nunca escrever neles)

Vários MCP de Supabase podem estar carregados na mesma sessão. **Confira qual MCP respondeu antes de
rodar SQL.** Nenhum dos abaixo é o Estoki:

- `pgxfvjmuubtbowutlide` — MCP "SUPABASE - GESTÃO DE CLIENTES" (CRM de outro sistema).
- `doufsxqlfjyuvxuezpln` — MCP "SUPABASE - GESTÃO DE PRODUTOS" (catálogo de outro sistema).
- `tnnnlkbymytvtqngbbqh` — MCP "SUPABASE - ZAPP WEB V2 - MCP" (banco do Zapp Web V2).
- `wrhidiguevvnqywlueps` — aparece em `public/openapi.json:11` (exemplo de documentação, não é o banco real).
- `oztttjpqtbubfyhiypld` — aparece em `supabase/functions/health-check/index.test.ts:6` (fixture de teste).

## Onde se trabalha

| Situação                                    | Onde                                               | Como                                                             |
| ------------------------------------------- | -------------------------------------------------- | ---------------------------------------------------------------- |
| Diagnóstico                                 | **produção, só leitura**                           | `SELECT` pelo MCP `supabase-estoki`; nunca escrita para "testar" |
| Migration nova                              | arquivo em `supabase/migrations/`                  | PR → merge → aplicar (seção "Regras de migration")               |
| Teste de comportamento de banco             | Postgres descartável / stack local do Supabase CLI | nunca no banco oficial                                           |
| DDL destrutivo, segredos, rotação de chaves | **só com o dono**                                  | —                                                                |

## Migrations — estado real

- **163 arquivos** em `supabase/migrations/`, sem subpastas e sem arquivo não-`.sql`.
- 145 têm nome gerado (`<timestamp 14 dígitos>_<uuid>.sql`, assinatura Lovable/Studio); 18 têm nome
  descritivo. Primeiro: `20240115000001_notifications.sql`. Último: `20260726161907_...sql`.
- **Não existe ledger, manifesto ou catálogo de schema commitado** neste repo (diferente do Zapp Web V2).
  `ESTADO_ATUAL.md:65-67` registra que `supabase_migrations.schema_migrations` **não existe** no banco de
  produção (erro `42P01`) e que as 163 migrations não têm registro de aplicação. **NÃO VERIFICADO nesta
  sessão** (a sessão não tem MCP do Estoki carregado para conferir no banco) — confirme com um `SELECT`
  antes de concluir qualquer coisa a partir disso.
- Há **5 pares** que criam a mesma tabela em arquivos diferentes, e não só no começo da série:
  `20240115000001_notifications` × `20240115_notifications`; `20240115000002_audit_logs` ×
  `20240116_audit_logs`; `20240115000003_inventory_counts` × `20240117_inventory_count`;
  `20241231000000_saved_filters` × `20251231000001_create_saved_filters_table`;
  `20241231000001_entity_versions` × `20251231000002_create_entity_versions_table`. Todos usam
  `IF NOT EXISTS`, então o segundo é no-op se o primeiro rodou — e o schema efetivo depende da ordem.
  A causa é a série misturar `AAAAMMDDHHMMSS` (14 dígitos) com `AAAAMMDD` (8): **use sempre 14 dígitos**.

## Regras de migration

1. **Toda mudança de DDL nasce como arquivo em `supabase/migrations/`.** DDL aplicado fora disso vira
   drift invisível: não existe guard de drift neste repo e o `rls-audit` (abaixo) lê _arquivo_, não banco.
2. **Ordem: arquivo → PR → merge em `main` → deploy do código → aplicar o DDL.** Nunca aplicar DDL de
   branch aberta. `REVOKE`, `DROP`, rename ou mudança de contrato de função usada pelo front/edge
   functions: nunca antes do deploy do código correspondente.
3. **Nenhum workflow aplica DDL.** `.github/workflows/` não tem `supabase db push`, `apply_migration`,
   `supabase link` nem deploy de edge function (confirmado por grep). `cd.yml:56,77` dizem
   explicitamente que a publicação é da hospedagem Lovable. Aplicar migration é, hoje, **ato manual** —
   e portanto ponto único de erro: registre o que aplicou na PR.
4. **Antes de criar arquivo de migration:** confira o maior timestamp (`ls supabase/migrations | tail`) e
   se há PR aberta tocando `supabase/migrations/`. Sessões paralelas usam o mesmo repo e o mesmo banco.
5. Migrations são **append-only** — regra que existe só como comentário em
   `scripts/migrations-todo-check.mjs:5`; **nenhum guard impede editar um `.sql` já aplicado**. O que o
   script faz é falhar se um `.sql` contiver
   `TODO|FIXME|XXX|HACK|PENDING` (allowlist de 2 arquivos em `scripts/migrations-todo-check.mjs:19-22`).
6. `npm run db:migrate` é `supabase db push` **sem `--local`** (`package.json:39`) → mira o projeto
   linkado, isto é, produção. `npm run db:reset` (`package.json:41`) é destrutivo no alvo linkado.
   **Não rode nenhum dos dois para "testar".** Só `db:generate` usa `--local` (`package.json:38`) — o que
   significa que regenerar tipos a partir do script oficial lê o stack **local**, não a produção.

## RLS e guardas de banco

| Script                              | O que faz                                                                                                                                                            | Falha quando                                                                                                                       |
| ----------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------- |
| `scripts/rls-audit.mjs`             | Estático: lê só `supabase/migrations/*.sql` e cruza `CREATE TABLE` × `ENABLE ROW LEVEL SECURITY` × `CREATE POLICY` × `DROP TABLE`. Escreve `.qa-report/rls-audit.md` | exit 1 **só** se houver tabela sem `ENABLE ROW LEVEL SECURITY` (`rls-audit.mjs:75-78`). Tabela com RLS e **sem policy** é só aviso |
| `scripts/audit-zod.mjs`             | Cobertura de validação Zod nas edge functions; escreve `.qa-report/zod-coverage.md`                                                                                  | **nunca** (exit 0 sempre)                                                                                                          |
| `scripts/migrations-todo-check.mjs` | Marcador pendente em migration                                                                                                                                       | exit 1 por violação, mas **não está na lista de gates** do `qa.yml` → na prática não barra a PR                                    |

**Limites de evidência do `rls-audit` — três, e todos deixam passar:**

1. **Ele lê texto de migration, não banco.** Com as migrations sem registro de aplicação (acima), o gate
   fica verde com o banco divergente. Para afirmar que uma tabela tem RLS em produção, consulte
   `pg_policies`/`pg_class` pelo MCP — não o relatório.
2. **Os 4 regexes exigem o prefixo `public.`** (`rls-audit.mjs:33-37`). Tabela criada como
   `CREATE TABLE <nome>` sem schema é **invisível ao gate**: não é contada nem checada. Hoje são 10
   (`notifications`, `audit_logs`, `audit_log`, `inventory_counts`, `inventory_count_items`,
   `stock_reservations`, `import_logs`, `saved_filters`, `entity_versions`, `feature_flags`) — todas com
   RLS nas suas migrations, então não há exposição ativa; mas uma migration nova sem `public.` e sem RLS
   **passa verde**. Escreva sempre `public.<tabela>`.
3. **Os relatórios commitados em `.qa-report/` estão velhos.** Rodando os scripts agora: `rls-audit` dá
   85 tabelas ativas (o `.qa-report/rls-audit.md` versionado diz 76) e `audit-zod` dá 248/209/209 (o
   arquivo diz 244/212/212). Rode, não leia o arquivo.

## Armadilhas (verificadas no código)

1. **Credencial de produção em claro no repo:** `scripts/apply_rls_helper.cjs:18` tem a connection string
   Postgres do projeto `ookjbflsnoefnsixrspc` **com a senha** hardcoded e roda
   `supabase db query --db-url <produção> --file` — DDL direto em produção, sem migration. A senha está
   num `.cjs` versionado, não no `.env`. **Nunca copie, nunca imprima, nunca execute esse script.**
   Rotação da senha e remoção do histórico: só com o dono.
2. **Os 23 scripts `seed-*.cjs` / `probe-*.cjs` apontam para produção.** Todos usam
   `createClient(process.env.VITE_SUPABASE_URL, ...)` — a mesma URL do front — e 22 deles usam
   `SERVICE_ROLE_KEY`, que **bypassa RLS**. Não existe variável separada de dev/staging nem nenhum check
   de ambiente. `scripts/seed-db.cjs:15-16` imprime "não execute em produção", mas o alvo efetivo é a
   produção. Antes de rodar qualquer `seed-*`/`probe-*`: confirme com o dono.
3. **SQL solto fora de `supabase/migrations/`** (não é alcançado por `db push` nem pelo `rls-audit`):
   `scripts/create_cadastros_tables.sql` (cria as **mesmas 4 tabelas** da migration
   `20260520120000_create_cadastros_tables.sql` — `categorias`, `armazens`, `clientes`,
   `serial_numbers` — mas **sem `ENABLE ROW LEVEL SECURITY`, sem as 16 policies e sem os 4 triggers de
   `updated_at`**; aplicá-lo no lugar da migration deixa 4 tabelas abertas),
   `scripts/create_cadastros_rls.sql` (aplicado pelo `apply_rls_helper.cjs`), `scripts/rls-fix-users.sql`
   (policies `USING (true)` para `authenticated`) e `scripts/rls-fix-profile-update.sql`. Nenhum deles é
   fonte de verdade; não os trate como migration.
4. **`supabase/seed.sql` existe** (6.677 B, 10 `INSERT INTO`, cabeçalho "popula o banco com dados
   iniciais para produção") e é o que `npm run db:seed` e `supabase db reset` executam contra o **alvo
   linkado**. Ele insere em `categories`, `units_of_measure` e afins — tabelas que `ESTADO_ATUAL.md:82-88`
   lista como nunca declaradas em migration, então provavelmente falha. Não rode.

## O que estes docs não respondem (saiba antes de prometer)

- **Qual é o caminho sancionado para aplicar uma migration.** O fluxo é `arquivo → PR → merge → deploy do
código → apply`, mas nenhum workflow aplica DDL e `db:migrate` está proibido. O último passo depende do
  dono definir o meio (MCP, painel ou `db push` com `--db-url` próprio). Não improvise.
- **Como regenerar `src/integrations/supabase/types.ts` sem stack local.** `db:generate` usa `--local`
  (`package.json:38`). Sem instrução alternativa, mudar schema deixa os 142 KB de tipos desalinhados.
