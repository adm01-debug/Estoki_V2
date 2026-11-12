# Estado real do projeto — inventário gerado

Pasta de **dados gerados por script**, não de relatórios escritos à mão. É a fonte de consulta dos
agentes para "o que existe hoje" no banco e no código. Se um número aqui divergir do que você mediu,
regere o arquivo (comandos abaixo) em vez de corrigir à mão.

| Arquivo | Como gerar | O que tem |
|---|---|---|
| `banco.json` | `SUPABASE_ACCESS_TOKEN=... node scripts/inventario/gerar-banco.mjs` (Management API: `/database/query/read-only` + `/functions`, só leitura) **ou**, sem token, rodar `scripts/inventario/banco.sql` no MCP do projeto `ookjbflsnoefnsixrspc` e `node scripts/inventario/gerar-banco.mjs --entrada <arquivo>` | cada tabela (RLS, policies, triggers, linhas, tamanho, se é citada em função/view do banco e quantos `.from()` e `/rest/v1/<tabela>` tem em `src/` e `supabase/functions/`), tabelas órfãs, cada cron job (agenda, funções chamadas, falhas e taxa em 24 h/7 d, duração máxima), horas em que o cron ficou parado, tamanho do histórico do cron, edge functions publicadas × pastas do repo (só com token; sem token fica `publicadas: null`) e a lista `alertas` |
| `rotas.json` | `node scripts/inventario/gerar-rotas.mjs` (`--check` só confere se está em dia) | as URLs de `src/App.tsx` + `src/routes/*.tsx` (path, página, `ProtectedRoute`/papéis/permissão, `Navigate`), o item de `src/config/menu.ts` de cada uma e, por tela, os hooks, tabelas, RPCs, buckets e edge functions alcançados pelos imports, mais a lista `problemas` (item de menu sem rota, URL sem arquivo, import quebrado) |
| `edges.json` | `node scripts/inventario/gerar-repo.mjs` | as edge functions: linhas, segredos lidos (`Deno.env.get`) e quem invoca cada uma (`src/`, migrations, outras edges, testes, CI) |
| `tabelas-uso.json` (não versionado) | `node scripts/inventario/gerar-repo.mjs < lista-de-tabelas.txt` | quantos `.from('tabela')` cada tabela tem — também sai em `banco.json` → `tabelas[].uso_no_codigo` |

## Como ler `banco.json`

- **`alertas`** é o que um agente precisa saber antes de mexer: `tabela_sem_rls`, `cron_falhando`
  (taxa ≥ 5 % em 7 dias), `cron_parado` (hora com mais da metade das execuções falhando),
  `cron_sem_execucao` (job ativo que roda todo dia sem nenhuma execução em 24 h — cron 100 % parado
  não grava falha, então só aparece aqui), `historico_cron_sem_limpeza` (> 50 mil linhas com mais de
  7 dias), `edge_sem_deploy` e `edge_publicada_sem_codigo`. Limiares em `LIMIARES` no script.
- **`tabelas_orfas`**: 0 linhas + não citada em função/view do banco + nenhum `.from()` nem
  `/rest/v1/` no código (`.from(variavel)` não é resolvido). Candidata a limpeza, não prova de que
  pode apagar (pode ser usada por RPC com outro nome ou por sistema externo).
- **`linhas`** é `count(*)` exato abaixo de 200 mil linhas (`linhas_exatas: true`); acima disso, a
  estimativa do planner. Não confie em `pg_stat_user_tables.n_live_tup`: zera quando o banco reinicia.
- Contagens rodam com o papel da conexão: com papel que não ignora RLS, tabelas com RLS e `cron.job`
  podem vir incompletas.
- A resposta só é gravada se o ledger bater com `supabase/migrations/` (maior versão aplicada entre as
  20 migrations mais recentes do repo e quantidade de registros a até 10 % da de arquivos) e, quando
  `supabase/schema-manifest.json` existir, se as tabelas baterem com ele (≥ 90 %, nos dois sentidos).
  Isso barra resposta colada de outro banco. Sem o manifesto o script avisa em `stderr` e segue só com
  o ledger.
- Nada de dado de usuário sai daqui: o SQL lê catálogo e contagens; de `cron.job` sai só o nome das
  funções chamadas (nunca o `command`, que pode ter URL ou cabeçalho). Antes de gravar, o script
  recusa saída com cara de credencial.

## Por que `rotas.json` e `edges.json` não têm data

São determinísticos: o mesmo código gera o mesmo arquivo. Só `banco.json` carrega `medido_em`,
porque mede o banco. `node scripts/inventario/mudou-conteudo.mjs` compara os três arquivos com a
versão do HEAD **ignorando carimbos de data e telemetria de janela rolante** — é ele que decide se
vale abrir PR, para o inventário não gerar ruído semanal sem mudança estrutural.
