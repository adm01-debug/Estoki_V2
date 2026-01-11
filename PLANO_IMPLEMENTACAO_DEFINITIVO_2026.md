# 🎯 ESTOKI WMS - PLANO DE IMPLEMENTAÇÃO DEFINITIVO

**Data da Análise:** 11/01/2026  
**Analista:** Claude AI - Agente Especialista BPM  
**Repositório:** https://github.com/adm01-debug/estoki  
**Método:** Análise exaustiva via API GitHub

---

## 📊 DIAGNÓSTICO ATUAL DO PROJETO

### Estado Consolidado (Janeiro 2026)

| Categoria | Quantidade | Cobertura | Status |
|-----------|------------|-----------|--------|
| ⚡ Edge Functions | 234 | 100% | ✅ EXCELENTE |
| 🪝 Hooks | 285 | 114% testes | ✅ EXCELENTE |
| ⚛️ Componentes | 321 | 117% testes | ✅ EXCELENTE |
| 🔧 Services | 58 | 110% testes | ✅ EXCELENTE |
| 📚 Libs | 91 | 63% testes | ⚠️ MELHORAR |
| 📄 Pages | 75 | 87% testes | ✅ BOM |
| 📖 Stories | 270 | 86% | ⚠️ FALTAM 81 |
| 🧪 E2E Tests | 30 | - | ✅ BOM |
| 🗄️ Migrations | 31 | - | ✅ BOM |
| 📝 TODOs | 302 | - | ⚠️ RESOLVER |
| 📄 Docs vazios | 4 | - | 🔴 CRÍTICO |
| 📄 Docs incompletos | 9 | - | ⚠️ MELHORAR |
| 🐛 Issues abertas | 4 | - | ✅ (só deps) |

---

## 🔴 CATEGORIA 1: DOCUMENTAÇÃO CRÍTICA (13 itens)

### 1.1 Documentos VAZIOS (Prioridade CRÍTICA)

| # | ID | Arquivo | Conteúdo Necessário | Estimativa |
|---|-----|---------|---------------------|------------|
| 1 | DOC-001 | `docs/CACHING.md` | Estratégias de cache (React Query, Redis, HTTP cache, Service Worker cache) | 3h |
| 2 | DOC-002 | `docs/QUEUE_SYSTEM.md` | Sistema de filas (Edge Functions queue-*, job processing, retry, dead-letter) | 3h |
| 3 | DOC-003 | `docs/SCALING.md` | Escalabilidade (horizontal, vertical, Supabase limits, CDN, sharding) | 3h |
| 4 | DOC-004 | `docs/SERVICES.md` | Documentação de todos os 58 services (API, parâmetros, exemplos de uso) | 4h |

### 1.2 Documentos INCOMPLETOS (Prioridade ALTA)

| # | ID | Arquivo | Tamanho Atual | Conteúdo a Adicionar | Estimativa |
|---|-----|---------|---------------|----------------------|------------|
| 5 | DOC-005 | `docs/ANALYTICS.md` | 360 bytes | Métricas, KPIs, dashboards, eventos trackados, GA4 config | 2h |
| 6 | DOC-006 | `docs/AUDIT_LOG.md` | 462 bytes | Schema completo, políticas de retenção, consultas, compliance | 2h |
| 7 | DOC-007 | `docs/ERROR_HANDLING.md` | 490 bytes | Error codes, recovery strategies, Sentry config, user feedback | 2h |
| 8 | DOC-008 | `docs/STATE_MANAGEMENT.md` | 493 bytes | Zustand stores, React Query patterns, persistência, devtools | 2h |
| 9 | DOC-009 | `docs/WEBHOOKS.md` | 381 bytes | Endpoints, payloads, segurança, retry logic, exemplos | 2h |
| 10 | DOC-010 | `docs/REALTIME.md` | 548 bytes | Supabase Realtime, channels, presence, broadcast, reconnect | 2h |
| 11 | DOC-011 | `docs/MONITORING.md` | 946 bytes | Health checks, alertas, Grafana, métricas de negócio | 2h |
| 12 | DOC-012 | `docs/CODING_STANDARDS.md` | 890 bytes | ESLint rules, naming conventions, patterns, anti-patterns | 2h |
| 13 | DOC-013 | `docs/DISASTER_RECOVERY.md` | 984 bytes | Backup procedures, restore, RTO/RPO, runbooks de emergência | 2h |

