# CICD-01 — Cobertura gate baixo (6/7/5/5)

- **Origem:** ESTADO_ATUAL.md 🟠5 (audit afirmava 12/12/25; 16/08/2026).
- **Estado real (20/11/2026):** vitest.config.ts parou em lines 6 / branches 7 / functions 5 / statements 5 (include: src/services/**, src/features/**/services/**, src/lib/**). O próprio arquivo documenta a meta: subir 5pp por rodada até 70/60/60/70.
- **O que falta:** executar o plano de subida gradual dos thresholds com a CI verificando cobertura real (hoje serve de porta para regressão de cobertura passar silenciosa).
- **Camadas:** CI/thresholds (sem banco).
- **Raio de impacto:** CI; se forçar subida sem cobrir, quebra o gate e impede merges até a cobertura alcançar.
- **Critério de aceite:** thresholds subidos ao menos 1 rodada com CI verde; metas 70/60/60/70 documentadas no próprio config já existentes.
- **Bloqueio:** nenhum.
- **Estado:** ✔ EXECUTADO (20/11/2026) — PR #135 mergeada.

## Execução (20/11/2026)

- Medição real de cobertura: lines 6.59 / branches 8.79 / functions 5.42 / statements 6.11 (vale 20/11).
- Thresholds anterior: 6 / 7 / 5 / 5 → novo: 6 / 8 / 5 / 6 (margem segura ≥1pp, sem red flakiness).
- Validação local: pm run test:coverage\ EXIT 0 (20 files / 64 tests).
- CI: Validate Codebase ✔, Quality Gate ✔, Playwright E2E (build) ✔ — 100% verde.
- Merge: squash 7827efbd (#135), branch deletada, main sincronizada.
- Plano de continuidade: próximas rodadas sobem +5pp até 70/60/60/70 conforme comentário no próprio vitest.config.ts.
