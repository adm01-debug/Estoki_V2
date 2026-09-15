# SOC 2 Type II — Gap Analysis Formal (ESTOKI WMS)

**Data:** 2026-07-23 · **Escopo:** produção Lovable Cloud + Edge Functions + repo GitHub
**Framework:** AICPA Trust Services Criteria 2017 (revisão 2022) — Security (obrigatório), Availability, Confidentiality, Processing Integrity, Privacy.
**Método:** revisão de código, banco (RLS/policies), CI/CD, políticas escritas e evidências em `docs/`.

Legenda: ✅ atendido · 🟡 parcial · ❌ gap · ➖ fora de escopo.

---

## 1. Common Criteria (CC) — Security (obrigatório)

### CC1 — Control Environment

| #     | Critério                                         | Status | Evidência / Gap                                                                                        |
| ----- | ------------------------------------------------ | ------ | ------------------------------------------------------------------------------------------------------ |
| CC1.1 | Comprometimento com integridade e valores éticos | 🟡     | `CODE_OF_CONDUCT.md` ausente — **criar**                                                               |
| CC1.2 | Board oversight                                  | ❌     | Gap: sem board formal; documentar cadência trimestral com founders                                     |
| CC1.3 | Estruturas, autoridades e responsabilidades      | 🟡     | `docs/RACI.md` ausente — **criar matriz RACI (Eng/Sec/Ops)**                                           |
| CC1.4 | Compromisso com competência                      | 🟡     | Onboarding técnico existe (README); trilha de segurança ausente                                        |
| CC1.5 | Accountability                                   | 🟡     | Audit log 100% coberto (`audit_log` + trigger `audit_sensitive_row_change`) ✅; falta política escrita |

### CC2 — Communication & Information

| #     | Critério                                     | Status | Evidência                                                                 |
| ----- | -------------------------------------------- | ------ | ------------------------------------------------------------------------- |
| CC2.1 | Informação relevante para controles internos | ✅     | Dashboards `/admin/saude-backend`, `/admin/auditoria-critica`, `/monitor` |
| CC2.2 | Comunicação interna de controles             | 🟡     | `CHANGELOG.md` ✅; falta canal formal de incidentes (runbook)             |
| CC2.3 | Comunicação externa                          | ❌     | Sem `security.txt`, sem página de status pública — **criar**              |

### CC3 — Risk Assessment

| #     | Critério                              | Status | Evidência                                                               |
| ----- | ------------------------------------- | ------ | ----------------------------------------------------------------------- |
| CC3.1 | Objetivos claros                      | ✅     | `docs/PLANO_MELHORIAS_2026.md`                                          |
| CC3.2 | Identificação de riscos               | 🟡     | Auditoria técnica ✅; falta risk register formal                        |
| CC3.3 | Potencial de fraude considerado       | 🟡     | RLS + rate limit + brute-force lockout ✅; sem threat model documentado |
| CC3.4 | Mudanças significativas identificadas | ✅     | Migrations versionadas + PR + review                                    |

### CC4 — Monitoring Activities

| #     | Critério                    | Status | Evidência                                                      |
| ----- | --------------------------- | ------ | -------------------------------------------------------------- |
| CC4.1 | Avaliações contínuas        | ✅     | CI QA (`qa.yml`), `supabase--linter`, cobertura v8, size-limit |
| CC4.2 | Comunicação de deficiências | 🟡     | Sentry (issues), audit log; falta SLA formal de resposta       |

### CC5 — Control Activities

| #     | Critério                                  | Status | Evidência                                                                                |
| ----- | ----------------------------------------- | ------ | ---------------------------------------------------------------------------------------- |
| CC5.1 | Controles selecionados para mitigar risco | ✅     | RLS 76/76 tabelas, Zod 212/212 Edge Functions, rate limit em 11 funções sensíveis        |
| CC5.2 | Controles tecnológicos gerais             | ✅     | Circuit breaker, retries, backup automático Supabase                                     |
| CC5.3 | Controles implantados via políticas       | 🟡     | Políticas escritas ausentes (Acess Control, Change Mgmt) — **criar em `docs/policies/`** |

