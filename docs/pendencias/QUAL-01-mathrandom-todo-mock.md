# QUAL-01 — Math.random (47), TODO (11), MOCK (10) em src/

- **Origem:** ESTADO_ATUAL.md 🟡9 (16/08/2026).
- **Estado real (21/11/2026, recontagem em main @8bac5a94):** em src/ (sem __tests__/.test./.spec.): **Math.random 28 arquivos** (55+ chamadas, dominadas por efeitos visuais — Fireworks.tsx, Confetti.tsx, partículas, avatares aleatórios), **TODO/FIXME 0**, **MOCK ~9 arquivos** (dev/teste). A recontagem reduziu de 47→28 (filtrando testes/stories/style que estavam no total antigo).
- **Triagem inicial (21/11/2026):** Math.random restante é majoritariamente *aleatoriedade visual/presentacional* (confete, fogos, placeholder de avatar, demo) — determinismo não é requisito. Exceções a avaliar: qualquer uso em cálculo de negócio (nenhum encontrado na varredura superficial). TODOs: 0. MOCKs: sinalizar explicitamente como tal (COSMIC_MOCK, mockData etc.).
- **O que falta:** classificar cada ocorrência — (a) mock de ambiente dev/teste que deve ficar sinalizado, (b) aleatoriedade real que precisa de fonte determinística (seed/gerador), (c) TODO com feature inacabada (virar item do backlog se funcional), (d) remover comentários/lixo. Sem tocar em fluxo que funciona.
- **Camadas:** front (src/**).
- **Raio de impacto:** determinismo, qualidade de código; nenhuma funcionalidade ativa quebra.
- **Critério de aceite:** triagem documentada; TODOs funcionais viram itens; MOCKs de teste sinalizados; Math.random usados em lugares que exigem determinismo migrados.
- **Bloqueio:** decisão por família de casos.
- **Estado:** ✅ TRIADO (execução de limpeza opcional, sem impacto funcional).
