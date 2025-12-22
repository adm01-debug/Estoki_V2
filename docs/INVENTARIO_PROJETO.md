# 📦 INVENTÁRIO EXAUSTIVO DO PROJETO ESTOKI

**Data de Geração:** 2025-12-22  
**Sistema:** WMS (Warehouse Management System) para gestão de estoque e operações logísticas  
**Stack:** React 18.3 + TypeScript 5.8 + Vite 5.4 + Tailwind CSS + Supabase (Lovable Cloud)

---

## 📁 ESTRUTURA DE DIRETÓRIOS RAIZ

```
estoki/
├── .github/                    # Workflows CI/CD, templates
├── docs/                       # Documentação (23 arquivos .md)
├── e2e/                        # Testes E2E Playwright (14 specs)
├── public/                     # Assets estáticos e PWA
├── scripts/                    # Scripts de automação
├── src/                        # Código-fonte principal
├── supabase/                   # Backend (funções, migrações, seed)
├── tests/                      # Mocks e configuração de testes
└── [arquivos de configuração]
```

---

## 📂 SRC/ - CÓDIGO FONTE (DETALHADO)

### 📄 Arquivos Raiz (`src/`)
| Arquivo | Descrição |
|---------|-----------|
| `App.tsx` | Componente raiz com roteamento |
| `App.css` | Estilos globais da aplicação |
| `main.tsx` | Ponto de entrada React |
| `index.css` | Design system tokens (Tailwind) |
| `vite-env.d.ts` | Tipos Vite |
| `tailwind.config.lov.json` | Configuração Lovable |

---

### 📂 `src/components/` - COMPONENTES (34 subpastas)

#### 🏗️ Infraestrutura
| Pasta | Componentes | Descrição |
|-------|-------------|-----------|
| `ui/` | **71 arquivos** | Biblioteca shadcn/ui completa |
| `layout/` | AppLayout, Header, Sidebar, Footer, Breadcrumbs, PageHeader, PageContainer, PageTransition | Estrutura de layout |
| `common/` | Breadcrumbs, ErrorBoundary, KeyboardShortcuts, LoadingSpinner, OnlineIndicator, SearchCommand, SkipLink | Utilitários comuns |
| `theme/` | ThemeProvider, ThemeToggle | Sistema de temas dark/light |

#### 📊 Dashboard & KPIs
| Pasta | Componentes |
|-------|-------------|
| `dashboard/` | KPICard, MenuButton, ProgressRing, QuickActionButton |
| `kpi/` | KPICard, KPIGrid |
| `kpis/` | AlertIndicator, KPICardWithAlert, KPITrendIndicator |
| `charts/` | SimpleBarChart, SimpleLineChart, SimplePieChart (Recharts) |

#### 📦 Operações de Estoque
| Pasta | Componentes |
|-------|-------------|
| `estoque/` | NovaPosicaoDialog, PosicaoCard, PosicaoDetalhesDialog, PosicaoGrid, PositionCard, PositionGrid |
| `armazenamento/` | PosicaoStatusBadge |
| `inventario/` | StatusCicloCard |

#### 📥 Recebimento & Triagem
| Pasta | Componentes |
|-------|-------------|
| `recebimento/` | ImportarNFDialog, NovoRecebimentoDialog, RecebimentoCard |
| `triagem/` | AmostragemAutomatica, DefeitoHistorico, FotosLoteObrigatorias, TriagemCard, TriagemTimer, VolumeContagem |
| `conferencia/` | AssinaturaConferenciaDialog, AssinaturaDigital |

#### 🔄 Trocas & Movimentação
| Pasta | Componentes |
|-------|-------------|
| `trocas/` | RegistroCard, StatusBadge, TipoBadge, WorkflowProgress |

#### 🎮 Gamificação
| Pasta | Componentes |
|-------|-------------|
| `gamificacao/` | AchievementBadge, ConquistaNotificacoes, ConquistasSystem, DailyChallenge, DesafiosDiarios, PlacarLideres, StreakCounter, StreakIndicator, StreakSystem, XPBar |

#### 📱 Mobile & PWA
| Pasta | Componentes |
|-------|-------------|
| `mobile/` | BottomNav, PullToRefresh, SwipeableListItem |
| `pwa/` | InstallPrompt, UpdatePrompt |