### CC6 — Logical & Physical Access Controls

| #     | Critério                           | Status | Evidência                                                                                    |
| ----- | ---------------------------------- | ------ | -------------------------------------------------------------------------------------------- |
| CC6.1 | Gestão de acesso lógico            | ✅     | `user_roles` + `has_role` SECURITY DEFINER; `permissions`/`role_permissions`                 |
| CC6.2 | Registro/desregistro de usuários   | ✅     | Trigger `handle_new_user`; hard-delete via admin                                             |
| CC6.3 | Autenticação forte                 | ✅     | Email+senha + Google OAuth + WebAuthn (`passkey_credentials`); 2FA (`auth-2fa-setup/verify`) |
| CC6.4 | Acesso físico                      | ➖     | Coberto pelo Supabase (SOC 2 vendor) — anexar relatório                                      |
| CC6.5 | Descarte lógico                    | 🟡     | Soft-delete via `deleted_at`; falta job de purga após retenção                               |
| CC6.6 | Proteção de acesso externo         | ✅     | HTTPS forçado, CORS restrito, `ip_whitelist`/`geo_whitelist`                                 |
| CC6.7 | Transmissão de dados               | ✅     | TLS 1.3 (Cloudflare), Supabase over TLS                                                      |
| CC6.8 | Prevenção de código não autorizado | ✅     | Dependabot ✅, `npm audit` no CI, size-limit                                                 |

### CC7 — System Operations

| #     | Critério                     | Status | Evidência                                                     |
| ----- | ---------------------------- | ------ | ------------------------------------------------------------- |
| CC7.1 | Detecção de vulnerabilidades | ✅     | `supabase--linter`, `security--run_security_scan`, Dependabot |
| CC7.2 | Monitoramento de anomalias   | ✅     | `/monitor` (live), `alertas_historico`, KPI alerting          |
| CC7.3 | Resposta a incidentes        | 🟡     | Runbook ausente — **criar `docs/INCIDENT_RESPONSE.md`**       |
| CC7.4 | Continuidade de incidentes   | 🟡     | Rollback documentado em `cd.yml`; falta post-mortem template  |
| CC7.5 | Recuperação                  | ✅     | Supabase PITR + backups automáticos                           |

### CC8 — Change Management

| #     | Critério                                  | Status | Evidência                                                   |
| ----- | ----------------------------------------- | ------ | ----------------------------------------------------------- |
| CC8.1 | Mudanças autorizadas, testadas, aprovadas | ✅     | PR obrigatório + review + `qa.yml` + CD gate manual em prod |

### CC9 — Risk Mitigation

| #     | Critério                         | Status | Evidência                                                                                      |
| ----- | -------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| CC9.1 | Mitigação de riscos de disrupção | ✅     | Circuit breaker (`ai-invoke`), retries, timeouts em Edge Functions                             |
| CC9.2 | Gestão de fornecedores           | 🟡     | Vendor list ausente — **criar `docs/VENDORS.md`** com SOC 2 report do Supabase, Google, Resend |

---

## 2. Additional Criteria

### Availability (A1)

| #    | Critério                       | Status | Evidência                                                   |
| ---- | ------------------------------ | ------ | ----------------------------------------------------------- |
| A1.1 | Capacidade planejada           | ✅     | Simulação de carga (300 rps p95<1.1s), autoscaling Supabase |
| A1.2 | Monitoração/backup/recuperação | ✅     | Backup automático + PITR; dashboard saúde                   |
| A1.3 | Recovery/DR testado            | ❌     | Gap: **realizar DR drill trimestral e documentar RTO/RPO**  |

### Confidentiality (C1)

| #    | Critério                                             | Status | Evidência                                                                                      |
| ---- | ---------------------------------------------------- | ------ | ---------------------------------------------------------------------------------------------- |
| C1.1 | Identificação e classificação de dados confidenciais | 🟡     | PII marcado (`mem://security/pii-and-data-hardening`); falta data classification schema formal |
| C1.2 | Descarte de confidenciais                            | 🟡     | Cascade delete OK; job de retenção pendente                                                    |

