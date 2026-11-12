---
name: estoki-v2
description: Convenções de código e commit do Estoki V2 (TypeScript, Tailwind com token semântico, Conventional Commits). Use ao alterar código, criar testes ou escrever mensagem de commit neste repositório; as regras operacionais ficam em AGENTS.md.
---

# Estoki V2 — convenções

As regras de trabalho (banco, fluxo Git, PR, comunicação) estão em `AGENTS.md` na raiz — este skill só
resume convenções de código e commit.

## Commits

Conventional Commits, em PT-BR, modo imperativo, primeira linha curta:
`<tipo>(<escopo>): <descrição>` — escopo opcional e minúsculo. Tipos aceitos
(`CONTRIBUTING.md:21-22`): `feat fix perf refactor test docs chore ci`. **Não há hook de `commit-msg`
neste repo** (`package.json` tem `"prepare": "echo 'skip husky'"`, não existe `.husky/`, e
`.lintstagedrc`/`.lintstagedrc.json` são config morta) — nada valida no commit, então o padrão depende
de você.

Exemplo: `fix(estoque): corrige saldo negativo após ajuste parcial`

## Código

- TypeScript strict: sem `any`, sem `@ts-ignore`. Props em `interface` exportada.
- **Só token semântico do tema** (`bg-background`, `text-foreground`, `bg-primary`, `text-muted-foreground`).
  Cor fixa (`bg-blue-500`, `text-white`, `bg-[#1a1a1a]`) é proibida — quebra o dark mode.
- Componente com **≤ 150 linhas**; acima disso, extraia. Layout mobile-first: `grid-cols-1 → md: → lg:`.
- Estado derivado é variável computada, **nunca** `useEffect`.
- Dado de servidor sempre por TanStack Query (staleTime 5 min / gcTime 10 min), com **`.limit(500)`** em
  consulta genérica. Sem retry em 401/403.
- Todo texto visível passa por `t()` (i18next; `pt-BR`, `en`, `es` em `src/i18n/locales/`).
- A11y: `aria-label`, foco visível, alvo de toque ≥ 48px.
- Responsabilidade por pasta (`docs/ARCHITECTURE.md:179-187`): `components/` UI pura · `hooks/`
  orquestração de estado/async · `features/` domínio vertical (hooks + pages + services) · `pages/`
  composição · `services/` acesso a dado e regra de domínio · `lib/` utilitário puro sem efeito colateral
  · `types/` contratos.
- Rotas e componentes pesados (Recharts) entram por `lazy()` — padrão da ADR 0001.
- Nomes: funções `camelCase`, componentes `PascalCase`, constantes `SCREAMING_SNAKE_CASE`. Exports
  nomeados; siga o padrão de import do arquivo vizinho e o esquema de nomes do módulo em que está
  entrando (`src/pages/` convive em PT-BR flat e EN por subpasta — não misture).

## Edge functions (`supabase/functions/`)

Um `index.ts` por função, sem subpasta. Sempre: CORS de `_shared/cors.ts` + validação Zod do body
devolvendo **400** + `try/catch` + log estruturado por `withLogging("<nome-da-fn>", handler)`. Segredo só
por `Deno.env.get()`. Função sensível usa `_shared/rate-limit.ts`. Nunca SQL cru vindo do cliente.

## Testes

- Vitest em `*.test.ts(x)` ao lado do módulo ou em `__tests__/`; rode só o que tocou:
  `npx vitest run <caminho>`.
- Testing Library: envolva em `HelmetProvider` quando o componente usar `<SEO />`.
- E2E em `tests/e2e/` (Playwright). Testes Deno de edge function em `supabase/functions/**/*_test.ts`
  não rodam em nenhum workflow — rode à mão com `deno test` ao mexer em `_shared/`.
- **Bug corrigido = teste que reproduz o bug primeiro.**
