# Changelog

Todas as mudanças notáveis do ESTOKI WMS. Segue [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e [SemVer](https://semver.org/lang/pt-BR/).

## [Unreleased]

### Adicionado
- Dependabot semanal (npm + github-actions) com agrupamento de Radix, testing e types.
- `CHANGELOG.md` unificado como fonte única de verdade (consolida `docs/history/*`).
- Relatório de simulação preventiva Fase 0 em `.qa-report/simulacao-preventiva.md`.

### Corrigido
- `.qa-report/summary.md` regenerado — 6/7 gates verdes (typecheck, size-limit, RLS, build, lint, testes).
- Auditoria RLS confirmada: 76/76 tabelas públicas ativas com RLS habilitado e ao menos uma policy.

### Documentação
- `docs/PLANO_MELHORIAS_2026.md` marca P0 #5 e #6 como concluídos após validação real.

---

## Histórico

Entradas anteriores estão consolidadas em `docs/history/*.md`. Novas mudanças devem ser adicionadas apenas neste arquivo.