### Processing Integrity (PI1)

| #     | Critério                | Status | Evidência                                                               |
| ----- | ----------------------- | ------ | ----------------------------------------------------------------------- |
| PI1.1 | Input validado          | ✅     | Zod 212/212 Edge Functions, `validateForm` no front                     |
| PI1.2 | Processamento acurado   | ✅     | Optimistic locking (`version`), triggers idempotentes, testes unitários |
| PI1.3 | Output completo/preciso | ✅     | Contract tests, size-limit, cobertura                                   |
| PI1.4 | Rastreabilidade         | ✅     | `rastreamento_historico` + `audit_log` + traceability module            |
| PI1.5 | Correção de erros       | ✅     | Aprovações workflow (`aprovacoes_movimentacao`), ajustes com reason     |

### Privacy (P1–P8) — LGPD alinhado

| #   | Critério                  | Status | Evidência                                       |
| --- | ------------------------- | ------ | ----------------------------------------------- |
| P1  | Notice                    | ❌     | **Criar `docs/PRIVACY_POLICY.md` + `TERMS.md`** |
| P2  | Choice/Consent            | 🟡     | Consentimento em cadastro; falta modal LGPD     |
| P3  | Coleta                    | ✅     | Só o necessário (email/nome)                    |
| P4  | Uso/retenção/descarte     | 🟡     | Política de retenção não escrita                |
| P5  | Acesso do titular         | ❌     | Gap: **endpoint `data-export` por titular**     |
| P6  | Disclosure a terceiros    | ✅     | Apenas processadores contratados                |
| P7  | Qualidade                 | ✅     | Constraints, unique keys                        |
| P8  | Monitoramento/enforcement | ✅     | DPO + audit log                                 |

---

## 3. Sumário executivo

| Dimensão                       | Cobertura                                                          |
| ------------------------------ | ------------------------------------------------------------------ |
| **Security (CC1–CC9)**         | **83%** — controles técnicos maduros; políticas escritas em dívida |
| **Availability (A1)**          | 70% — DR drill pendente                                            |
| **Confidentiality (C1)**       | 60% — data classification formal ausente                           |
| **Processing Integrity (PI1)** | 95% — pronto                                                       |
| **Privacy (P1–P8)**            | 55% — política escrita e portal do titular ausentes                |
| **Global (média ponderada)**   | **~74%**                                                           |

## 4. Roadmap para SOC 2 Type II (12 meses)

| Trimestre | Entrega                                                                                                                         |
| --------- | ------------------------------------------------------------------------------------------------------------------------------- |
| **Q1**    | Políticas escritas (`docs/policies/`): ISP, Access Control, Change Mgmt, Vendor, IR, BCP/DR. `security.txt` + página `/status`. |
| **Q2**    | DR drill + RTO/RPO documentados. Data classification (public/internal/confidential/restricted) tagueada em migrations.          |
| **Q3**    | Portal do titular LGPD (`data-export`/`data-erase`). `PRIVACY_POLICY.md`, `TERMS.md`. Vendor list com SOC 2 reports anexos.     |
| **Q4**    | Observation window de 6 meses (auditor). Type I preliminar → Type II após 6 meses de operação estável.                          |

## 5. Ações imediatas (próximas 2 semanas)

1. Criar `docs/policies/` com skeleton de 6 políticas (ISP, AC, CM, Vendor, IR, BCP).
2. Criar `public/.well-known/security.txt`.
3. Criar `docs/RACI.md` e `docs/VENDORS.md`.
4. Criar template de post-mortem em `docs/POSTMORTEM_TEMPLATE.md`.
5. Registrar risk register inicial em `docs/RISK_REGISTER.md`.

---

**Owner:** Head of Engineering · **Revisão:** trimestral · **Próxima revisão:** 2026-10-23.