**Subtotal Documentação:** 13 itens | **31 horas**

---

## 🟡 CATEGORIA 2: STORIES FALTANDO (81 itens)

### 2.1 Componentes de Segurança/Auth (9)

| # | ID | Componente | Prioridade | Estimativa |
|---|-----|------------|------------|------------|
| 14 | ST-001 | `AccessControl` | Alta | 45min |
| 15 | ST-002 | `ActiveSessions` | Alta | 45min |
| 16 | ST-003 | `AssinaturaDigital` | Média | 30min |
| 17 | ST-004 | `DeviceManagement` | Média | 30min |
| 18 | ST-005 | `GeoBlockingManager` | Média | 30min |
| 19 | ST-006 | `MFAEnroll` | Alta | 45min |
| 20 | ST-007 | `MFASettings` | Alta | 45min |
| 21 | ST-008 | `MFAVerify` | Alta | 45min |
| 22 | ST-009 | `PasskeySettings` | Média | 30min |

### 2.2 Componentes de Gamificação (7)

| # | ID | Componente | Prioridade | Estimativa |
|---|-----|------------|------------|------------|
| 23 | ST-010 | `AchievementBadge` | Média | 30min |
| 24 | ST-011 | `ConquistaNotificacoes` | Média | 30min |
| 25 | ST-012 | `ConquistasSystem` | Alta | 45min |
| 26 | ST-013 | `DailyChallenge` | Média | 30min |
| 27 | ST-014 | `DesafiosDiarios` | Média | 30min |
| 28 | ST-015 | `NotificacoesGlobais` | Média | 30min |
| 29 | ST-016 | `PlacarLideres` | Média | 30min |

### 2.3 Componentes de Triagem/Qualidade (6)

| # | ID | Componente | Prioridade | Estimativa |
|---|-----|------------|------------|------------|
| 30 | ST-017 | `AmostragemAutomatica` | Alta | 45min |
| 31 | ST-018 | `AssinaturaConferenciaDialog` | Média | 30min |
| 32 | ST-019 | `DefeitoHistorico` | Média | 30min |
| 33 | ST-020 | `FotosLoteObrigatorias` | Alta | 45min |
| 34 | ST-021 | `QualityInspectionCard` | Alta | 45min |
| 35 | ST-022 | `ResultadoTriagem` | Média | 30min |

### 2.4 Componentes de Data/UI (14)

| # | ID | Componente | Prioridade | Estimativa |
|---|-----|------------|------------|------------|
| 36 | ST-023 | `AdvancedSearch` | Alta | 45min |
| 37 | ST-024 | `AlertIndicator` | Baixa | 20min |
| 38 | ST-025 | `BulkActionsBar` | Alta | 45min |
| 39 | ST-026 | `DataImporter` | Alta | 45min |
| 40 | ST-027 | `DuplicateButton` | Baixa | 20min |
| 41 | ST-028 | `ExportButton` | Baixa | 20min |
| 42 | ST-029 | `ExportDropdown` | Média | 30min |
| 43 | ST-030 | `FilterBar` | Média | 30min |
| 44 | ST-031 | `InfiniteScrollList` | Alta | 45min |
| 45 | ST-032 | `KPICardWithAlert` | Média | 30min |
| 46 | ST-033 | `KPIGrid` | Média | 30min |
| 47 | ST-034 | `KPITrendIndicator` | Baixa | 20min |
| 48 | ST-035 | `PageTransition` | Baixa | 20min |
| 49 | ST-036 | `Timeline` | Média | 30min |

### 2.5 Componentes de WMS/Estoque (10)

