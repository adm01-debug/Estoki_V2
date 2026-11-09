# Scripts autônomos — repositório sincronizado com o estado real

Replicado do Zapp Web V2. O objetivo é um só: **um agente de IA que vai mexer neste sistema lê o
estado medido em vez de reconstruí-lo lendo o repo inteiro** (menos retrabalho, menos token, menos
conclusão errada). Nada aqui é escrito à mão; tudo sai de comando, com data e commit no manifesto.

## Três fontes de verdade, três produtores independentes

| Eixo | Produtor | Lê | Escreve |
|---|---|---|---|
| **Código** | `scripts/ai-context/gerar.mjs` | filesystem + `git log` (nenhum secret) | `docs/contexto/codigo/` — 15 JSON + `INDEX.md` + `manifest.json` |
| **Banco vivo** | `scripts/supabase_snapshot/snapshot.py` | Postgres em sessão **read-only** (`SUPABASE_DB_URL`) + Management API opcional | `docs/contexto/supabase/` — `snapshot.json`, `tables/<schema>/<tabela>.md`, `CHANGELOG.md`, `lints.md`, … |
| **Regras de negócio** | `scripts/regras_negocio/generate.py` | `src/`, migrations, `types.ts` e o texto humano de `docs/contexto/regras/manual/` | `docs/contexto/regras/` — `07-REGRAS-DE-NEGOCIO.md`, `10-ACESSO-E-SEGURANCA.md`, `11-GLOSSARIO-E-LACUNAS.md` |
| **Índice** | `scripts/regras_negocio/indice.py` | o `manifest.json` de cada eixo | `docs/contexto/00-INDEX.md` — quem é dono de cada fato + idade/estado de cada fonte |

Quem é dono de quê: tabela/coluna/política existe? → **banco vivo** (migrations do repo são
histórico, não estado). Onde vive e quem usa? → **código**. Pode fazer isso, qual o limite? →
**regras de negócio** (inclui `manual/`, prioridade máxima).

A saída dos três eixos **não é commitada na `main`**: vai para a branch gerada `contexto`
(`.gitignore`). Na `main` fica apenas `docs/contexto/regras/manual/`, escrito por humanos.

## Inventário do estado real (versionado na `main`)

| Arquivo | Produtor | Conteúdo |
|---|---|---|
| `inventario/estado/rotas.json` | `scripts/inventario/gerar-rotas.mjs` | URLs de `src/App.tsx` + `src/routes/*.tsx`, item de menu, papéis/permissão e, por tela, hooks/tabelas/RPCs/buckets/edges alcançados pelos imports |
| `inventario/estado/edges.json` | `scripts/inventario/gerar-repo.mjs` (exige `ripgrep`) | cada edge function: linhas, `Deno.env.get` lidos e quem a invoca |
| `inventario/estado/banco.json` | `scripts/inventario/gerar-banco.mjs` + `banco.sql` | tabelas (RLS, policies, linhas, uso no código), tabelas órfãs, cron, edges publicadas × repo, `alertas` |

Detalhe de cada um em `inventario/estado/README.md`.

## Invariantes que fazem o sistema não virar ruído

1. **Determinismo primeiro.** Chaves ordenadas, listas com ordem explícita, data **só** no
   `manifest.json`. Assim o diff é legível e "nada mudou" significa algo.
2. **Gate de ruído antes de commitar.** `scripts/inventario/mudou-conteudo.mjs` compara com o HEAD
   ignorando carimbos de data e telemetria de janela rolante (`execucoes_24h`, `taxa_falha_7d_pct`,
   `cron.historico.linhas/bytes` e o texto dos alertas que carrega porcentagem). Sem isso o
   inventário abriria PR toda semana por ruído estatístico.
3. **Nenhum robô faz push na `main`.** Inventário entra por PR automática com `add-paths` fechado;
   o contexto para IA vai para a branch gerada `contexto`.
4. **Produtor que falha não apaga o que já existia.** Cada eixo mantém sua pasta anterior e o índice
   marca a fonte como `parcial`/`desatualizado` — nunca "tudo removido".