#### 🔧 Utilitários
| Pasta | Componentes |
|-------|-------------|
| `scanner/` | BarcodeScanner, QRScanner, ScannerOCR |
| `camera/` | PhotoCapture |
| `etiquetas/` | GeradorEtiquetas |
| `export/` | ExportButton |
| `print/` | PrintButton |
| `filters/` | FilterBar |
| `forms/` | FormField, SelectField, TextareaField |
| `data/` | InfoItem, Timeline |
| `feedback/` | Alert, Toast |

#### 🔔 Notificações & Outros
| Pasta | Componentes |
|-------|-------------|
| `notifications/` | NotificacoesGlobais, NotificationBell, NotificationCenter |
| `onboarding/` | OnboardingTour |
| `auth/` | ProtectedRoute |
| `user/` | UserMenu |
| `fornecedores/` | DashboardFornecedores |
| `ia/` | PrevisaoDemandaIA |
| `relatorios/` | ReportFilters |

---

### 📂 `src/components/ui/` - BIBLIOTECA UI (71 componentes)

```
accordion.tsx, accordion-custom.tsx, alert.tsx, alert-dialog.tsx,
aspect-ratio.tsx, avatar.tsx, avatar-group.tsx, badge.tsx,
breadcrumb.tsx, button.tsx, calendar.tsx, card.tsx, carousel.tsx,
chart.tsx, checkbox.tsx, collapsible.tsx, command.tsx,
confirm-dialog.tsx, context-menu.tsx, copy-button.tsx, countdown.tsx,
data-table.tsx, date-range-picker.tsx, dialog.tsx, drawer.tsx,
dropdown-menu.tsx, empty-state.tsx, file-upload.tsx, form.tsx,
hover-card.tsx, input.tsx, input-otp.tsx, label.tsx, menubar.tsx,
modal.tsx, navigation-menu.tsx, pagination.tsx, popover.tsx,
progress.tsx, progress-bar.tsx, radio-group.tsx, resizable.tsx,
scroll-area.tsx, select.tsx, separator.tsx, sheet.tsx, sidebar.tsx,
skeleton.tsx, skeleton-card.tsx, slider.tsx, sonner.tsx,
stat-card.tsx, status-badge.tsx, switch.tsx, table.tsx, tabs.tsx,
tabs-custom.tsx, textarea.tsx, toast.tsx, toaster.tsx, toggle.tsx,
toggle-group.tsx, tooltip.tsx, tooltip-icon.tsx, use-toast.ts
+ 6 componentes extras (component-ui-215 a 220)
```

---

### 📂 `src/hooks/` - HOOKS CUSTOMIZADOS (48 hooks + 24 testes)

#### 🔄 Hooks de Dados (Supabase)
| Hook | Função |
|------|--------|
| `useEstoque` | CRUD posições de estoque |
| `useRecebimentos` | Gestão de recebimentos/lotes |
| `useTriagens` | Eventos de triagem |
| `useMovimentacoes` | Movimentações de estoque |
| `useTrocasDevolucoes` | Trocas e devoluções |
| `useRomaneios` | Romaneios de expedição |
| `useTarefas` | Gestão de tarefas |
| `useInventarioCiclico` | Ciclos de inventário |
| `useFornecedores` | Dados de fornecedores |
| `useDivergencias` | Divergências de recebimento |
| `useCurvaABC` | Análise curva ABC |

#### 🎮 Hooks de Gamificação
| Hook | Função |
|------|--------|
| `useGamificacao` | XP, níveis, progressão |
| `useConquistas` | Sistema de conquistas |
| `useDesafiosDiarios` | Desafios diários |
| `useStreaks` | Sequências de dias |
| `useRanking` | Ranking de usuários |
| `useProdutividade` | Métricas de produtividade |

#### 📊 Hooks de KPIs
| Hook | Função |
|------|--------|
| `useDashboard` | Dados do dashboard |
| `useKPIsOperacionais` | KPIs operacionais |
| `useKPIAlerts` | Alertas de KPI |
| `useRealtimeKPIs` | KPIs em tempo real |
| `useAtividadeRecente` | Atividades recentes |

