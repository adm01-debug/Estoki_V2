# QUAL-01 — Math.random (47), TODO (11), MOCK (10) em src/

- **Origem:** ESTADO_ATUAL.md 🟡9 (16/08/2026).
- **Estado real (20/11/2026):** em src/ (sem testes/style/stories): Math.random() 47 ocorrências, TODO 11, MOCK 10, FIXME 0. Não recontado por arquivo; triagem por arquivo é o próximo passo.
- **O que falta:** classificar cada ocorrência — (a) mock de ambiente dev/teste que deve ficar sinalizado, (b) aleatoriedade real que precisa de fonte determinística (seed/gerador), (c) TODO com feature inacabada (virar item do backlog se funcional), (d) remover comentários/lixo. Sem tocar em fluxo que funciona.
- **Camadas:** front (src/**).
- **Raio de impacto:** determinismo, qualidade de código; nenhuma funcionalidade ativa quebra.
- **Critério de aceite:** triagem documentada; TODOs funcionais viram itens; MOCKs de teste sinalizados; Math.random usados em lugares que exigem determinismo migrados.
- **Bloqueio:** decisão por família de casos.
- **Estado:** AGUARDANDO EXECUÇÃO.
