# Observabilidade & QA

## Sentry (produção)

Ativado automaticamente quando `import.meta.env.PROD === true` **e**
`VITE_SENTRY_DSN` está definido. Sem DSN o SDK é inicializado como no-op.

Variáveis:

| Var                 | Onde       | Uso                                  |
| ------------------- | ---------- | ------------------------------------ |
| `VITE_SENTRY_DSN`   | Runtime    | Endpoint público do projeto Sentry   |
| `SENTRY_AUTH_TOKEN` | CI (build) | Upload de sourcemaps via vite-plugin |
| `SENTRY_ORG`        | CI (build) | Slug da org no Sentry                |
| `SENTRY_PROJECT`    | CI (build) | Slug do projeto no Sentry            |

O plugin do Sentry só carrega quando as três variáveis do build estão
presentes — do contrário, o build produz sourcemaps `hidden` sem upload.

PII (email, tokens, senhas, CPF/CNPJ) é removida pelo `beforeSend` /
`scrubPII` em `src/lib/sentry.ts`. Nenhum email é enviado no evento.

### Rastros custom

- `ErrorBoundary.componentDidCatch` chama `captureException` com o
  `componentStack` como contexto.
- `ExportButton` emite breadcrumbs `export:start` / `export:success` com
  formato e duração, e captura exceções durante a geração do arquivo.

## QA Checklist (CI)

Workflow `.github/workflows/qa.yml` roda em cada PR:

1. `npm run lint`
2. `npm run typecheck`
3. `npm run test`
4. `npm run build` (com `ANALYZE=true` → gera `dist/stats.html`)
5. `npx size-limit` (budgets em `.size-limit.json`)
6. `npm run qa:rls` (varre `supabase/migrations`)
7. `npm audit --omit=dev --audit-level=high`
8. Consolida em `.qa-report/summary.md` e comenta no PR.

Artefatos publicados:

- `qa-report/` — Markdown consolidado + detalhes por etapa.
- `bundle-analysis/stats.html` — treemap para inspeção manual.

## Budget de bundle

Executar localmente após um build:

```bash
npm run build && npm run size
```

Limites em `.size-limit.json` — todos medidos com gzip.