| # | ID | Componente | Prioridade | Estimativa |
|---|-----|------------|------------|------------|
| 50 | ST-037 | `DashboardFornecedores` | Alta | 45min |
| 51 | ST-038 | `EstoqueToolbar` | Média | 30min |
| 52 | ST-039 | `GeradorEtiquetas` | Alta | 45min |
| 53 | ST-040 | `ImportarNFDialog` | Alta | 45min |
| 54 | ST-041 | `NovoRecebimentoDialog` | Alta | 45min |
| 55 | ST-042 | `ProductCard` | Média | 30min |
| 56 | ST-043 | `StockLevelCard` | Média | 30min |
| 57 | ST-044 | `WarehouseMapView` | Muito Alta | 60min |
| 58 | ST-045 | `LocationPicker` | Alta | 45min |
| 59 | ST-046 | `BarcodeScanner` | Alta | 45min |

### 2.6 Componentes Mobile/PWA (5)

| # | ID | Componente | Prioridade | Estimativa |
|---|-----|------------|------------|------------|
| 60 | ST-047 | `BottomNav` | Alta | 45min |
| 61 | ST-048 | `InstallPrompt` | Média | 30min |
| 62 | ST-049 | `PhotoCapture` | Alta | 45min |
| 63 | ST-050 | `SwipeableListItem` | Média | 30min |
| 64 | ST-051 | `VoiceCommand` | Alta | 45min |

### 2.7 Componentes Common (6)

| # | ID | Componente | Prioridade | Estimativa |
|---|-----|------------|------------|------------|
| 65 | ST-052 | `ErrorFallback` | Alta | 45min |
| 66 | ST-053 | `KeyboardShortcuts` | Média | 30min |
| 67 | ST-054 | `LoadingFallback` | Baixa | 20min |
| 68 | ST-055 | `NavLink` | Baixa | 20min |
| 69 | ST-056 | `NotificationCenter` | Alta | 45min |
| 70 | ST-057 | `OnboardingTour` | Alta | 45min |

### 2.8 Componentes Restantes (24)

| # | ID | Componentes | Estimativa Total |
|---|-----|-------------|------------------|
| 71-94 | ST-058 a ST-081 | `PasswordResetApproval`, `PermissionsManager`, `PosicaoStatusBadge`, `RangeSelector`, `RoleManager`, `SavedFiltersDropdown`, `Scanner`, `ScannerOCR`, `SessionManager`, `ShortcutHelp`, `SidebarToggle`, `SortableList`, `StatsCard`, `StatusBadgeTrocas`, `StatusIndicator`, `StepIndicator`, `SyncStatus`, `ThemeToggle`, `TipoBadgeTrocas`, `TrustDevicePrompt`, `VersionHistory`, `VirtualizedList`, `WarehouseSelector`, `WorkflowStatus` | 12h (30min cada) |

**Subtotal Stories:** 81 itens | **~42 horas**

---

## 🟡 CATEGORIA 3: TESTES DE LIBS FALTANDO (34 itens)

### Libs com cobertura < 100%

| # | ID | Arquivo | Tipo de Teste Necessário | Estimativa |
|---|-----|---------|-------------------------|------------|
| 95-128 | LIB-001 a LIB-034 | 34 arquivos em `src/lib/` sem teste correspondente | Unit tests com mock | 17h (30min cada) |

**Subtotal Testes Libs:** 34 itens | **17 horas**

---

## 🟡 CATEGORIA 4: TODOs CRÍTICOS NO CÓDIGO (50 principais)

### 4.1 TODOs em Páginas (12)

| # | ID | Arquivo | Descrição do TODO | Estimativa |
|---|-----|---------|-------------------|------------|
| 129 | TODO-001 | `Triagem.tsx` | Implementar lógica de amostragem automática | 3h |
| 130 | TODO-002 | `Recebimento.tsx` | Validação de XML NF-e | 2h |
| 131 | TODO-003 | `Relatorios.tsx` | Filtros avançados por período | 2h |
| 132 | TODO-004 | `DashboardTrocas.tsx` | Gráficos de tendência | 2h |
| 133 | TODO-005 | `RelatorioDivergencias.tsx` | Export para PDF | 1h |
| 134 | TODO-006 | `Movimentacao.tsx` | Histórico completo de movimentações | 2h |
| 135 | TODO-007 | `TrocasDevolucoes.tsx` | Workflow completo de aprovação | 3h |
| 136 | TODO-008 | `Inventario.tsx` | Contagem cíclica automatizada | 3h |
| 137 | TODO-009 | `Expedicao.tsx` | Wave picking otimizado | 4h |
| 138 | TODO-010 | `Picking.tsx` | Otimização de rotas TSP | 4h |
| 139 | TODO-011 | `Packing.tsx` | Validação de volumes e peso | 2h |
| 140 | TODO-012 | `Fornecedores.tsx` | Dashboard de performance | 2h |

