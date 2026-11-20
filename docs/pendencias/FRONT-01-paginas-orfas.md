# FRONT-01 — 35 páginas órfãs (sem rota)

- **Origem:** ESTADO_ATUAL.md 🟡8 (24 páginas órfãs, audit 16/08/2026).
- **Estado real (20/11/2026):** **35 páginas** em src/pages/** e src/features/*/pages/** sem rota registrada (0 referência de import nos 6 arquivos de rota: App, wmsRoutes, adminRoutes, analyticsRoutes, featureRoutes, publicRoutes). Método: parse de todos os import(...)/rom/import "" dos route files, resolução de @/ e relativo, contra os 120 arquivos de página em disco.
  - **Duplicatas com versão feature (provável legado):** src/pages/ConferenciaRecebimento (vs src/features/receiving/pages/ConferenciaRecebimento), src/pages/Recebimento (vs eatures/receiving/pages/RecebimentoPage), src/pages/Triagem (vs eatures/quality/pages/TriagemPage), src/pages/Estoque (vs eatures/inventory/pages/EstoquePage), src/pages/picking/PickingPage (vs eatures/picking/pages/PickingPage), src/pages/shipping/ShippingPage (vs eatures/shipping/pages/ShippingPage).
  - **Legadas analíticas:** CurvaABC, DashboardTempoReal, KPIsOperacionais, PrevisaoDemandaIA, OperationalMonitorPage (feature analytics não roteado).
  - **Reports EN:** InventoryReportPage, MovementReportPage, ReportsPage, TurnoverReportPage, ValuationReportPage.
  - **Outras:** DashboardPage, Error, Maintenance, admin/AuditLogs, alerts/AlertsPage, auth/Profile, auth/Settings, cycle-count/CycleCountPage, error/ForbiddenPage, error/NotFoundPage, locations/LocationDetailPage, locations/LocationsPage, lots/LotDetailPage, lots/LotsPage, products/ProductDetailPage, products/ProductsPage, receiving/ReceivingPage, suppliers/SupplierDetailPage, suppliers/SuppliersPage.
- **O que falta:** para cada órfã: (a) rotear se for funcionalidade viva/duplicada que faz algo distinto, (b) apontar rota para a versão feature e usar a legacy como arquivo de migração temporário, ou (c) deletar só se byte-por-byte provado que a versão feature cobre 100% do comportamento. Nenhuma pode sumir sem essa prova.
- **Camadas:** UI (rotas), sem banco.
- **Raio de impacto:** zero funcionalidade ativa (portal não referenciado não renderiza). Risco de duplicar manutenção (bug corrigido numa versão e não na outra).
- **Critério de aceite:** 35 órfãs classificadas; toda rota viva aponta para página com conteúdo correto; typecheck+lint+testes verdes; nenhuma feature perdida.
- **Bloqueio:** comparação byte-a-byte legacy vs feature (subagente) para as duplicadas.
- **Estado:** AGUARDANDO EXECUÇÃO.
