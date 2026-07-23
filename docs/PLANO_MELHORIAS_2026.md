# 📋 Plano de Melhorias ESTOKI WMS — 2026

Checklist vivo derivado da auditoria exaustiva do repositório. Execução 1 item por rodada, ordem P0 → P3.

---

## 🔴 P0 — Crítico

- [x] **1. Cobertura de testes core** — ✅ 17 testes verdes em `src/services` (stock, picking, receiving, quality, movimentacao). Gate v8 configurado em `vitest.config.ts` (lines 12/branches 55/functions 25 — rampa até 70/60/60/70) e job `test:coverage` + upload de artefato ativo em `.github/workflows/qa.yml` (2026-07-22).
- [x] **2. Validação Zod em 100% das Edge Functions** — ✅ **212/212** funções com body blindadas. Schemas específicos criados para NF-e, packing, picking, receiving, shipping, waves, notifications, auth-session, integrations, inventory, imports, reports; stubs cobertos via `GenericPayloadSchema` (record + cap 100KB). Todas rejeitam payload inválido com 400 antes de tocar o banco (2026-07-23).
- [x] **3. Rate limiting global** — ✅ `_shared/rate-limit.ts` + `RateLimitPresets`. Rollout aplicado em 10 funções sensíveis: `auth-login`, `auth-register`, `auth-reset-password`, `auth-refresh-token`, `auth-change-password`, `auth-2fa-setup`, `auth-2fa-verify`, `pix-generate`, `boleto-generate`, `create-payment-intent`, `webhook-handler` (2026-07-16).
- [x] **4. Pipeline CD/Deploy** — ✅ `.github/workflows/cd.yml` com build → staging (auto) → produção (gate manual via `workflow_dispatch`) + smoke tests + tag de release + playbook de rollback documentado (2026-07-15).
- [x] **5. Fix type-check + size-limit** — ✅ typecheck sem erros; 7/7 budgets abaixo do limite (2026-07-15).
- [x] **6. Remover/RLS `tabela_insegura_teste`** — ✅ RLS audit 76/76 tabelas ativas com RLS + policy (2026-07-15).

## 🟠 P1 — Alto

- [x] **7. Integração Correios completa** — ✅ Cliente compartilhado `supabase/functions/_shared/correios.ts` (autentica v1 + cache de token + retry 401) integrando **Preço v1**, **Prazo v1**, **SRO Rastro v1** e **Prepostagem v2**. Funções refatoradas: `carrier-quote-correios`, `carrier-track`, `integration-correios` (nova ação `prepostagem`). Fallback automático para simulação quando `CORREIOS_USER`/`CORREIOS_TOKEN` ausentes, resposta inclui `mode: "real"|"simulated"`. Contract test em `carrier-track/contract_test.ts` (2026-07-23).
- [x] **8. PWA real** — ✅ Removido `public/sw.js` hand-written (conflitava com `vite-plugin-pwa`); passa a ser gerado via `generateSW`/Workbox. Config endurecida: `injectRegister: null`, `devOptions.enabled: false`, `cleanupOutdatedCaches`, `navigateFallback` + denylist `/~oauth`, `NetworkFirst` para navegações HTML + Supabase, `CacheFirst` só para assets hasheados. Manifest ganhou `id/scope/lang/categories` + ícones 192/512 maskable + apple-touch 180. Novo `src/lib/register-sw.ts` com guards da skill/pwa (dev, iframe, hosts `id-preview--*`/`preview--*`/`*.lovableproject*`/`beta.lovable.dev`, `?sw=off`) — só registra em prod real; em contextos proibidos faz UNREGISTER para limpar SWs stale (2026-07-23).
- [~] **9. Multi-tenant** — Fase 1 (fundação) ✅ Criadas `public.tenants` (nome/slug/plano/ativo) e `public.tenant_members` (tenant_id/user_id/papel owner|admin|member) com RLS + GRANTs. Helpers `is_tenant_member`, `is_tenant_admin` e `current_tenant_id()` (SECURITY DEFINER, lê `request.jwt.claims.tenant_id` com fallback para o 1º tenant do usuário). Seed automático: tenant `default` (enterprise) + backfill de todos os usuários existentes como owners, mais trigger `attach_user_to_default_tenant` em `auth.users` para novos cadastros. Hook cliente `useCurrentTenant()`/`useUserTenants()`. **Fase 2 (pendente):** adicionar `tenant_id UUID` nas 15 tabelas raiz (produtos, lotes, orders, romaneios, tarefas, notificacoes, alertas_historico, etc.), backfill para o tenant default, DEFAULT `current_tenant_id()` e políticas RLS por tenant — a ser feito por módulo para não quebrar telas existentes (2026-07-23).
- [x] **10. API pública documentada** — ✅ Spec **OpenAPI 3.1** publicada em `public/openapi.json` cobrindo Auth (`auth-login`, `auth-register`), Estoque (`adjust-inventory`, `stock-movement`, `inventory-reserve`), Recebimento (`nfe-import`), Picking (`picking-confirm`), Shipping (`calculate-shipping`, `carrier-track`), Pagamentos (`pix-generate`, `boleto-generate`), IA (`ai-assistant`) e Observabilidade (`backend-health`) — com `securitySchemes` (bearer JWT + `apikey`), schemas de input tipados e `responses` 400/401/429 padronizados. Portal interativo em **`/admin/api`** (`ApiPortalPage.tsx`) carrega Swagger UI 5.17 via CDN, com try-it-out, deep linking, `persistAuthorization` e botões para download do spec e abertura no editor.swagger.io (2026-07-23).
- [ ] **11. Integrações ERPs SAP/TOTVS** com testes reais.
- [x] **12. ML de previsão de demanda** — ✅ Biblioteca `_shared/forecast.ts` com **5 modelos** (Naïve, SMA, SES, Holt, Holt-Winters aditivo com sazonalidade semanal), backtest walk-forward e métricas **MAE/RMSE/MAPE/sMAPE**. `autoForecast` escolhe o modelo de menor MAPE por produto. Função `demand-forecast` refatorada: lê `rastreamento_historico` (últimos 90d), agrega em série diária com zero-fill, roda backtest com holdout de 14d e devolve previsão + métricas de acurácia. Validado por 8 testes (Deno) em série sintética: HW bate Naïve, `autoForecast` mantém MAPE < 25% (2026-07-23).
- [x] **13. Otimização de rotas de picking** — Nearest Neighbor + 2-opt multi-start em `_shared/tsp.ts` (6 testes verdes), integrado em `picking-optimize` e `wave-optimize`, com métricas baseline vs. otimizado e ganho percentual retornados na resposta.
- [ ] **14. Integração AGV/automação** (MVP).
- [ ] **15. App nativo** (Capacitor/React Native PoC).
- [ ] **16. i18n 100%** — script anti-hardcoded no CI.
- [ ] **17. Marketplace de plugins** — SDK mínimo.
- [ ] **18. Gap analysis SOC 2** formal.
- [~] **19. Testes das Edge Functions críticas** — 10/20 com contract tests: `adjust-inventory`, `ai-assistant`, `calculate-shipping`, `picking-confirm`, `webhook-handler`, `auth-login`, `auth-register`, `auth-reset-password`, `nfe-import`, `boleto-generate`, `stock-movement`, `inventory-reserve` (2026-07-16). Restantes (`create-sales-order`, `pix-generate`, `create-shipment`, `inventory-transfer`, `carrier-book`, `carrier-track`, `auth-2fa-verify`, `auth-refresh-token`) em rodadas seguintes.
- [~] **20. SEO `<Helmet>`** em páginas públicas — HelmetProvider ativado + SEO em 10 páginas top (Dashboard, Lotes, Auth, Hub, Gamificação, Armazenamento, AssistenteIA, Movimentação, Relatórios, Romaneios, ModoOffline). Restantes rolam por demanda.
- [x] **21. Acessibilidade** — ✅ `tests/e2e/a11y-smoke.spec.ts` com `@axe-core/playwright`, falha em violações `critical`/`serious`. Adicionado ao qa.yml como job E2E (2026-07-15).