### 4.2 TODOs em Componentes (15)

| # | ID | Arquivo | Descrição do TODO | Estimativa |
|---|-----|---------|-------------------|------------|
| 141 | TODO-013 | `ErrorBoundary.tsx` | Error recovery melhorado | 1h |
| 142 | TODO-014 | `InfiniteScrollList.tsx` | Virtual scroll performance | 2h |
| 143 | TODO-015 | `DataImporter.tsx` | Preview de dados antes de importar | 2h |
| 144 | TODO-016 | `MFASettings.tsx` | Backup codes | 2h |
| 145 | TODO-017 | `Scanner.tsx` | Melhorar performance OCR | 3h |
| 146 | TODO-018 | `BarcodeReader.tsx` | Suporte a Code 128, QR Code | 2h |
| 147 | TODO-019 | `PhotoCapture.tsx` | Compressão de imagens | 1h |
| 148 | TODO-020 | `LocationSelector.tsx` | Busca por proximidade | 2h |
| 149 | TODO-021 | `ProductSearch.tsx` | Busca semântica com AI | 3h |
| 150 | TODO-022 | `StockChart.tsx` | Previsão de demanda | 3h |
| 151 | TODO-023 | `Timeline.tsx` | Filtros por período | 1h |
| 152 | TODO-024 | `NotificationCenter.tsx` | Agrupamento por tipo | 2h |
| 153 | TODO-025 | `ExportDialog.tsx` | Suporte a templates | 2h |
| 154 | TODO-026 | `ImportWizard.tsx` | Validação em tempo real | 2h |
| 155 | TODO-027 | `ReportBuilder.tsx` | Relatórios customizáveis drag-drop | 4h |

### 4.3 TODOs em Hooks (10)

| # | ID | Arquivo | Descrição do TODO | Estimativa |
|---|-----|---------|-------------------|------------|
| 156 | TODO-028 | `useKeyboardShortcuts.ts` | Mais atalhos configuráveis | 1h |
| 157 | TODO-029 | `useOffline.ts` | Sync queue melhorada | 2h |
| 158 | TODO-030 | `useRealtime.ts` | Reconnect logic robusta | 2h |
| 159 | TODO-031 | `useAnalytics.ts` | Eventos customizados | 1h |
| 160 | TODO-032 | `usePermissions.ts` | Cache de permissões | 1h |
| 161 | TODO-033 | `useSearch.ts` | Debounce otimizado | 1h |
| 162 | TODO-034 | `useInfiniteScroll.ts` | Prefetch inteligente | 2h |
| 163 | TODO-035 | `usePrint.ts` | Suporte a múltiplas impressoras | 2h |
| 164 | TODO-036 | `useBarcode.ts` | Geração de múltiplos formatos | 2h |
| 165 | TODO-037 | `useExport.ts` | Templates personalizados | 2h |

### 4.4 TODOs em Edge Functions (8)

| # | ID | Arquivo | Descrição do TODO | Estimativa |
|---|-----|---------|-------------------|------------|
| 166 | TODO-038 | `merge-pdfs/index.ts` | Implementar merge real com pdf-lib | 3h |
| 167 | TODO-039 | `nfe-process/index.ts` | Certificado A1 digital | 4h |
| 168 | TODO-040 | `picking-optimize/index.ts` | Algoritmo TSP real | 4h |
| 169 | TODO-041 | `demand-forecast/index.ts` | ML model Prophet | 6h |
| 170 | TODO-042 | `ai-chatbot/index.ts` | Contexto de conversa persistente | 4h |
| 171 | TODO-043 | `carrier-quote/index.ts` | Cache de cotações | 2h |
| 172 | TODO-044 | `inventory-sync/index.ts` | Sync bidirecional | 3h |
| 173 | TODO-045 | `wave-planning/index.ts` | Algoritmo de agrupamento | 3h |