#### 🔧 Hooks Utilitários
| Hook | Função |
|------|--------|
| `useScanner` | Leitura QR/código barras |
| `useBalanca` | Integração balança serial |
| `useTriagemTimer` | Timer de triagem |
| `useTriagemFotos` | Upload fotos triagem |
| `useTouchGestures` | Gestos mobile |
| `useNotificacoes` | Sistema notificações |
| `usePushNotifications` | Push notifications |
| `useAuditLog` | Log de auditoria |
| `useBulkActions` | Ações em lote |

#### 🎛️ Hooks de Estado/UI
| Hook | Função |
|------|--------|
| `useDebounce` | Debounce de valores |
| `useThrottle` | Throttle de valores |
| `useLocalStorage` | Persistência local |
| `useOnlineStatus` | Status de conexão |
| `useMediaQuery` | Media queries |
| `useWindowSize` | Tamanho da janela |
| `useScrollPosition` | Posição do scroll |
| `useKeyPress` | Teclas pressionadas |
| `useKeyboardShortcuts` | Atalhos de teclado |
| `useClickOutside` | Clique fora |
| `useClipboard` | Clipboard |
| `useFocus` | Gerenciamento de foco |
| `useToggle` | Toggle booleano |
| `useCounter` | Contador |
| `useList` | Lista manipulável |
| `useSet` | Set manipulável |
| `useMap` | Map manipulável |
| `usePrevious` | Valor anterior |
| `useInterval` | setInterval declarativo |
| `useEventListener` | Event listeners |
| `useAsync` | Estados assíncronos |
| `useQuery` | Queries genéricas |
| `useMutation` | Mutations genéricas |
| `useForm` | Formulários |
| `useFilter` | Filtros |
| `useSort` | Ordenação |
| `usePagination` | Paginação |

---

### 📂 `src/pages/` - PÁGINAS (27 páginas)

| Página | Rota | Descrição |
|--------|------|-----------|
| `Index.tsx` | `/` | Landing/Home |
| `Auth.tsx` | `/auth` | Login/Cadastro |
| `Dashboard.tsx` | `/dashboard` | Dashboard principal |
| `DashboardTriador.tsx` | `/triador` | Dashboard do triador |
| `DashboardTrocas.tsx` | `/trocas-dashboard` | Dashboard trocas |
| `Estoque.tsx` | `/estoque` | Gestão de posições |
| `Armazenamento.tsx` | `/armazenamento` | Mapa de armazenamento |
| `Movimentacao.tsx` | `/movimentacao` | Movimentações |
| `Recebimento.tsx` | `/recebimento` | Lista de recebimentos |
| `ConferenciaRecebimento.tsx` | `/conferencia/:id` | Conferência de lote |
| `Triagem.tsx` | `/triagem` | Lista de triagens |
| `FormularioTriagem.tsx` | `/triagem/:id` | Formulário de triagem |
| `TrocasDevolucoes.tsx` | `/trocas` | Gestão de trocas |
| `Romaneios.tsx` | `/romaneios` | Gestão de romaneios |
| `Scanner.tsx` | `/scanner` | Scanner QR/OCR |
| `Rastreabilidade.tsx` | `/rastreabilidade` | Rastreamento |
| `InventarioCiclico.tsx` | `/inventario` | Inventário cíclico |
| `GestaoTarefas.tsx` | `/tarefas` | Gestão de tarefas |
| `KPIsOperacionais.tsx` | `/kpis` | KPIs operacionais |
| `Produtividade.tsx` | `/produtividade` | Produtividade |
| `CurvaABC.tsx` | `/curva-abc` | Análise curva ABC |
| `AlertasInteligentes.tsx` | `/alertas` | Alertas inteligentes |
| `Relatorios.tsx` | `/relatorios` | Relatórios |
| `RelatorioDivergencias.tsx` | `/divergencias` | Relatório divergências |
| `RelatorioFornecedores.tsx` | `/fornecedores` | Relatório fornecedores |
| `Configuracoes.tsx` | `/configuracoes` | Configurações |
| `NotFound.tsx` | `*` | Página 404 |

---

### 📂 `src/services/` - SERVIÇOS (8 arquivos)

| Serviço | Função |
|---------|--------|
| `auditService.ts` | Log de auditoria |
| `gamificacaoService.ts` | Operações de gamificação |
| `movimentacaoService.ts` | Movimentações de estoque |
| `notificacaoService.ts` | Envio de notificações |
| `posicaoService.ts` | CRUD posições |
| `recebimentoService.ts` | CRUD recebimentos/lotes |
| `relatorioService.ts` | Geração de relatórios |
| `triagemService.ts` | CRUD triagens |

