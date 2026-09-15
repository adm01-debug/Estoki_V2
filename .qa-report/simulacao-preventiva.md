# Fase 0 — Simulação Preventiva (2026-07-15)

Bateria de diagnósticos rodada **antes** de tocar código, para dimensionar o backlog real dos 38 itens.

## Resultados

| Cenário                       | Ferramenta              | Resultado                                                                                                                                 | Ação                                       |
| ----------------------------- | ----------------------- | ----------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------ |
| Type-check completo           | `tsc --noEmit`          | ✅ 0 erros                                                                                                                                | P0 #5 já resolvido                         |
| Bundle size (7 budgets)       | `size-limit`            | ✅ todos abaixo do limite (main 192/220 kB, recharts 149/170, motion 39/50, exceljs 254/270, jspdf 131/140, html2canvas 45/55, CSS 25/80) | P0 #5 já resolvido                         |
| RLS coverage                  | `scripts/rls-audit.mjs` | ✅ 76/76 tabelas ativas com RLS + policy                                                                                                  | P0 #6 já resolvido                         |
| Build Vite + PWA              | `npm run build`         | ✅ 231 assets precached, sem falha                                                                                                        | —                                          |
| Cobertura de testes           | baseline                | ⚠️ 8 arquivos com `describe()` em 1222 src                                                                                                | Alimenta item #1 (meta ≥60%)               |
| Edge Functions com Zod        | grep                    | ⚠️ 0/245                                                                                                                                  | Alimenta item #2 (rollout gradual)         |
| Edge Functions com rate-limit | grep                    | ⚠️ 4/245                                                                                                                                  | Alimenta item #3 (`_shared/rate-limit.ts`) |
| Páginas com `<Helmet>`        | grep                    | ⚠️ 1/107                                                                                                                                  | Alimenta item #20                          |
| Componentes com ARIA          | grep                    | ⚠️ 32/516                                                                                                                                 | Alimenta item #21 (axe-core CI)            |

## Conclusões

1. **P0 #5 e #6 já estão OK** — `.qa-report/summary.md` estava desatualizado; regenerado nesta rodada.
2. **Backlog real** para atingir 10/10 está concentrado em Edge Functions (Zod + rate-limit + testes), SEO (Helmet), acessibilidade (axe), cobertura de testes e integrações externas.
3. **Integrações P1 (#7, #11, #12, #14, #15, #17)** exigem credenciais reais (Correios, SAP, TOTVS, AGV, App Store) e/ou decisões de produto — não podem ser executadas mecanicamente. Cada uma vira uma rodada dedicada quando o pré-requisito estiver disponível.
4. **Nenhuma falha crítica** detectada na simulação — projeto está em estado saudável, próximas rodadas focam em elevação de qualidade, não em firefighting.

## Próximos passos priorizados

1. Item #2 (Zod nas 20 Edge Functions críticas primeiro, expandir depois) → habilita item #19.
2. Item #3 (`_shared/rate-limit.ts` + aplicar em auth/pagamento) → 1 rodada.
3. Item #20 (Helmet nas 20 páginas públicas de maior tráfego) → 1-2 rodadas.
4. Item #21 (axe-core no `qa.yml`) → 1 rodada.
5. Item #1 (subir cobertura de 8 → alvo em `services/` + hooks críticos) → 3-4 rodadas.
