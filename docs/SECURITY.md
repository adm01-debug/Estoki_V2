# 🔒 Política de Segurança - ESTOKI

## Versões Suportadas

| Versão | Suportada |
| ------ | --------- |
| 1.0.x  | ✅        |

## Reportando Vulnerabilidades

Se você descobrir uma vulnerabilidade de segurança:

1. **NÃO** abra uma issue pública
2. Envie email para: security@estoki.com
3. Inclua:
   - Descrição detalhada
   - Passos para reproduzir
   - Impacto potencial
   - Sugestão de correção (se tiver)

## Práticas de Segurança

### Credenciais

- ✅ Variáveis de ambiente para secrets
- ✅ .env no .gitignore
- ✅ Rotação periódica de chaves
- ❌ NUNCA commitar credenciais

### Autenticação

- JWT com expiração
- Refresh tokens seguros
- Rate limiting ativo
- Bloqueio após tentativas falhas

### Banco de Dados

- RLS (Row Level Security) em todas as tabelas
- Políticas por usuário/role
- Conexões criptografadas (SSL)

### Frontend

- Sanitização de inputs
- CSP headers configurados
- HTTPS obrigatório

### CI/CD

- Secrets do GitHub Actions
- Scans de segurança automáticos
- Dependabot habilitado

## Checklist de Segurança

- [ ] Credenciais não expostas no código
- [ ] RLS ativo em novas tabelas
- [ ] Inputs validados e sanitizados
- [ ] Dependências atualizadas
- [ ] Logs não expõem dados sensíveis

## Incidentes

Em caso de incidente:

1. Isolar o problema
2. Revogar credenciais comprometidas
3. Investigar a causa
4. Corrigir a vulnerabilidade
5. Documentar o incidente
6. Comunicar stakeholders

---

---

## Baseline do linter de banco (P2 #28 — 2026-07-26)

17 → **10 WARNs**. Os 7 eliminados eram exposição real a `anon`; os 10 restantes são
falsos-positivos formalmente aceitos e revalidados a cada rodada de QA.

### Corrigido (revogado `EXECUTE` de `PUBLIC`/`anon`)

| Função                                                              | Nova superfície                 | Motivo                                                                                                                                                     |
| ------------------------------------------------------------------- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `attach_user_to_default_tenant()`                                   | só `service_role`               | Função de gatilho; chamada direta nunca é legítima                                                                                                         |
| `current_tenant_id()`, `is_tenant_member()`, `is_tenant_admin()`    | `authenticated`, `service_role` | Avaliadas dentro de expressões de RLS **como o papel do chamador** → `authenticated` precisa manter `EXECUTE`; `anon` não toca nenhuma tabela multi-tenant |
| `get_dashboard_metrics()`, `refresh_dashboard_materialized_views()` | `authenticated`, `service_role` | Guard interno `has_role(auth.uid(),'admin')`                                                                                                               |
| `check_db_alert_thresholds()`                                       | `authenticated`, `service_role` | Acionada pela Edge Function `db-alert-monitor`                                                                                                             |

Verificação pós-migração: as 4 RPCs acima retornam **401** via PostgREST com a chave anônima.

### Aceito como falso-positivo (não corrigir)

1. **`0014_extension_in_public` — `pg_net`.** A extensão é instalada e gerenciada pela
   plataforma no schema `public`; movê-la quebra o agendamento gerenciado e não é reversível
   pelo projeto. Sem superfície de dados: `net.*` não é exposto pela Data API.
2. **`0029_authenticated_security_definer_function_executable` (9 ocorrências).**
   `check_db_alert_thresholds`, `collect_challenge_reward`, `current_tenant_id`,
   `get_dashboard_metrics`, `is_tenant_admin`, `is_tenant_member`, `move_stock`,
   `refresh_dashboard_materialized_views`, `registrar_checkin_diario`.
   São **RPCs de aplicação por design** — precisam de `SECURITY DEFINER` para escrever em
   tabelas cujo RLS não permite escrita direta pelo cliente (justamente o padrão seguro).
   Cada uma valida autorização no próprio corpo: `auth.uid() IS NULL` → exceção,
   `p_user_id <> auth.uid()` → `unauthorized`, ou `has_role(auth.uid(),'admin')`.
   Trocar para `SECURITY INVOKER` exigiria afrouxar o RLS — estritamente pior.

**Regra de regressão:** qualquer nova função `SECURITY DEFINER` em `public` nasce sem
`EXECUTE` para `anon`; conceder acesso a `authenticated` só com guard de autorização
explícito na primeira linha do corpo.

---

_Última atualização: Julho 2026_

## Dependências — política de auditoria (item #29, 2026-07-26)

O mirror npm usado no ambiente de build não expõe `/-/npm/v1/security/audits`,
então `npm audit` retorna 404. Para não perder o gate, existe
`scripts/dep-audit.mjs`, que:

1. lê `package-lock.json` e extrai todas as versões instaladas (1.459 pacotes),
   marcando quais são alcançáveis em produção (`dev` / `devOptional` = dev);
2. consulta o endpoint público de advisories em lote do registry;
3. casa cada advisory com as versões realmente presentes via `semver` — evita o
   falso positivo clássico de "pacote afetado" quando só uma cópia transitiva
   antiga é vulnerável;
4. falha o build acima do nível configurado (`--level=high`, `--prod` opcional) e
   grava `.qa-report/dep-audit.md`.

Scripts: `npm run audit:deps` e `npm run audit:deps:prod`. Job `deps` no
`qa.yml` é bloqueante. Sem rede, o script sai com 0 (não trava o build).

### Correções aplicadas (fix QA gate 12/2026)

| Pacote                              | Antes              | Depois                         | Motivo                                                                               |
| ----------------------------------- | ------------------ | ------------------------------ | ------------------------------------------------------------------------------------ |
| `@capacitor/{core,android,ios,cli}` | 8.4.2/8.5.0        | 8.6.0                          | crítico GHSA-rvm3-566m-v7fv (remote content na origem do app)                        |
| `axios`                             | 1.18.1             | 1.21.1                         | 7+ advisories high: SSRF, prototype pollution, DoS HTTP/2, redirect-bypass           |
| `dompurify`                         | 3.4.12             | 3.4.17                         | crítico GHSA-cg2g-xh64-v4q7 (bypass SAFE_FOR_TEMPLATES) + GHSA-mrv2-3pqr-j5jr        |
| `nanoid`                            | 5.1.11             | 5.1.16                         | alta GHSA-28wg-ghj8-5hjv (loop infinito em gerador não-seguro)                       |
| `react-router-dom`                  | 7.18.1             | 7.18.5                         | alta GHSA-qwww-vcr4-c8h2 (CSRF bypass em modo RSC)                                   |
| `handlebars`                        | 4.7.9              | 4.7.10 (override)              | 2 críticos: injeção JS via own-property check e AST type confusion                   |
| `@xmldom/xmldom`                    | 0.9.10             | 0.9.12 (override)              | 11 advisories: ReDoS, injeção de nome de elemento/atributo, bypass requireWellFormed |
| `browserslist`                      | 4.28.2             | 4.29.5 (override)              | memória ilimitada + crash/prototype write via stats não confiável                    |
| `follow-redirects`                  | 1.16.0             | 1.16.3 (override)              | 3 advisories: vazamento de headers sensíveis/credenciais                             |
| `source-map-js`                     | 1.2.1              | 1.2.2 (override)               | DoS por event-loop via source-map indexado                                           |
| `js-yaml@3/@4`                      | 3.15.0/4.3.0       | 3.15.2/4.3.2 (override)        | CPU quadrática em `!!omap` e merge keys                                              |
| `brace-expansion@1/@2/@5`           | 1.1.16/2.1.2/5.0.8 | 1.1.22/2.1.8/5.0.13 (override) | DoS por recursão/arrays intermediários (GHSA-rgw5/qhr7/6jf4)                         |
| `fast-uri`                          | 3.1.4              | 3.1.9 (override)               | 6 advisories: SSRF via IPv6/percent-encoding, authority injection                    |
| `nanoid@3` (transitivo)             | 3.3.16             | 3.3.20 (override)              | loop infinito quando size = 0                                                        |

### Advisories aceitos formalmente (`.dep-audit-allowlist.json`)

- **`vite` 5.4.21** (4 advisories, incl. GHSA-587h-7wmj-h5pm launch-editor) e **`esbuild` 0.18/0.21** — todos
  exploram o _dev server_, que nunca roda em produção (o artefato publicado é estático).
  Não há correção na linha 5.x (launch-editor só corrige em Vite 6.4+); a migração para Vite 6/7 está no backlog.
- **`zod` 3.25.76** (GHSA-mrhx-c7xc-m3w5) — a correção exige Zod 4.6.6+ (major 4). O código não valida
  coleções sobredimensionadas controladas por atacante; a migração para Zod 4 é PR dedicada.
- **`basic-ftp` 5.3.1** (GHSA-c475-qrg2-pj4r) — correção só em 6.2.6+ (major para o `get-uri`, do qual o
  `@capacitor/cli` (dev-only) depende). Ferramenta de build; sem entrada de atacante.
- **`extract-zip` 2.0.1** (GHSA-jmr9-qjv8-65gv, GHSA-7pqw-9j4j-h8q3) — sem correção publicada (2.0.1 é o
  latest). Usado pelo `cypress` (dev-only) para baixar binários oficiais de fonte controlada.
  A caminho: cypress 14 usa outro resolvedor.

Toda entrada da allowlist deve ser revisada a cada bump de major do tooling.
