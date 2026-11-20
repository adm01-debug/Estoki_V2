# CICD-01 — Cobertura gate baixo (6/7/5/5)
- **Origem:** ESTADO_ATUAL.md 🟠5 (audit afirmava 12/12/25; 16/08/2026).
- **Estado real (20/11/2026):** itest.config.ts parou em lines 6 / branches 7 / functions 5 / statements 5 (include: src/services/**, src/features/**/services/**, src/lib/**). O próprio arquivo documenta a meta: subir 5pp por rodada até 70/60/60/70.
- **O que falta:** executar o plano de subida gradual dos thresholds com a CI verificando cobertura real (hoje serve de porta para regressão de cobertura passar silenciosa).
- **Camadas:** CI/thresholds (sem banco).
- **Raio de impacto:** CI; se forçar subida sem cobrir, quebra o gate e impede merges até a cobertura alcançar.
- **Critério de aceite:** thresholds subidos ao menos 1 rodada com CI verde; metas 70/60/60/70 documentadas no próprio config já existentes.
- **Bloqueio:** nenhum.
- **Estado:** AGUARDANDO EXECUÇÃO.