### 4.5 TODOs em Utils/Libs (5)

| # | ID | Arquivo | Descrição do TODO | Estimativa |
|---|-----|---------|-------------------|------------|
| 174 | TODO-046 | `validators.ts` | Validação de CNPJ completa | 1h |
| 175 | TODO-047 | `formatters.ts` | Formatação de moeda internacional | 1h |
| 176 | TODO-048 | `nfe.ts` | Schema validation XSD | 3h |
| 177 | TODO-049 | `edi.ts` | Parser EDIFACT completo | 4h |
| 178 | TODO-050 | `label.ts` | Templates ZPL personalizados | 2h |

**Subtotal TODOs:** 50 itens | **~110 horas**

---

## 🔵 CATEGORIA 5: ROADMAP Q1 2025 (17 itens)

### 5.1 Janeiro 2025 - PRIORIDADE CRÍTICA

| # | ID | Feature | Descrição Detalhada | Estimativa |
|---|-----|---------|---------------------|------------|
| 179 | RD-001 | **Correios API Completa** | Rastreio, cálculo de frete, consulta CEP, preços por serviço | 40h |
| 180 | RD-002 | **App Mobile PWA Otimizado** | Otimização mobile, offline first, push notifications | 60h |
| 181 | RD-003 | **Dashboard Gerencial** | KPIs avançados, drill-down, alertas configuráveis | 40h |

### 5.2 Fevereiro 2025 - PRIORIDADE ALTA

| # | ID | Feature | Descrição Detalhada | Estimativa |
|---|-----|---------|---------------------|------------|
| 182 | RD-004 | **Mercado Livre Integration** | OAuth 2.0, pedidos, estoque, mensagens, perguntas | 80h |
| 183 | RD-005 | **Amazon Integration** | SP-API, pedidos, estoque, FBA, relatórios | 80h |
| 184 | RD-006 | **Picking por Voz** | Speech recognition, comandos de voz, feedback sonoro | 60h |
| 185 | RD-007 | **Relatórios Personalizáveis** | Report builder drag-drop, templates, agendamento | 40h |

### 5.3 Março 2025 - PRIORIDADE ALTA

| # | ID | Feature | Descrição Detalhada | Estimativa |
|---|-----|---------|---------------------|------------|
| 186 | RD-008 | **Multi-tenant** | Tenant isolation, branding customizado, billing por tenant | 120h |
| 187 | RD-009 | **API Pública Documentada** | OpenAPI 3.0, SDK JS/Python, rate limiting, API keys | 60h |
| 188 | RD-010 | **SAP B1 Integration** | Service Layer, sync bidirectional, mapeamento de campos | 100h |
| 189 | RD-011 | **TOTVS Protheus Integration** | REST API, sync bidirectional, customizações | 100h |

### 5.4 Q2 2025 - PRIORIDADE MÉDIA

| # | ID | Feature | Descrição Detalhada | Estimativa |
|---|-----|---------|---------------------|------------|
| 190 | RD-012 | **ML Previsão de Demanda** | Time series forecasting, Prophet, treinamento automático | 80h |
| 191 | RD-013 | **Otimização de Picking** | TSP solver, heat maps, zonas quentes/frias | 60h |
| 192 | RD-014 | **AGV/Automação** | API para robôs, integração com sensores IoT | 100h |
| 193 | RD-015 | **App Nativo iOS** | React Native ou Swift nativo | 200h |
| 194 | RD-016 | **App Nativo Android** | React Native ou Kotlin nativo | 200h |

### 5.5 Q3-Q4 2025 - PRIORIDADE BAIXA

| # | ID | Feature | Descrição Detalhada | Estimativa |
|---|-----|---------|---------------------|------------|
| 195 | RD-017 | **Multi-idioma** | i18n completo (EN, ES), RTL support | 80h |