---

### 📂 `src/types/` - TIPOS TYPESCRIPT (16 arquivos)

| Arquivo | Tipos definidos |
|---------|-----------------|
| `armazenamento.ts` | Tipos de armazenamento |
| `dashboard.ts` | Tipos do dashboard |
| `estoque.ts` | Posição, Produto, Lote |
| `fornecedor.ts` | Fornecedor, Avaliação |
| `gamificacao.ts` | Conquista, Desafio, Streak, XP |
| `global.d.ts` | Tipos globais, ImportMeta |
| `index.ts` | Re-exports |
| `inventario.ts` | Ciclo, Contagem |
| `kpis.ts` | Métricas, Metas |
| `movimentacao.ts` | Movimentação |
| `posicao.ts` | Posição detalhada |
| `produtividade.ts` | Métricas de produtividade |
| `recebimento.ts` | Recebimento, Conferência |
| `relatorios.ts` | Tipos de relatórios |
| `tarefas.ts` | Tarefa, Onda |
| `test-modules.d.ts` | Tipos para testes |
| `triagem.ts` | Triagem, Resultado |
| `trocas.ts` | Troca, Devolução |
| `usuario.ts` | Usuário, Role |
| `web-serial.d.ts` | API Web Serial |

---

### 📂 `src/contexts/` - CONTEXTS REACT (5 arquivos)

| Context | Função |
|---------|--------|
| `AppContext.tsx` | Estado global da app |
| `AuthContext.tsx` | Autenticação Supabase |
| `NotificationContext.tsx` | Sistema de notificações |
| `ThemeContext.tsx` | Tema dark/light |
| `ToastContext.tsx` | Sistema de toasts |

---

### 📂 `src/lib/` - BIBLIOTECAS UTILITÁRIAS (15 arquivos)

| Arquivo | Função |
|---------|--------|
| `analytics.ts` | Analytics tracking |
| `cache.ts` | Cache em memória |
| `env.ts` | Variáveis de ambiente |
| `export.ts` | Exportação de dados |
| `featureFlags.ts` | Feature flags |
| `index.ts` | Re-exports |
| `logger.ts` | Sistema de logging |
| `offlineQueue.ts` | Fila offline |
| `performance.ts` | Métricas de performance |
| `rateLimiter.ts` | Rate limiting |
| `retry.ts` | Retry com backoff |
| `sentry.ts` | Error tracking (stub) |
| `storage.ts` | Storage abstraction |
| `utils.ts` | Utilitários (cn, etc) |
| `validation.ts` | Validações |

---

### 📂 `src/utils/` - FUNÇÕES UTILITÁRIAS (7 arquivos)

| Arquivo | Funções |
|---------|---------|
| `accessibility.ts` | Utilitários de a11y |
| `date.ts` | Formatação de datas |
| `exportExcel.ts` | Exportação Excel (xlsx) |
| `formatters.ts` | Formatadores (moeda, etc) |
| `index.ts` | Re-exports |
| `number.ts` | Formatação de números |
| `parseNFXML.ts` | Parser de XML de NF |
| `validators.ts` | Validações de dados |

---

### 📂 `src/config/` - CONFIGURAÇÕES (3 arquivos)

| Arquivo | Conteúdo |
|---------|----------|
| `index.ts` | Configurações gerais |
| `menu.ts` | Estrutura do menu |
| `routes.ts` | Definição de rotas |

---

## 📂 SUPABASE/ - BACKEND

### 📂 `supabase/functions/` - EDGE FUNCTIONS (7 funções)

| Função | Descrição |
|--------|-----------|
| `alerta-divergencia-fornecedor/` | Alertas de divergência |
| `calculate-kpis/` | Cálculo de KPIs |
| `generate-report/` | Geração de relatórios |
| `gerar-desafios-diarios/` | Geração de desafios |
| `notify-slack/` | Notificações Slack |
| `previsao-demanda/` | Previsão de demanda IA |
| `scanner-ocr/` | OCR de documentos |

### 📂 `supabase/migrations/` - MIGRAÇÕES (29 arquivos)

