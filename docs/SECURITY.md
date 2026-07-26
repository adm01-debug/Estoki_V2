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

| Função | Nova superfície | Motivo |
|---|---|---|
| `attach_user_to_default_tenant()` | só `service_role` | Função de gatilho; chamada direta nunca é legítima |
| `current_tenant_id()`, `is_tenant_member()`, `is_tenant_admin()` | `authenticated`, `service_role` | Avaliadas dentro de expressões de RLS **como o papel do chamador** → `authenticated` precisa manter `EXECUTE`; `anon` não toca nenhuma tabela multi-tenant |
| `get_dashboard_metrics()`, `refresh_dashboard_materialized_views()` | `authenticated`, `service_role` | Guard interno `has_role(auth.uid(),'admin')` |
| `check_db_alert_thresholds()` | `authenticated`, `service_role` | Acionada pela Edge Function `db-alert-monitor` |

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