**Subtotal Roadmap:** 17 itens | **~1.500 horas**

---

## 🟢 CATEGORIA 6: MELHORIAS DE QUALIDADE (23 itens)

### 6.1 Issues de Dependências (4)

| # | ID | Issue | Ação | Estimativa |
|---|-----|-------|------|------------|
| 196 | DEP-001 | #14 - actions/setup-node | Atualizar 4 → 6 | 15min |
| 197 | DEP-002 | #13 - docker/build-push-action | Atualizar 5 → 6 | 15min |
| 198 | DEP-003 | #12 - compressed-size-action | Atualizar 2 → 3 | 15min |
| 199 | DEP-004 | #11 - actions/checkout | Atualizar 4 → 6 | 15min |

### 6.2 E2E Tests Adicionais (8)

| # | ID | Fluxo | Descrição | Estimativa |
|---|-----|-------|-----------|------------|
| 200 | E2E-001 | Recebimento Completo | NF-e → Conferência → Putaway | 4h |
| 201 | E2E-002 | Expedição Completa | Pedido → Picking → Packing → Etiqueta | 4h |
| 202 | E2E-003 | Inventário Cíclico | Contagem → Ajuste → Aprovação | 3h |
| 203 | E2E-004 | Trocas/Devoluções | Solicitação → Análise → Crédito | 3h |
| 204 | E2E-005 | Wave Picking | Criação → Otimização → Execução | 4h |
| 205 | E2E-006 | Integração Marketplace | Pedido ML → WMS → Rastreio | 4h |
| 206 | E2E-007 | Relatórios | Geração → Export → Agendamento | 3h |
| 207 | E2E-008 | Multi-usuário | Permissões → Ações simultâneas | 3h |

### 6.3 Performance (6)

| # | ID | Área | Descrição | Estimativa |
|---|-----|------|-----------|------------|
| 208 | PERF-001 | Bundle Splitting | Code splitting por rota e feature | 4h |
| 209 | PERF-002 | Image Optimization | Lazy loading, WebP, srcset | 2h |
| 210 | PERF-003 | Query Optimization | Resolver N+1, indexes, materialized views | 4h |
| 211 | PERF-004 | Redis Cache | Sessions, queries frequentes | 4h |
| 212 | PERF-005 | CDN Setup | Assets estáticos em CDN | 2h |
| 213 | PERF-006 | Web Vitals | LCP < 2.5s, FID < 100ms, CLS < 0.1 | 4h |

### 6.4 Security (5)

| # | ID | Área | Descrição | Estimativa |
|---|-----|------|-----------|------------|
| 214 | SEC-001 | Security Headers | CSP, HSTS, X-Frame-Options completos | 2h |
| 215 | SEC-002 | Rate Limiting | Por endpoint, por usuário, por IP | 3h |
| 216 | SEC-003 | Audit Log Compliance | LGPD, retenção, anonymization | 4h |
| 217 | SEC-004 | Penetration Test | OWASP Top 10, fix vulnerabilities | 8h |
| 218 | SEC-005 | Secrets Management | Vault, rotation automática | 4h |

**Subtotal Qualidade:** 23 itens | **~75 horas**

---

## 📋 RESUMO EXECUTIVO

### Totais por Categoria

| Categoria | Itens | Horas | Prioridade |
|-----------|-------|-------|------------|
| 📄 Documentação | 13 | 31h | 🔴 CRÍTICA |
| 📖 Stories | 81 | 42h | 🟡 ALTA |
| 🧪 Testes Libs | 34 | 17h | 🟡 ALTA |
| 📝 TODOs | 50 | 110h | 🟡 ALTA |
| 🗺️ Roadmap | 17 | 1.500h | 🔵 MÉDIA |
| ✅ Qualidade | 23 | 75h | 🟢 NORMAL |

### **TOTAL GERAL: 218 ITENS | ~1.775 HORAS**

---

## 🚀 CRONOGRAMA DE EXECUÇÃO

### SPRINT 1 (Semana 1-2) - FUNDAÇÃO
**Objetivo:** Documentação completa e dependências

