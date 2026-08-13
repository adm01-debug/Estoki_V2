# 📦 ESTOKI — Warehouse Management System

[![CI](https://github.com/adm01-debug/estoki/actions/workflows/ci.yml/badge.svg)](https://github.com/adm01-debug/estoki/actions/workflows/ci.yml)
[![QA Quality Gate](https://github.com/adm01-debug/estoki/actions/workflows/qa.yml/badge.svg)](https://github.com/adm01-debug/estoki/actions/workflows/qa.yml)
[![CD](https://github.com/adm01-debug/estoki/actions/workflows/cd.yml/badge.svg)](https://github.com/adm01-debug/estoki/actions/workflows/cd.yml)

**English** | [Português](README_PT.md)

Full-featured WMS for inbound, quality triage, storage, picking, shipping and
returns — built on React 18 + TypeScript and a Supabase (PostgreSQL) backend
with 245 Edge Functions, row-level security on every table and an
observability stack ready for production.

## ✨ Features

| Domain | Highlights |
|---|---|
| Inbound | NF-e XML import, blind receiving, discrepancy alerts |
| Quality | Timed triage, mandatory photos, ISO 2859-1 sampling |
| Storage | 120-position rack map, heatmap, slotting suggestions |
| Picking | Wave management, TSP route optimization (NN + 2-opt) |
| Shipping | Romaneio, carrier quotes/tracking (Correios v1/v2), POD |
| Returns | 5-step exchange & return workflow |
| Analytics | Operational KPIs, ABC analysis, demand forecast (5 models) |
| Governance | Chain of custody, critical-action audit panel, occurrences |
| Engagement | XP, achievements, daily challenges, streaks |
| Platform | PWA + offline queue, i18n (pt-BR/en/es), plugin SDK, multi-tenant foundation |

## 🛠️ Tech Stack

- **Frontend** — React 18, TypeScript 5 (strict), Vite 5, Tailwind CSS 3, shadcn/ui, TanStack Query, Framer Motion
- **Backend** — Supabase: PostgreSQL 15, Auth (JWT + WebAuthn), Storage, Realtime, Deno Edge Functions
- **Validation** — Zod on 212/212 Edge Functions with a request body, plus shared form schemas
- **Testing** — Vitest 3 + React Testing Library, Playwright (E2E + axe-core a11y), Deno contract tests
- **Quality** — ESLint, Prettier, size-limit budgets, custom RLS / Zod / i18n / dependency auditors
- **CI/CD** — GitHub Actions (`ci.yml`, `qa.yml` quality gate, `cd.yml` staging → manual prod gate)
- **Mobile** — Capacitor 8 (iOS / Android shells)

## 🚀 Quick Start

```bash
git clone https://github.com/adm01-debug/estoki.git
cd estoki
npm ci

cp .env.example .env.local     # fill in your Supabase project values
npm run dev                    # http://localhost:8080
```

Requirements: **Node.js 20+**, npm 10+, a Supabase project (or Lovable Cloud backend).

## 📋 Scripts

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server (Vite, port 8080) |
| `npm run build` | Production build (`ANALYZE=true` emits `dist/stats.html`) |
| `npm run lint` / `lint:fix` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` / `test:coverage` | Vitest 3 (v8 coverage) |
| `npm run test:e2e` | Playwright E2E |
| `npm run size` | Bundle budgets (size-limit) |
| `npm run qa:rls` | RLS audit — every public table must have RLS + policy |
| `npm run audit:zod` | Zod coverage across Edge Functions |
| `npm run i18n:check` / `i18n:hardcoded` | Locale parity + hardcoded-string regression gate |
| `npm run audit:deps` | Dependency advisories (registry-independent auditor) |
| `npm run qa:all` | Full local quality gate |

## 🔐 Security

- RLS enabled **and** policy-covered on 100% of public tables (`npm run qa:rls`).
- `SECURITY DEFINER` functions are revoked from `PUBLIC`/`anon`; each validates `auth.uid()` or `has_role()`.
- Secrets never reach the client — external APIs are proxied through Edge Functions.
- Rate limiting on auth/payment/webhook endpoints; brute-force lockout with exponential backoff.
- Supply-chain gate blocks `high`+ advisories (see `.dep-audit-allowlist.json` for accepted exceptions).

Report vulnerabilities per [`public/.well-known/security.txt`](public/.well-known/security.txt).

## 📊 Observability

`get_backend_health()` RPC + `backend-health` Edge Function feed the
`/admin/saude-backend` dashboard (latency, cache hit ratio, connections, slow
queries). `db-alert-monitor` watches WAL size, rollback ratio and deadlocks with
6h anti-flapping. Structured JSON logs and a Prometheus endpoint are documented
in [docs/OBSERVABILITY.md](docs/OBSERVABILITY.md).

## 📁 Structure

```
src/
├── components/    # Shared UI (shadcn/ui based)
├── features/      # Domain modules (analytics, inventory, picking, quality, ...)
├── pages/         # Route-level pages
├── services/      # Data-access services
├── hooks/ contexts/ guards/   # State, auth and route protection
├── lib/           # Utilities, schemas, resilience (circuit breaker, retry)
└── integrations/  # Supabase client & generated types
supabase/functions/  # Deno Edge Functions (+ _shared libraries)
docs/                # Architecture, security, observability, ADRs
scripts/             # QA auditors (RLS, Zod, i18n, dependencies)
```

## 📚 Documentation

- [Architecture](docs/ARCHITECTURE.md) · [ADR 0001](docs/adr/0001-architecture-overview.md)
- [Security](docs/SECURITY.md) · [SOC 2 Gap Analysis](docs/SOC2_GAP_ANALYSIS.md)
- [Observability](docs/OBSERVABILITY.md) · [Plugin SDK](docs/PLUGIN_SDK.md)
- [Improvement Plan 2026](docs/PLANO_MELHORIAS_2026.md) · [Roadmap](docs/ROADMAP.md) · [Changelog](CHANGELOG.md)
- Interactive API portal: `/admin/api` (OpenAPI 3.1 at [`public/openapi.json`](public/openapi.json))

## 🤝 Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md).

## 📄 License

Proprietary — ESTOKI © 2026. See [LICENSE](LICENSE).