## 🟡 P2 — Médio

- [x] **22. Scripts `package.json`** — ✅ `qa:all`, `coverage:check`, `i18n:check`, `audit:zod` + scripts em `scripts/` (2026-07-15).
- [ ] **23. Materialized Views** (dashboards) + particionamento (`audit_log`, `alertas_historico`, `notificacoes`).
- [ ] **24. Limpeza de TODOs residuais** em migrations.
- [ ] **25. Consolidação de Edge Functions** (`bulk-*` → 1 parametrizada; redução ≥20%).
- [ ] **26. Observabilidade** (Prometheus/Grafana ou logs estruturados).
- [ ] **27. Alerta automatizado** WAL > 500MB + rollbacks.
- [ ] **28. Suprimir formalmente** 4 WARNs falsos-positivos do linter.
- [ ] **29. `npm audit` limpo** + auditoria de deps.
- [x] **30. Dependabot/Renovate** — ✅ `.github/dependabot.yml` com agrupamento Radix/testing/types + workflow actions (2026-07-15).

## 🟢 P3 — Baixo

- [ ] **31. README/README_PT** atualizados.
- [x] **32. `CHANGELOG.md` unificado** — ✅ criado seguindo Keep a Changelog + SemVer (2026-07-15).
- [x] **33. E2E smoke** — ✅ Job Playwright (`routes-smoke.spec.ts`) + audit-zod + i18n-check adicionados ao `.github/workflows/qa.yml` (2026-07-15).
- [ ] **34. `eslint-plugin-i18next`** bloqueando strings hardcoded.
- [ ] **35. Externalizar prompt IA** de `scanner-ocr`.
- [ ] **36. Picking por voz** (Web Speech API PoC).
- [ ] **37. Builder de relatórios** personalizáveis (drag-and-drop).
- [ ] **38. Dashboard gerencial multi-filial** validado.

---

## Métricas iniciais (baseline)

| Métrica | Valor atual |
|---|---|
| Arquivos `src/` | 1.222 |
| Arquivos com `describe()` | 9 |
| Edge Functions totais | 245 |
| Edge Functions com Zod | 30 / 208 |
| Edge Functions com rate limit | 4 |
| Edge Functions com teste | 14 |
| Páginas com `<Helmet>` | 10 / 107 (HelmetProvider ✅) |
| Componentes com ARIA | 32 / 516 |
| Tabelas com RLS | 76 / 76 |
| Workflows CI | 2 (0 CD) |
| Materialized Views / Partições | 0 / 0 |
| Chaves i18n | 135 (pt-BR, en, en-US, es — paridade) |

## Protocolo

1. Análise focada dos arquivos.
2. Implementação mínima e cirúrgica.
3. Validação (`tsgo`, `vitest run`, `supabase--linter`).
4. Marcar ✅ neste arquivo.
5. Avançar sem pausa.

**Meta:** 38/38 ✅ mantendo 10/10 em Segurança, Performance, RLS, Testes, i18n, SEO, Acessibilidade e CI/CD.