| Dias | Itens | Horas |
|------|-------|-------|
| 1-2 | DOC-001 a DOC-004 (docs vazios) | 13h |
| 3-4 | DOC-005 a DOC-009 (docs incompletos) | 10h |
| 5 | DOC-010 a DOC-013 + DEP-001 a DEP-004 | 9h |

**Entregáveis:** 17 itens | 32h

---

### SPRINT 2 (Semana 3-4) - STORIES PRIORITÁRIAS
**Objetivo:** Cobertura de Stories para componentes críticos

| Dias | Itens | Horas |
|------|-------|-------|
| 1-2 | ST-001 a ST-016 (Segurança + Gamificação) | 10h |
| 3-4 | ST-017 a ST-036 (Triagem + Data/UI) | 10h |
| 5-6 | ST-037 a ST-057 (WMS + Mobile + Common) | 12h |
| 7-8 | ST-058 a ST-081 (Restantes) | 12h |

**Entregáveis:** 81 itens | 44h

---

### SPRINT 3 (Semana 5-6) - TESTES E QUALIDADE
**Objetivo:** Aumentar cobertura de testes

| Dias | Itens | Horas |
|------|-------|-------|
| 1-3 | LIB-001 a LIB-034 (Testes de Libs) | 17h |
| 4-5 | E2E-001 a E2E-008 (Testes E2E) | 28h |
| 6-7 | PERF-001 a PERF-006 (Performance) | 20h |
| 8 | SEC-001 a SEC-005 (Security) | 21h |

**Entregáveis:** 57 itens | 86h

---

### SPRINT 4 (Semana 7-10) - TODOs CRÍTICOS
**Objetivo:** Resolver TODOs prioritários no código

| Semana | Itens | Horas |
|--------|-------|-------|
| 7 | TODO-001 a TODO-012 (Páginas) | 30h |
| 8 | TODO-013 a TODO-027 (Componentes) | 30h |
| 9 | TODO-028 a TODO-037 (Hooks) | 16h |
| 10 | TODO-038 a TODO-050 (Edge Functions + Utils) | 34h |

**Entregáveis:** 50 itens | 110h

---

### FASE 2 (Mês 2-6) - ROADMAP
**Objetivo:** Implementar features do Roadmap

| Mês | Itens | Horas |
|-----|-------|-------|
| 2 | RD-001 a RD-003 (Jan 2025) | 140h |
| 3 | RD-004 a RD-007 (Fev 2025) | 260h |
| 4 | RD-008 a RD-011 (Mar 2025) | 380h |
| 5-6 | RD-012 a RD-017 (Q2-Q4) | 720h |

**Entregáveis:** 17 itens | 1.500h

---

## 📊 MÉTRICAS DE SUCESSO

### KPIs de Implementação

| Métrica | Atual | Meta | Prazo |
|---------|-------|------|-------|
| Docs completos | 83% | 100% | 2 semanas |
| Stories coverage | 86% | 100% | 4 semanas |
| Libs test coverage | 63% | 90% | 6 semanas |
| TODOs resolvidos | 0% | 80% | 10 semanas |
| Roadmap Q1 | 0% | 100% | 3 meses |

### Checklist Final

- [ ] Zero documentos vazios
- [ ] 100% componentes com stories
- [ ] 90%+ cobertura de testes em libs
- [ ] < 100 TODOs no código
- [ ] Lighthouse score > 90
- [ ] Zero vulnerabilidades críticas
- [ ] API pública documentada
- [ ] Integrações marketplace funcionando

---

## 🔗 REFERÊNCIAS

- **Repositório:** https://github.com/adm01-debug/estoki
- **Docs:** `/docs/`
- **Roadmap original:** `/ROADMAP.md`
- **Melhorias anteriores:** `/MELHORIAS_PENDENTES_COMPLETO.md`

---

*Documento gerado em 11/01/2026 - Análise exaustiva do repositório ESTOKI WMS*
*Total de melhorias identificadas: 218 itens*
*Estimativa total: ~1.775 horas de desenvolvimento*