Migrações executadas em ordem cronológica:
- `001_initial.sql` - Schema inicial
- `001_rls_policies.sql` - Políticas RLS
- `002_gamificacao.sql` - Tabelas gamificação
- `002_indexes.sql` - Índices
- `003_audit_log.sql` - Auditoria
- `004_gamification.sql` - Expansão gamificação
- `005_notifications.sql` - Notificações
- `006_storage.sql` - Storage buckets
- `007_functions.sql` - Funções DB
- `20251216*` - Migrações automáticas
- `20251220*` - Migrações recentes

### Outros arquivos Supabase
- `config.toml` - Configuração Supabase
- `seed.sql` - Dados de seed

---

## 📊 BANCO DE DADOS - TABELAS (33 tabelas)

### 📦 Estoque & Produtos
| Tabela | Campos principais |
|--------|-------------------|
| `produtos` | id, sku, nome, descricao, curva_abc, estoque_minimo |
| `lotes` | id, numero_lote, produto_id, quantidade_atual, status, data_validade |
| `posicoes_estoque` | id, codigo, tipo, status, zona, porta_palete, nivel |
| `estoque_posicao` | id, posicao_id, produto_id, lote_id, quantidade |
| `regras_ponto_pedido` | id, produto_id, ponto_pedido, estoque_minimo |

### 📥 Operações
| Tabela | Campos principais |
|--------|-------------------|
| `eventos_triagem` | id, lote_id, operador_id, resultado, data_inicio, data_fim |
| `eventos_picking` | id, tarefa_id, operador_id, quantidade_separada |
| `tarefas` | id, tipo, status, operador_id, quantidade |
| `ondas_separacao` | id, codigo, status, total_tarefas |
| `rastreamento_historico` | id, tipo_evento, produto_id, lote_id, data_evento |
| `trocas_devolucoes` | id, tipo, motivo, status, cliente, produto |

### 📦 Expedição
| Tabela | Campos principais |
|--------|-------------------|
| `romaneios` | id, codigo, status, motorista, data_saida |
| `romaneio_itens` | id, romaneio_id, cliente, endereco_entrega |
| `comprovantes_entrega` | id, romaneio_id, status, assinatura_url |

### 🎮 Gamificação
| Tabela | Campos principais |
|--------|-------------------|
| `gamificacao_usuarios` | id, user_id, xp_total, nivel |
| `xp_historico` | id, user_id, quantidade, tipo, descricao |
| `conquistas_definicoes` | id, codigo, nome, criterio, meta, pontos |
| `conquistas_usuarios` | id, user_id, conquista_id, progresso, desbloqueada |
| `desafios_diarios` | id, titulo, tipo, meta, xp_recompensa, data_ativo |
| `desafios_usuarios` | id, user_id, desafio_id, progresso, concluido |
| `streaks_usuarios` | id, user_id, streak_atual, streak_recorde |
| `streaks_historico` | id, user_id, data, xp_ganho |

### 📊 KPIs & Alertas
| Tabela | Campos principais |
|--------|-------------------|
| `metricas_operacionais` | id, data, taxa_ocupacao, acuracidade_picking |
| `metas_kpi` | id, metrica, valor_meta, tipo |
| `alertas_config` | id, tipo, severidade, threshold_valor |
| `alertas_historico` | id, tipo, titulo, status, severidade |

### 📋 Inventário
| Tabela | Campos principais |
|--------|-------------------|
| `inventario_ciclos` | id, nome, status, data_agendada, acuracidade |
| `inventario_contagens` | id, ciclo_id, posicao_id, quantidade_contada |
| `inventario_config` | id, meta_acuracidade, threshold_divergencia |

### 👤 Usuários
| Tabela | Campos principais |
|--------|-------------------|
| `profiles` | id, nome, email |
| `user_roles` | id, user_id, role |
| `produtividade_operador` | id, operador_id, tarefas_concluidas, taxa_acerto |
| `notificacoes` | id, user_id, titulo, mensagem, lida |

---

## 🔧 FUNÇÕES DO BANCO DE DADOS (11 funções)

