# 📦 ESTOKI — Sistema de Gestão de Armazém (WMS)

[![CI](https://github.com/adm01-debug/estoki/actions/workflows/ci.yml/badge.svg)](https://github.com/adm01-debug/estoki/actions/workflows/ci.yml)
[![QA Quality Gate](https://github.com/adm01-debug/estoki/actions/workflows/qa.yml/badge.svg)](https://github.com/adm01-debug/estoki/actions/workflows/qa.yml)
[![CD](https://github.com/adm01-debug/estoki/actions/workflows/cd.yml/badge.svg)](https://github.com/adm01-debug/estoki/actions/workflows/cd.yml)

[English](README.md) | **Português**

WMS completo para recebimento, triagem de qualidade, armazenagem, separação,
expedição e devoluções — React 18 + TypeScript sobre backend Supabase
(PostgreSQL) com 245 Edge Functions, RLS em todas as tabelas e stack de
observabilidade pronta para produção.

## ✨ Funcionalidades

| Domínio           | Destaques                                                                   |
| ----------------- | --------------------------------------------------------------------------- |
| Recebimento       | Import de NF-e XML, conferência cega, alertas de divergência                |
| Qualidade         | Triagem cronometrada, fotos obrigatórias, amostragem ISO 2859-1             |
| Armazenagem       | Mapa de 120 posições, heatmap, sugestão de endereçamento                    |
| Separação         | Ondas de picking, otimização de rota TSP (NN + 2-opt)                       |
| Expedição         | Romaneio, cotação/rastreio de transportadoras (Correios v1/v2), comprovante |
| Trocas/Devoluções | Fluxo completo em 5 etapas                                                  |
| Analytics         | KPIs operacionais, curva ABC, previsão de demanda (5 modelos)               |
| Governança        | Cadeia de custódia, painel de auditoria crítica, ocorrências                |
| Engajamento       | XP, conquistas, desafios diários, streaks                                   |
| Plataforma        | PWA + fila offline, i18n (pt-BR/en/es), SDK de plugins, base multi-tenant   |

## 🛠️ Tecnologias

- **Frontend** — React 18, TypeScript 5 (strict), Vite 5, Tailwind CSS 3, shadcn/ui, TanStack Query, Framer Motion
- **Backend** — Supabase: PostgreSQL 15, Auth (JWT + WebAuthn), Storage, Realtime, Edge Functions (Deno)
- **Validação** — Zod em 212/212 Edge Functions com body, além dos schemas de formulário
- **Testes** — Vitest 3 + Testing Library, Playwright (E2E + acessibilidade via axe-core), contract tests Deno
- **Qualidade** — ESLint, Prettier, orçamentos de bundle (size-limit), auditores próprios de RLS/Zod/i18n/dependências
- **CI/CD** — GitHub Actions (`ci.yml`, `qa.yml` quality gate, `cd.yml` staging → gate manual de produção)
- **Mobile** — Capacitor 8 (shells iOS/Android)

## 🏃 Início rápido

```bash
git clone https://github.com/adm01-debug/estoki.git
cd estoki
npm ci

cp .env.example .env.local     # preencha com os dados do seu projeto Supabase
npm run dev                    # http://localhost:8080
```

Pré-requisitos: **Node.js 20+**, npm 10+ e um projeto Supabase (ou backend Lovable Cloud).

## 📋 Scripts

| Comando                                 | Descrição                                                      |
| --------------------------------------- | -------------------------------------------------------------- |
| `npm run dev`                           | Servidor de desenvolvimento (Vite, porta 8080)                 |
| `npm run build`                         | Build de produção (`ANALYZE=true` gera `dist/stats.html`)      |
| `npm run lint` / `lint:fix`             | ESLint                                                         |
| `npm run typecheck`                     | TypeScript app + configuração Vite, com projetos explícitos    |
| `npm test` / `test:coverage`            | Vitest 3 (cobertura v8)                                        |
| `npm run test:e2e`                      | Testes E2E (Playwright)                                        |
| `npm run size`                          | Orçamentos de bundle                                           |
| `npm run qa:rls`                        | Auditoria de RLS — toda tabela pública precisa de RLS + policy |
| `npm run audit:zod`                     | Cobertura de Zod nas Edge Functions                            |
| `npm run i18n:check` / `i18n:hardcoded` | Paridade de traduções + trava anti-regressão de strings fixas  |
| `npm run audit:deps`                    | Advisories de dependências (auditor independente do registry)  |
| `npm run qa:all`                        | Quality gate completo local                                    |

## 🔐 Segurança

- RLS habilitado **e** com policy em 100% das tabelas públicas (`npm run qa:rls`).
- Funções `SECURITY DEFINER` com `EXECUTE` revogado de `PUBLIC`/`anon`; cada uma valida `auth.uid()` ou `has_role()`.
- Segredos nunca chegam ao cliente — APIs externas passam por Edge Functions.
- Rate limiting em autenticação, pagamentos e webhooks; bloqueio progressivo contra força bruta.
- Gate de supply-chain bloqueia advisories `high`+ (exceções formalizadas em `.dep-audit-allowlist.json`).

Reporte vulnerabilidades conforme [`public/.well-known/security.txt`](public/.well-known/security.txt).

## 📊 Observabilidade

A RPC `get_backend_health()` e a função `backend-health` alimentam o painel
`/admin/saude-backend` (latência, cache hit ratio, conexões, queries lentas). O
`db-alert-monitor` acompanha WAL, taxa de rollback e deadlocks com
anti-flapping de 6h. Logs JSON estruturados e endpoint Prometheus estão em
[docs/OBSERVABILIDADE.md](docs/OBSERVABILIDADE.md).

## 📁 Estrutura

```
src/
├── components/    # UI compartilhada (base shadcn/ui)
├── features/      # Módulos de domínio (analytics, inventory, picking, quality, ...)
├── pages/         # Páginas de rota
├── services/      # Serviços de acesso a dados
├── hooks/ contexts/ guards/   # Estado, autenticação e proteção de rotas
├── lib/           # Utilitários, schemas, resiliência (circuit breaker, retry)
└── integrations/  # Cliente Supabase e tipos gerados
supabase/functions/  # Edge Functions Deno (+ bibliotecas em _shared)
docs/                # Arquitetura, segurança, observabilidade, ADRs
scripts/             # Auditores de QA (RLS, Zod, i18n, dependências)
```

## 📚 Documentação

- [Arquitetura](docs/ARCHITECTURE.md) · [ADR 0001](docs/adr/0001-architecture-overview.md)
- [Segurança](docs/SECURITY.md) · [Gap Analysis SOC 2](docs/SOC2_GAP_ANALYSIS.md)
- [Observabilidade](docs/OBSERVABILIDADE.md) · [SDK de Plugins](docs/PLUGIN_SDK.md)
- [Plano de Melhorias 2026](docs/PLANO_MELHORIAS_2026.md) · [Roadmap](docs/ROADMAP.md) · [Changelog](CHANGELOG.md)
- Portal de API interativo: `/admin/api` (OpenAPI 3.1 em [`public/openapi.json`](public/openapi.json))

## 🤝 Contribuindo

Veja [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 Licença

Proprietário — ESTOKI © 2026. Veja [LICENSE](LICENSE).

## Automação local sem IA

Veja [docs/AUTOMACAO_LOCAL.md](docs/AUTOMACAO_LOCAL.md) para comandos, gatilhos e limites do pipeline local. `npm run automation:test` executa as suites de automação; a instalação local de hooks e timer é verificada separadamente.