5. **Prova de identidade antes de consultar banco.** `scripts/db-audit/database-identity.json` guarda
   o project-ref como **sha256** (nunca em claro); credencial nunca entra em `argv`
   (`scripts/db-audit/psql-environment.mjs`) e TLS é `verify-full` com CA pinada por fingerprint.
6. **Nada de segredo na saída.** Os geradores recusam gravar texto com cara de credencial (JWT,
   `Bearer`, `sb_secret_`) e o snapshot nunca imprime linha de tabela, dado de usuário ou
   connection string.
7. **Exit code uniforme nos comparadores:** `0` igual, `1` divergência revisável, `2` entrada
   inválida ou identidade não comprovada — `2` nunca atualiza artefato.

## Quem roda isso sozinho (workflows)

| Workflow | Quando | O que faz | Secret |
|---|---|---|---|
| `.github/workflows/contexto.yml` | push na `main` nos caminhos de contexto · cron a cada 6 h · dispatch | gera os três eixos + índice e publica na branch gerada `contexto` (push direto, nunca PR) | `SUPABASE_DB_URL` (opcional: sem ele o eixo do banco fica verde com warning) |
| `.github/workflows/inventario-estado.yml` | cron segunda 10:23 UTC · dispatch | regera `inventario/estado/*.json` e **abre PR** só se `mudou-conteudo.mjs` achar mudança estrutural | `SUPABASE_ACCESS_TOKEN` (opcional: sem ele só rotas e edges) |
| `.github/workflows/db-manifesto.yml` | push em `supabase/migrations/**` · cron segunda 06:13 UTC · dispatch | lê o banco em sessão somente leitura e abre PR com catálogo/manifesto/grants quando divergirem; a PR **fica aberta** para leitura humana | `DESTINO_URL` (opcional: sem ele fica verde com warning) |
| `.github/workflows/notifica-falha-main.yml` | `workflow_run` dos workflows críticos na `main` | abre issue `[falha-main]` quando um deles falha e fecha quando volta ao verde | nenhum |

Separação de privilégio: o job que toca credencial de banco tem `permissions: contents: read` e
entrega o resultado por artifact; o job que escreve no repo não vê credencial nenhuma. `permissions`
fica sempre no job, nunca no topo do workflow.

Cada workflow carrega no topo um bloco `# docs:` dizendo gatilho, o que prova, quando falha e quem é
avisado — mais `# nao-e-bug:` para o comportamento esperado que parece falha (ex.: verde com warning
quando o secret não existe).

A branch `contexto` é **gerada**: branch padrão + 1 commit, reescrita a cada publicação. Nunca abra
PR dela nem a edite à mão. Ela carrega um `vercel.json` com `ignoreCommand: exit 0` para não
disparar preview deploy.

## Comandos

```bash
npm run contexto:ia          # docs/contexto/codigo/ (1 s, sem secret)
npm run contexto:regras      # docs/contexto/regras/ (6 s, sem secret)
npm run contexto:banco       # docs/contexto/supabase/ (exige SUPABASE_DB_URL, só leitura)
npm run inventario:rotas     # inventario/estado/rotas.json
npm run inventario:edges     # inventario/estado/edges.json (exige ripgrep)
npm run inventario:banco     # inventario/estado/banco.json (exige SUPABASE_ACCESS_TOKEN)
npm run inventario:mudou     # true/false: mudou algo estrutural desde o HEAD?
```

Testes dos próprios geradores (não precisam de banco nem de rede):

```bash
node --test scripts/ai-context/gerar.unit.mjs scripts/lib/seguranca-processo.test.mjs
python3 scripts/regras_negocio/test_generate.py
python3 scripts/supabase_snapshot/test_snapshot.py
```

## Secrets (nunca em código)

| Secret | Quem usa | Escopo |
|---|---|---|
| `SUPABASE_DB_URL` | `snapshot.py` | conexão Postgres do projeto `ookjbflsnoefnsixrspc`, sessão `default_transaction_read_only = on` |
| `SUPABASE_ACCESS_TOKEN` | `gerar-banco.mjs` | Management API, endpoint `read-only` |
| `DESTINO_URL` | `scripts/db-audit/*` | conexão de leitura para catálogo/manifesto/grants e `types.ts` |