| Função | Descrição |
|--------|-----------|
| `adicionar_xp` | Adiciona XP e verifica level up |
| `registrar_checkin_diario` | Check-in diário para streaks |
| `trigger_xp_triagem_completa` | XP automático após triagem |
| `trigger_xp_tarefa_completa` | XP automático após tarefa |
| `trigger_atualizar_conquistas` | Atualiza progresso conquistas |
| `trigger_atualizar_desafios` | Atualiza progresso desafios |
| `trigger_notificacao_recebimento` | Notificações de recebimento |
| `has_role` | Verifica role do usuário |
| `get_user_role` | Obtém role do usuário |
| `handle_new_user` | Cria profile para novo usuário |
| `update_updated_at_column` | Atualiza timestamp |

---

## 🧪 TESTES

### E2E (Playwright) - 14 specs
```
accessibility.spec.ts, auth.spec.ts, configuracoes.spec.ts,
dashboard.spec.ts, estoque.spec.ts, gamificacao.spec.ts,
mobile.spec.ts, movimentacao.spec.ts, navigation.spec.ts,
performance.spec.ts, pwa.spec.ts, recebimento.spec.ts,
relatorios.spec.ts, triagem.spec.ts
```

### Unitários (Vitest) - 24 arquivos de teste
Todos os hooks principais possuem arquivo `.test.ts` correspondente.

---

## 📚 DOCUMENTAÇÃO (23 arquivos)

```
ACCESSIBILITY.md, ADMIN_GUIDE.md, API.md, API_ENDPOINTS.md,
API_SUPABASE.md, ARCHITECTURE.md, CHANGELOG.md, CODING_STANDARDS.md,
COMPONENTS.md, DATABASE.md, DATABASE_SCHEMA.md, DEPLOYMENT.md,
DEVELOPMENT.md, GAMIFICATION.md, HOOKS.md, INTEGRATIONS.md,
MOBILE.md, PAGES.md, PERFORMANCE.md, SECURITY.md, TESTING.md,
TROUBLESHOOTING.md, USER_GUIDE.md
```

---

## ⚙️ CONFIGURAÇÃO & CI/CD

### GitHub Workflows (5 workflows)
- `ci.yml` - Integração contínua
- `deploy.yml` - Deploy automático
- `e2e.yml` - Testes E2E
- `lighthouse.yml` - Auditoria performance
- `security.yml` - Scan de segurança

### Arquivos de Configuração
```
.editorconfig, .env, .env.example, .husky/pre-commit,
.lintstagedrc, .nvmrc, .prettierignore, .prettierrc,
commitlint.config.js, docker-compose.yml, Dockerfile,
eslint.config.js, lighthouserc.json, netlify.toml, nginx.conf,
playwright.config.ts, tailwind.config.ts, tsconfig.json,
tsconfig.app.json, tsconfig.node.json, vercel.json,
vite.config.ts, vitest.config.ts
```

---

## 📈 ESTATÍSTICAS DO PROJETO

| Métrica | Valor |
|---------|-------|
| **Total de Componentes** | ~150+ |
| **Componentes UI (shadcn)** | 71 |
| **Hooks Customizados** | 48 |
| **Páginas** | 27 |
| **Services** | 8 |
| **Edge Functions** | 7 |
| **Tabelas DB** | 33 |
| **Funções DB** | 11 |
| **Arquivos de Docs** | 23 |
| **Testes E2E** | 14 specs |
| **Testes Unitários** | 24 arquivos |
| **Migrações DB** | 29 |

---

## 🔒 SEGURANÇA (RLS)

Todas as 33 tabelas possuem **Row Level Security** habilitado com políticas específicas:
- Leitura pública para dados não sensíveis
- CRUD restrito por `auth.uid()` para dados do usuário
- Acesso administrativo via função `has_role()`
- Proteção contra DELETE em tabelas críticas

---

## 📝 NOTAS IMPORTANTES

1. **Arquivos gerados automaticamente** (não editar):
   - `src/integrations/supabase/client.ts`
   - `src/integrations/supabase/types.ts`
   - `.env`
   - `supabase/config.toml`

2. **Arquivos com `// @ts-nocheck`** (precisam revisão futura):
   - Vários arquivos de teste (.test.ts)
   - Alguns services que usam tabelas legacy

3. **Sincronização necessária**:
   - Alguns hooks/services referenciam tabelas antigas
   - Tipos precisam ser atualizados após migrações

---

*Documento gerado automaticamente pelo Lovable em parceria com Claude (Anthropic)*
