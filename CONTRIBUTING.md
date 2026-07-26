# Contribuindo com o ESTOKI WMS

Obrigado por contribuir. Este guia resume o fluxo, os padrões de código e o
quality gate que todo Pull Request precisa atravessar.

## 1. Ambiente

```bash
node -v          # 20+
npm ci
cp .env.example .env.local
npm run dev
```

Nunca comite `.env*` reais. Segredos de servidor (service_role, tokens de
integração) vivem apenas nos secrets das Edge Functions.

## 2. Fluxo de trabalho

1. Crie a branch a partir de `main`: `feat/<escopo>`, `fix/<escopo>`, `chore/<escopo>`.
2. Commits seguem [Conventional Commits](https://www.conventionalcommits.org/):
   `feat:`, `fix:`, `perf:`, `refactor:`, `test:`, `docs:`, `chore:`, `ci:`.
3. Abra o PR descrevendo **o quê**, **por quê** e **como validar**.
4. O workflow `qa.yml` roda automaticamente e comenta o relatório no PR.

## 3. Quality gate (bloqueante)

Rode localmente antes de abrir o PR:

```bash
npm run qa:all
```

Verificações críticas que **falham** o CI: `lint`, `typecheck`, testes
unitários, `build`, `qa:rls` e `audit:deps`. Informativos: size-limit, Zod
coverage, i18n, E2E smoke e npm audit.

## 4. Padrões de código

- **TypeScript strict.** Sem `any`, sem `@ts-ignore`. Props com `interface` exportada.
- **Tokens semânticos.** Use `bg-background`, `text-foreground`, `bg-primary`.
  Cores fixas (`bg-blue-500`, `text-white`, `bg-[#...]`) são proibidas — quebram o dark mode.
- **Componentes ≤ 150 linhas.** Passou disso, extraia subcomponentes.
- **Mobile-first**: `grid-cols-1` → `md:` → `lg:`.
- **Estado derivado** é variável computada, nunca `useEffect`.
- **Data fetching** via TanStack Query, com `.limit(500)` em consultas genéricas.
- **i18n**: todo texto visível passa por `t()`. `npm run i18n:hardcoded` trava regressões.
- **Acessibilidade**: HTML semântico, `aria-label`, foco visível, alvos de toque ≥ 48px.

## 5. Banco de dados

- Toda alteração de schema é uma **migration** versionada em `supabase/migrations/`.
- Todo `CREATE TABLE` no schema `public` exige, na mesma migration:
  `GRANT` → `ENABLE ROW LEVEL SECURITY` → `CREATE POLICY`.
- Policies escopadas por `auth.uid()` ou `has_role()`; sem acesso `anon` salvo tabela pública.
- Funções `SECURITY DEFINER` precisam de `SET search_path` e guarda de autorização no corpo.

## 6. Edge Functions

- Um arquivo `index.ts` por função, sem subpastas.
- Sempre: CORS, validação Zod do body (retornando 400), `try/catch` e log estruturado.
- Segredos via `Deno.env.get()`. Nunca execute SQL cru vindo do cliente.
- Funções sensíveis usam `_shared/rate-limit.ts`.

## 7. Testes

- Unitários com Vitest 3 em `*.test.ts(x)`, ao lado do código ou em `__tests__/`.
- Componentes com Testing Library; envolva em `HelmetProvider` quando usarem `<SEO />`.
- E2E com Playwright em `tests/e2e/`.
- Bug corrigido = teste que reproduz o bug primeiro (TDD).

## 8. Segurança

Não abra issue pública para vulnerabilidades — siga
[`public/.well-known/security.txt`](public/.well-known/security.txt).
