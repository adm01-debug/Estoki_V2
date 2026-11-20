# Regras de negócio — Estoki_V2 (mapa de camadas)
Levantado na Fase 0 (baseline 20/11/2026) a partir das camadas de serviço e features. Cada item do backlog (Fase 2) referencia este mapa; regras finas (validações por campo, status transitórios) serão detalhadas por feature conforme executada.

## Domínio principal: WMS (armazém)
1. **Recebimento** — notas/mercadorias entram no armazém; gera conferência de recebimento e movimentação de entrada. (features/receiving)
2. **Qualidade/Triagem** — após receber, itens passam por triagem/inspeção; caminhos aprovado/recusado definem destino do estoque. (features/quality)
3. **Contagem cíclica (cycle count)** — auditoria física de estoque em pontos do armazém; divergência pode gerar ajuste. (src/pages/cycle-count + service)
4. **Armazenagem** — estoque vive em localizações (endereço) + lotes; uma unidade pertence a uma localização e um lote. (services: location, lot, stock, inventory, warehouse)
5. **Movimentação** — todo trânsito de item gera registro em movimentação (origem/destino/usuário/data). (services: movimentacao)
6. **Picking** — separação para pedido/expedição a partir de localizações; gerencia prioridade e rota de separação. (features/picking)
7. **Shipping** — expedição: monta romaneio/carga e baixa estoque no despacho. (features/shipping)
8. **Pedidos/Clientes** — pedido de venda puxa estoque disponível; cliente referencia o pedido. (services: order, customer)
9. **Produtos/Categorias/Fornecedores** — cadastros mestres; produto tem categoria; fornecedor fornece produto. (services: product, category, supplier; batch)
10. **Controle de qualidade** — registra inspeções/resultados por lote/produto. (services: quality)
11. **ABC / Analytics** — curva ABC de itens; métricas operacionais e de performance. (features/analytics, services: analytics, abc, relatorio)
12. **Alertas/Notificações/Clocks** — alertas de estoque baixo/expiração/SLA; notificações de usuários; gamificação diária (desafios). (services: alert, notificacao, gamificacao)
13. **Auditoria** — trilha de ações (audit log) para rastreabilidade. (services: audit)
14. **Auth/Perfil/Backup** — autenticação de usuários; backup do schema e restore. (services: auth, backup)

## Camadas
- **Front:** React SPA — src/pages + src/features/*/pages + rotas (wms/admin/analytics/feature/public). 120 arquivos de página; 35 órfãos (FRONT-01).
- **Serviços front:** src/services/*.ts (24) + src/features/*/services (3). Chamam Supabase via .from().
- **Backend:** Edge Functions Supabase — 100 deployadas (limite do plano), 250 dirs locais. 20 com .from() para tabelas inexistentes (BANCO-01).
- **Banco:** PostgreSQL + Postgres (Supabase) — 86 tabelas public, RLS 100% ativo (250 policies), 56 triggers. Produção vazia (só desafios_diarios com dados). 30+ triggers de auditoria do schema EN em análise (BANCO-01/02).

## Regras transversais
- **RLS:** toda tabela tem policy; serviço cliente usa anon/key (publishable), sem bypass por função exceto service_role onde necessário.
- **Migração:** somente aditiva (constraint aditiva; nunca drop quebrável) — ver docs/pendencias/_linha-de-base.md.
- **Zero regressão:** antes de fechar item, typecheck + lint + testes; CI main continua verde.