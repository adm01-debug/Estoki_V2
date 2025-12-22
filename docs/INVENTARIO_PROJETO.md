# 📦 INVENTÁRIO EXAUSTIVO DO PROJETO ESTOKI

**Data de Geração:** 2025-12-22  
**Sistema:** WMS (Warehouse Management System) para gestão de estoque e operações logísticas  
**Stack:** React 18.3 + TypeScript 5.8 + Vite 5.4 + Tailwind CSS + Supabase (Lovable Cloud)  
**Colaboração:** Lovable AI + Claude (Anthropic)

---

## 📁 ESTRUTURA DE DIRETÓRIOS RAIZ (COMPLETA)

```
estoki/
├── .editorconfig                    # Configuração de editor
├── .env                             # Variáveis de ambiente (auto-gerado)
├── .env.example                     # Exemplo de variáveis
├── .github/                         # GitHub Actions & Templates
│   ├── CODEOWNERS
│   ├── dependabot.yml
│   ├── ISSUE_TEMPLATE/
│   │   ├── bug_report.md
│   │   └── feature_request.md
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       ├── ci.yml                   # Integração contínua
│       ├── deploy.yml               # Deploy automático
│       ├── e2e.yml                  # Testes E2E
│       ├── lighthouse.yml           # Auditoria performance
│       └── security.yml             # Scan de segurança
├── .husky/
│   └── pre-commit                   # Git hooks
├── .lintstagedrc                    # Lint-staged config
├── .nvmrc                           # Node version
├── .prettierignore                  # Prettier ignore
├── .prettierrc                      # Prettier config
├── CHANGELOG.md                     # Histórico de mudanças
├── CONTRIBUTING.md                  # Guia de contribuição
├── Dockerfile                       # Container Docker
├── LICENSE                          # Licença do projeto
├── MELHORIAS_COMPLETAS.md           # Lista de melhorias
├── README.md                        # Documentação principal
├── README_PT.md                     # README em português
├── SECURITY.md                      # Política de segurança
├── commitlint.config.js             # Conventional commits
├── docker-compose.yml               # Docker compose
├── docs/                            # Documentação (24 arquivos)
├── e2e/                             # Testes E2E (14 specs)
├── eslint.config.js                 # ESLint config
├── index.html                       # HTML principal
├── lighthouserc.json                # Lighthouse CI config
├── netlify.toml                     # Netlify deploy config
├── nginx.conf                       # Nginx config
├── playwright.config.ts             # Playwright config
├── public/                          # Assets estáticos
├── scripts/                         # Scripts de automação
├── src/                             # Código-fonte
├── supabase/                        # Backend Supabase
├── tailwind.config.ts               # Tailwind CSS config
├── tests/                           # Mocks e setup de testes
├── tsconfig.app.json                # TypeScript app config
├── tsconfig.json                    # TypeScript config
├── tsconfig.node.json               # TypeScript node config
├── vercel.json                      # Vercel deploy config
├── vite.config.ts                   # Vite config
└── vitest.config.ts                 # Vitest config
```

---

## 📂 SRC/ - CÓDIGO FONTE DETALHADO

### 📄 Arquivos Raiz (`src/`)

| Arquivo | Descrição | Linhas |
|---------|-----------|--------|
| `App.tsx` | Componente raiz com React Router | ~150 |
| `App.css` | Estilos globais e animações | ~50 |
| `main.tsx` | Ponto de entrada, providers | ~30 |
| `index.css` | Design system tokens (Tailwind) | ~300 |
| `vite-env.d.ts` | Tipos Vite | ~10 |

---

## 📂 SRC/COMPONENTS/ - COMPONENTES (34 PASTAS, 160+ COMPONENTES)

### 🏗️ UI LIBRARY (`src/components/ui/`) - 71 COMPONENTES

Biblioteca completa shadcn/ui com todos os primitivos:

| Componente | Arquivo | Descrição |
|------------|---------|-----------|
| Accordion | `accordion.tsx`, `accordion-custom.tsx` | Painéis expansíveis |
| Alert | `alert.tsx`, `alert-dialog.tsx` | Alertas e diálogos de alerta |
| AspectRatio | `aspect-ratio.tsx` | Proporção de aspecto |
| Avatar | `avatar.tsx`, `avatar-group.tsx` | Avatares de usuário |
| Badge | `badge.tsx` | Badges/tags |
| Breadcrumb | `breadcrumb.tsx` | Navegação breadcrumb |
| Button | `button.tsx` | Botões com variantes |
| Calendar | `calendar.tsx` | Calendário |
| Card | `card.tsx` | Cards/containers |
| Carousel | `carousel.tsx` | Carrossel (Embla) |
| Chart | `chart.tsx` | Wrapper Recharts |
| Checkbox | `checkbox.tsx` | Checkbox |
| Collapsible | `collapsible.tsx` | Painéis colapsáveis |
| Command | `command.tsx` | Command palette (cmdk) |
| ConfirmDialog | `confirm-dialog.tsx` | Diálogo de confirmação |
| ContextMenu | `context-menu.tsx` | Menu de contexto |
| CopyButton | `copy-button.tsx` | Botão copiar clipboard |
| Countdown | `countdown.tsx` | Timer countdown |
| DataTable | `data-table.tsx` | Tabela de dados |
| DateRangePicker | `date-range-picker.tsx` | Seletor de período |
| Dialog | `dialog.tsx` | Modal/diálogo |
| Drawer | `drawer.tsx` | Drawer lateral (Vaul) |
| DropdownMenu | `dropdown-menu.tsx` | Menu dropdown |
| EmptyState | `empty-state.tsx` | Estado vazio |
| FileUpload | `file-upload.tsx` | Upload de arquivos |
| Form | `form.tsx` | Formulários (React Hook Form) |
| HoverCard | `hover-card.tsx` | Card on hover |
| Input | `input.tsx`, `input-otp.tsx` | Inputs de texto e OTP |
| Label | `label.tsx` | Labels |
| Menubar | `menubar.tsx` | Barra de menu |
| Modal | `modal.tsx` | Modal customizado |
| NavigationMenu | `navigation-menu.tsx` | Menu de navegação |
| Pagination | `pagination.tsx` | Paginação |
| Popover | `popover.tsx` | Popover/tooltip |
| Progress | `progress.tsx`, `progress-bar.tsx` | Barras de progresso |
| RadioGroup | `radio-group.tsx` | Grupo de radio buttons |
| Resizable | `resizable.tsx` | Painéis redimensionáveis |
| ScrollArea | `scroll-area.tsx` | Área de scroll customizada |
| Select | `select.tsx` | Select dropdown |
| Separator | `separator.tsx` | Separadores |
| Sheet | `sheet.tsx` | Painel lateral |
| Sidebar | `sidebar.tsx` | Sidebar completa |
| Skeleton | `skeleton.tsx`, `skeleton-card.tsx` | Loading skeletons |
| Slider | `slider.tsx` | Slider/range |
| Sonner | `sonner.tsx` | Toasts (Sonner) |
| StatCard | `stat-card.tsx` | Card de estatística |
| StatusBadge | `status-badge.tsx` | Badge de status |
| Switch | `switch.tsx` | Toggle switch |
| Table | `table.tsx` | Tabela HTML |
| Tabs | `tabs.tsx`, `tabs-custom.tsx` | Abas |
| Textarea | `textarea.tsx` | Textarea |
| Toast | `toast.tsx`, `toaster.tsx` | Sistema de toasts |
| Toggle | `toggle.tsx`, `toggle-group.tsx` | Toggle buttons |
| Tooltip | `tooltip.tsx`, `tooltip-icon.tsx` | Tooltips |
| UseToast | `use-toast.ts` | Hook de toast |
| ComponentUI215-220 | `component-ui-215.tsx` a `component-ui-220.tsx` | Componentes extras |

---

### 🏠 LAYOUT (`src/components/layout/`) - 9 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| AppLayout | `AppLayout.tsx` | Layout principal com sidebar/header |
| Breadcrumbs | `Breadcrumbs.tsx` | Navegação breadcrumb |
| Footer | `Footer.tsx` | Rodapé |
| Header | `Header.tsx` | Cabeçalho principal |
| PageContainer | `PageContainer.tsx` | Container de página |
| PageHeader | `PageHeader.tsx` | Cabeçalho de página |
| PageTransition | `PageTransition.tsx` | Animação de transição (Framer Motion) |
| Sidebar | `Sidebar.tsx` | Sidebar de navegação |
| index.ts | `index.ts` | Re-exports |

---

### 🔧 COMMON (`src/components/common/`) - 8 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| Breadcrumbs | `Breadcrumbs.tsx` | Navegação breadcrumb alternativa |
| ErrorBoundary | `ErrorBoundary.tsx` | Captura de erros React |
| KeyboardShortcuts | `KeyboardShortcuts.tsx` | Modal de atalhos |
| LoadingSpinner | `LoadingSpinner.tsx` | Spinner de loading |
| OnlineIndicator | `OnlineIndicator.tsx` | Indicador online/offline |
| SearchCommand | `SearchCommand.tsx` | Busca global (Cmd+K) |
| SkipLink | `SkipLink.tsx` | Skip to content (a11y) |
| index.ts | `index.ts` | Re-exports |

---

### 📊 DASHBOARD (`src/components/dashboard/`) - 5 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| KPICard | `KPICard.tsx` | Card de KPI |
| MenuButton | `MenuButton.tsx` | Botão de menu |
| ProgressRing | `ProgressRing.tsx` | Anel de progresso SVG |
| QuickActionButton | `QuickActionButton.tsx` | Botão de ação rápida |
| index.ts | `index.ts` | Re-exports |

---

### 📈 KPI (`src/components/kpi/`) - 3 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| KPICard | `KPICard.tsx` | Card de KPI alternativo |
| KPIGrid | `KPIGrid.tsx` | Grid de KPIs |
| index.ts | `index.ts` | Re-exports |

---

### 📊 KPIS (`src/components/kpis/`) - 3 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| AlertIndicator | `AlertIndicator.tsx` | Indicador de alerta |
| KPICardWithAlert | `KPICardWithAlert.tsx` | Card KPI com alerta |
| KPITrendIndicator | `KPITrendIndicator.tsx` | Indicador de tendência |

---

### 📉 CHARTS (`src/components/charts/`) - 4 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| SimpleBarChart | `SimpleBarChart.tsx` | Gráfico de barras (Recharts) |
| SimpleLineChart | `SimpleLineChart.tsx` | Gráfico de linhas |
| SimplePieChart | `SimplePieChart.tsx` | Gráfico de pizza |
| index.ts | `index.ts` | Re-exports |

---

### 📦 ESTOQUE (`src/components/estoque/`) - 7 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| NovaPosicaoDialog | `NovaPosicaoDialog.tsx` | Dialog criar posição |
| PosicaoCard | `PosicaoCard.tsx` | Card de posição |
| PosicaoDetalhesDialog | `PosicaoDetalhesDialog.tsx` | Dialog detalhes |
| PosicaoGrid | `PosicaoGrid.tsx` | Grid de posições |
| PositionCard | `PositionCard.tsx` | Card alternativo |
| PositionGrid | `PositionGrid.tsx` | Grid alternativo |
| index.ts | `index.ts` | Re-exports |

---

### 🏪 ARMAZENAMENTO (`src/components/armazenamento/`) - 1 COMPONENTE

| Componente | Arquivo | Função |
|------------|---------|--------|
| PosicaoStatusBadge | `PosicaoStatusBadge.tsx` | Badge status posição |

---

### 📥 RECEBIMENTO (`src/components/recebimento/`) - 4 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| ImportarNFDialog | `ImportarNFDialog.tsx` | Dialog importar NF-e XML |
| NovoRecebimentoDialog | `NovoRecebimentoDialog.tsx` | Dialog novo recebimento |
| RecebimentoCard | `RecebimentoCard.tsx` | Card de recebimento |
| index.ts | `index.ts` | Re-exports |

---

### 🔍 TRIAGEM (`src/components/triagem/`) - 7 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| AmostragemAutomatica | `AmostragemAutomatica.tsx` | Cálculo amostragem |
| DefeitoHistorico | `DefeitoHistorico.tsx` | Histórico de defeitos |
| FotosLoteObrigatorias | `FotosLoteObrigatorias.tsx` | Upload fotos obrigatórias |
| TriagemCard | `TriagemCard.tsx` | Card de triagem |
| TriagemTimer | `TriagemTimer.tsx` | Timer de triagem |
| VolumeContagem | `VolumeContagem.tsx` | Contagem de volumes |
| index.ts | `index.ts` | Re-exports |

---

### ✅ CONFERENCIA (`src/components/conferencia/`) - 2 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| AssinaturaConferenciaDialog | `AssinaturaConferenciaDialog.tsx` | Dialog assinatura |
| AssinaturaDigital | `AssinaturaDigital.tsx` | Canvas assinatura digital |

---

### 🔄 TROCAS (`src/components/trocas/`) - 5 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| RegistroCard | `RegistroCard.tsx` | Card de troca/devolução |
| StatusBadge | `StatusBadge.tsx` | Badge de status TD |
| TipoBadge | `TipoBadge.tsx` | Badge tipo troca/devolução |
| WorkflowProgress | `WorkflowProgress.tsx` | Progresso do workflow |
| index.ts | `index.ts` | Re-exports |

---

### 🎮 GAMIFICACAO (`src/components/gamificacao/`) - 11 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| AchievementBadge | `AchievementBadge.tsx` | Badge de conquista |
| ConquistaNotificacoes | `ConquistaNotificacoes.tsx` | Notificações de conquista |
| ConquistasSystem | `ConquistasSystem.tsx` | Sistema de conquistas |
| DailyChallenge | `DailyChallenge.tsx` | Card desafio diário |
| DesafiosDiarios | `DesafiosDiarios.tsx` | Lista desafios |
| PlacarLideres | `PlacarLideres.tsx` | Leaderboard |
| StreakCounter | `StreakCounter.tsx` | Contador de streaks |
| StreakIndicator | `StreakIndicator.tsx` | Indicador de streak |
| StreakSystem | `StreakSystem.tsx` | Sistema de streaks |
| XPBar | `XPBar.tsx` | Barra de XP/nível |
| index.ts | `index.ts` | Re-exports |

---

### 📱 MOBILE (`src/components/mobile/`) - 4 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| BottomNav | `BottomNav.tsx` | Navegação inferior mobile |
| PullToRefresh | `PullToRefresh.tsx` | Pull to refresh |
| SwipeableListItem | `SwipeableListItem.tsx` | Item com swipe |
| index.ts | `index.ts` | Re-exports |

---

### 📲 PWA (`src/components/pwa/`) - 3 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| InstallPrompt | `InstallPrompt.tsx` | Prompt instalação PWA |
| UpdatePrompt | `UpdatePrompt.tsx` | Prompt atualização |
| index.ts | `index.ts` | Re-exports |

---

### 📷 SCANNER (`src/components/scanner/`) - 4 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| BarcodeScanner | `BarcodeScanner.tsx` | Scanner código de barras |
| QRScanner | `QRScanner.tsx` | Scanner QR Code (html5-qrcode) |
| ScannerOCR | `ScannerOCR.tsx` | OCR de documentos |
| index.ts | `index.ts` | Re-exports |

---

### 📸 CAMERA (`src/components/camera/`) - 2 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| PhotoCapture | `PhotoCapture.tsx` | Captura de foto |
| index.ts | `index.ts` | Re-exports |

---

### 🔔 NOTIFICATIONS (`src/components/notifications/`) - 4 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| NotificacoesGlobais | `NotificacoesGlobais.tsx` | Provider notificações |
| NotificationBell | `NotificationBell.tsx` | Sino de notificações |
| NotificationCenter | `NotificationCenter.tsx` | Centro de notificações |
| index.ts | `index.ts` | Re-exports |

---

### 📝 FORMS (`src/components/forms/`) - 4 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| FormField | `FormField.tsx` | Campo de formulário |
| SelectField | `SelectField.tsx` | Campo select |
| TextareaField | `TextareaField.tsx` | Campo textarea |
| index.ts | `index.ts` | Re-exports |

---

### 📊 DATA (`src/components/data/`) - 3 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| InfoItem | `InfoItem.tsx` | Item de informação |
| Timeline | `Timeline.tsx` | Timeline de eventos |
| index.ts | `index.ts` | Re-exports |

---

### 🎨 THEME (`src/components/theme/`) - 2 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| ThemeProvider | `ThemeProvider.tsx` | Provider de tema |
| ThemeToggle | `ThemeToggle.tsx` | Toggle dark/light |

---

### 📤 EXPORT (`src/components/export/`) - 2 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| ExportButton | `ExportButton.tsx` | Botão exportar dados |
| index.ts | `index.ts` | Re-exports |

---

### 🖨️ PRINT (`src/components/print/`) - 2 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| PrintButton | `PrintButton.tsx` | Botão imprimir |
| index.ts | `index.ts` | Re-exports |

---

### 🔍 FILTERS (`src/components/filters/`) - 2 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| FilterBar | `FilterBar.tsx` | Barra de filtros |
| index.ts | `index.ts` | Re-exports |

---

### ⚠️ FEEDBACK (`src/components/feedback/`) - 3 COMPONENTES

| Componente | Arquivo | Função |
|------------|---------|--------|
| Alert | `Alert.tsx` | Componente de alerta |
| Toast | `Toast.tsx` | Componente de toast |
| index.ts | `index.ts` | Re-exports |

---

### 🎯 OUTROS COMPONENTES

| Pasta | Componente | Função |
|-------|------------|--------|
| `auth/` | ProtectedRoute.tsx | Rota protegida |
| `user/` | UserMenu.tsx | Menu do usuário |
| `onboarding/` | OnboardingTour.tsx | Tour de onboarding |
| `etiquetas/` | GeradorEtiquetas.tsx | Gerador de etiquetas |
| `fornecedores/` | DashboardFornecedores.tsx | Dashboard fornecedores |
| `ia/` | PrevisaoDemandaIA.tsx | Previsão de demanda IA |
| `inventario/` | StatusCicloCard.tsx | Card status ciclo |
| `relatorios/` | ReportFilters.tsx | Filtros de relatório |

---

### 📄 Componentes Raiz (`src/components/`)

| Componente | Arquivo | Função |
|------------|---------|--------|
| ErrorBoundary | `ErrorBoundary.tsx` | Error boundary raiz |
| NavLink | `NavLink.tsx` | Link de navegação ativo |

---

## 📂 SRC/HOOKS/ - HOOKS CUSTOMIZADOS (48 HOOKS + 24 TESTES)

### 🔄 Hooks de Dados (Supabase)

| Hook | Arquivo | Teste | Função |
|------|---------|-------|--------|
| useEstoque | `useEstoque.ts` | ✅ | CRUD posições de estoque |
| useRecebimentos | `useRecebimentos.ts` | ✅ | Gestão de recebimentos/lotes |
| useTriagens | `useTriagens.ts` | ✅ | Eventos de triagem |
| useMovimentacoes | `useMovimentacoes.ts` | ✅ | Movimentações de estoque |
| useTrocasDevolucoes | `useTrocasDevolucoes.ts` | ✅ | Trocas e devoluções |
| useRomaneios | `useRomaneios.ts` | ✅ | Romaneios de expedição |
| useTarefas | `useTarefas.ts` | ✅ | Gestão de tarefas |
| useInventarioCiclico | `useInventarioCiclico.ts` | ✅ | Ciclos de inventário |
| useFornecedores | `useFornecedores.ts` | ✅ | Dados de fornecedores |
| useDivergencias | `useDivergencias.ts` | ✅ | Divergências de recebimento |
| useCurvaABC | `useCurvaABC.ts` | ✅ | Análise curva ABC |

### 🎮 Hooks de Gamificação

| Hook | Arquivo | Teste | Função |
|------|---------|-------|--------|
| useGamificacao | `useGamificacao.ts` | ✅ | XP, níveis, progressão |
| useConquistas | `useConquistas.ts` | ✅ | Sistema de conquistas |
| useDesafiosDiarios | `useDesafiosDiarios.ts` | ✅ | Desafios diários |
| useStreaks | `useStreaks.ts` | ✅ | Sequências de dias |
| useRanking | `useRanking.ts` | ✅ | Ranking de usuários |
| useProdutividade | `useProdutividade.ts` | ✅ | Métricas de produtividade |

### 📊 Hooks de KPIs

| Hook | Arquivo | Teste | Função |
|------|---------|-------|--------|
| useDashboard | `useDashboard.ts` | ✅ | Dados do dashboard |
| useKPIsOperacionais | `useKPIsOperacionais.ts` | ✅ | KPIs operacionais |
| useKPIAlerts | `useKPIAlerts.ts` | ✅ | Alertas de KPI |
| useRealtimeKPIs | `useRealtimeKPIs.ts` | ✅ | KPIs em tempo real |
| useAtividadeRecente | `useAtividadeRecente.ts` | ✅ | Atividades recentes |

### 🔧 Hooks Funcionais

| Hook | Arquivo | Teste | Função |
|------|---------|-------|--------|
| useScanner | `useScanner.ts` | ✅ | Leitura QR/código barras |
| useBalanca | `useBalanca.ts` | ✅ | Integração balança serial |
| useTriagemTimer | `useTriagemTimer.ts` | ✅ | Timer de triagem |
| useTriagemFotos | `useTriagemFotos.ts` | ✅ | Upload fotos triagem |
| useTouchGestures | `useTouchGestures.ts` | ✅ | Gestos mobile |
| useNotificacoes | `useNotificacoes.ts` | ✅ | Sistema notificações |
| usePushNotifications | `usePushNotifications.ts` | - | Push notifications |
| useAuditLog | `useAuditLog.ts` | ✅ | Log de auditoria |
| useBulkActions | `useBulkActions.ts` | ✅ | Ações em lote |

### 🎛️ Hooks de Estado/UI

| Hook | Arquivo | Função |
|------|---------|--------|
| useDebounce | `useDebounce.ts` | Debounce de valores |
| useThrottle | `useThrottle.ts` | Throttle de valores |
| useLocalStorage | `useLocalStorage.ts` | Persistência local |
| useOnlineStatus | `useOnlineStatus.ts` | Status de conexão |
| useMediaQuery | `useMediaQuery.ts` | Media queries |
| useWindowSize | `useWindowSize.ts` | Tamanho da janela |
| useScrollPosition | `useScrollPosition.ts` | Posição do scroll |
| useKeyPress | `useKeyPress.ts` | Teclas pressionadas |
| useKeyboardShortcuts | `useKeyboardShortcuts.ts` | Atalhos de teclado |
| useClickOutside | `useClickOutside.ts` | Clique fora |
| useClipboard | `useClipboard.ts` | Clipboard |
| useFocus | `useFocus.ts` | Gerenciamento de foco |
| useToggle | `useToggle.ts` | Toggle booleano |
| useCounter | `useCounter.ts` | Contador |
| useList | `useList.ts` | Lista manipulável |
| useSet | `useSet.ts` | Set manipulável |
| useMap | `useMap.ts` | Map manipulável |
| usePrevious | `usePrevious.ts` | Valor anterior |
| useInterval | `useInterval.ts` | setInterval declarativo |
| useEventListener | `useEventListener.ts` | Event listeners |
| useAsync | `useAsync.ts` | Estados assíncronos |
| useQuery | `useQuery.ts` | Queries genéricas |
| useMutation | `useMutation.ts` | Mutations genéricas |
| useForm | `useForm.ts` | Formulários |
| useFilter | `useFilter.ts` | Filtros |
| useSort | `useSort.ts` | Ordenação |
| usePagination | `usePagination.ts` | Paginação |
| use-mobile | `use-mobile.tsx` | Detecção mobile |
| use-toast | `use-toast.ts` | Hook de toast |

---

## 📂 SRC/PAGES/ - PÁGINAS (27 PÁGINAS)

| Página | Arquivo | Rota | Descrição |
|--------|---------|------|-----------|
| Index | `Index.tsx` | `/` | Landing/Home |
| Auth | `Auth.tsx` | `/auth` | Login/Cadastro Supabase Auth |
| Dashboard | `Dashboard.tsx` | `/dashboard` | Dashboard principal |
| DashboardTriador | `DashboardTriador.tsx` | `/triador` | Dashboard do triador |
| DashboardTrocas | `DashboardTrocas.tsx` | `/trocas-dashboard` | Dashboard trocas |
| Estoque | `Estoque.tsx` | `/estoque` | Gestão de posições |
| Armazenamento | `Armazenamento.tsx` | `/armazenamento` | Mapa de armazenamento |
| Movimentacao | `Movimentacao.tsx` | `/movimentacao` | Movimentações |
| Recebimento | `Recebimento.tsx` | `/recebimento` | Lista de recebimentos |
| ConferenciaRecebimento | `ConferenciaRecebimento.tsx` | `/conferencia/:id` | Conferência de lote |
| Triagem | `Triagem.tsx` | `/triagem` | Lista de triagens |
| FormularioTriagem | `FormularioTriagem.tsx` | `/triagem/:id` | Formulário de triagem |
| TrocasDevolucoes | `TrocasDevolucoes.tsx` | `/trocas` | Gestão de trocas |
| Romaneios | `Romaneios.tsx` | `/romaneios` | Gestão de romaneios |
| Scanner | `Scanner.tsx` | `/scanner` | Scanner QR/OCR |
| Rastreabilidade | `Rastreabilidade.tsx` | `/rastreabilidade` | Rastreamento |
| InventarioCiclico | `InventarioCiclico.tsx` | `/inventario` | Inventário cíclico |
| GestaoTarefas | `GestaoTarefas.tsx` | `/tarefas` | Gestão de tarefas |
| KPIsOperacionais | `KPIsOperacionais.tsx` | `/kpis` | KPIs operacionais |
| Produtividade | `Produtividade.tsx` | `/produtividade` | Produtividade |
| CurvaABC | `CurvaABC.tsx` | `/curva-abc` | Análise curva ABC |
| AlertasInteligentes | `AlertasInteligentes.tsx` | `/alertas` | Alertas inteligentes |
| Relatorios | `Relatorios.tsx` | `/relatorios` | Relatórios |
| RelatorioDivergencias | `RelatorioDivergencias.tsx` | `/divergencias` | Relatório divergências |
| RelatorioFornecedores | `RelatorioFornecedores.tsx` | `/fornecedores` | Relatório fornecedores |
| Configuracoes | `Configuracoes.tsx` | `/configuracoes` | Configurações |
| NotFound | `NotFound.tsx` | `*` | Página 404 |

---

## 📂 SRC/SERVICES/ - SERVIÇOS (8 SERVIÇOS + 4 TESTES)

| Serviço | Arquivo | Teste | Função |
|---------|---------|-------|--------|
| AuditService | `auditService.ts` | - | Log de auditoria |
| GamificacaoService | `gamificacaoService.ts` | ✅ | Operações de gamificação |
| MovimentacaoService | `movimentacaoService.ts` | - | Movimentações de estoque |
| NotificacaoService | `notificacaoService.ts` | - | Envio de notificações |
| PosicaoService | `posicaoService.ts` | ✅ | CRUD posições |
| RecebimentoService | `recebimentoService.ts` | ✅ | CRUD recebimentos/lotes |
| RelatorioService | `relatorioService.ts` | - | Geração de relatórios |
| TriagemService | `triagemService.ts` | ✅ | CRUD triagens |

---

## 📂 SRC/TYPES/ - TIPOS TYPESCRIPT (20 ARQUIVOS)

| Arquivo | Tipos Definidos |
|---------|-----------------|
| `armazenamento.ts` | Tipos de armazenamento |
| `dashboard.ts` | DashboardData, KPIData |
| `estoque.ts` | Posicao, Produto, Lote |
| `fornecedor.ts` | Fornecedor, Avaliacao |
| `gamificacao.ts` | Conquista, Desafio, Streak, XP |
| `global.d.ts` | ImportMetaEnv, Window |
| `index.ts` | Re-exports |
| `inventario.ts` | Ciclo, Contagem |
| `kpis.ts` | MetricaOperacional, Meta |
| `movimentacao.ts` | Movimentacao, TipoMovimentacao |
| `posicao.ts` | PosicaoEstoque, StatusPosicao |
| `produtividade.ts` | MetricaProdutividade |
| `recebimento.ts` | Recebimento, Conferencia |
| `relatorios.ts` | TiposRelatorio |
| `tarefas.ts` | Tarefa, Onda, Prioridade |
| `test-modules.d.ts` | Módulos de teste |
| `triagem.ts` | Triagem, ResultadoTriagem |
| `trocas.ts` | TrocaDevolucao, Motivo |
| `usuario.ts` | Usuario, Role |
| `web-serial.d.ts` | Web Serial API types |

---

## 📂 SRC/CONTEXTS/ - CONTEXTS REACT (6 ARQUIVOS)

| Context | Arquivo | Função |
|---------|---------|--------|
| AppContext | `AppContext.tsx` | Estado global da aplicação |
| AuthContext | `AuthContext.tsx` | Autenticação Supabase |
| NotificationContext | `NotificationContext.tsx` | Sistema de notificações |
| ThemeContext | `ThemeContext.tsx` | Tema dark/light |
| ToastContext | `ToastContext.tsx` | Sistema de toasts |
| index.ts | `index.ts` | Re-exports |

---

## 📂 SRC/LIB/ - BIBLIOTECAS UTILITÁRIAS (20 ARQUIVOS)

| Arquivo | Teste | Função |
|---------|-------|--------|
| `analytics.ts` | - | Analytics tracking |
| `api.ts` | - | Wrapper de API |
| `cache.ts` | ✅ | Cache em memória |
| `env.ts` | - | Variáveis de ambiente |
| `export.ts` | - | Exportação de dados |
| `featureFlags.ts` | - | Feature flags |
| `index.ts` | - | Re-exports |
| `logger.ts` | - | Sistema de logging |
| `offlineQueue.ts` | - | Fila offline |
| `performance.ts` | - | Métricas de performance |
| `rateLimiter.ts` | ✅ | Rate limiting |
| `retry.ts` | ✅ | Retry com backoff exponencial |
| `sentry.ts` | - | Error tracking (stub) |
| `storage.ts` | - | Storage abstraction |
| `utils.ts` | - | Utilitários (cn, etc) |
| `validation.ts` | ✅ | Validações |

---

## 📂 SRC/UTILS/ - FUNÇÕES UTILITÁRIAS (10 ARQUIVOS)

| Arquivo | Teste | Funções |
|---------|-------|---------|
| `accessibility.ts` | - | Utilitários a11y |
| `date.ts` | ✅ | Formatação de datas |
| `exportExcel.ts` | - | Exportação Excel (xlsx) |
| `formatters.ts` | - | Formatadores (moeda, etc) |
| `index.ts` | - | Re-exports |
| `number.ts` | ✅ | Formatação de números |
| `parseNFXML.ts` | - | Parser XML de NF-e |
| `validators.ts` | - | Validações de dados |

---

## 📂 SRC/CONFIG/ - CONFIGURAÇÕES (3 ARQUIVOS)

| Arquivo | Conteúdo |
|---------|----------|
| `index.ts` | Configurações gerais, constantes |
| `menu.ts` | Estrutura do menu de navegação |
| `routes.ts` | Definição de rotas da aplicação |

---

## 📂 SRC/CONSTANTS/ - CONSTANTES (1 ARQUIVO)

| Arquivo | Conteúdo |
|---------|----------|
| `index.ts` | Constantes globais da aplicação |

---

## 📂 SRC/INTEGRATIONS/ - INTEGRAÇÕES (2 ARQUIVOS)

| Arquivo | Descrição |
|---------|-----------|
| `supabase/client.ts` | Cliente Supabase (auto-gerado) |
| `supabase/types.ts` | Tipos do banco (auto-gerado) |

---

## 📂 SUPABASE/ - BACKEND

### 📂 EDGE FUNCTIONS (`supabase/functions/`) - 7 FUNÇÕES

| Função | Arquivo | Descrição |
|--------|---------|-----------|
| alerta-divergencia-fornecedor | `index.ts` | Alertas de divergência para fornecedores |
| calculate-kpis | `index.ts` | Cálculo automático de KPIs |
| generate-report | `index.ts` | Geração de relatórios PDF |
| gerar-desafios-diarios | `index.ts` | Geração automática de desafios |
| notify-slack | `index.ts` | Notificações Slack |
| previsao-demanda | `index.ts` | Previsão de demanda com IA |
| scanner-ocr | `index.ts` | OCR de documentos |

### 📄 Outros Arquivos Supabase

| Arquivo | Descrição |
|---------|-----------|
| `config.toml` | Configuração do projeto Supabase |
| `seed.sql` | Dados iniciais para desenvolvimento |

---

## 📊 BANCO DE DADOS - 33 TABELAS

### 📦 Estoque & Produtos (5 tabelas)

| Tabela | Campos Principais | RLS |
|--------|-------------------|-----|
| `produtos` | id, sku, nome, descricao, curva_abc, estoque_minimo | ✅ |
| `lotes` | id, numero_lote, produto_id, quantidade_atual, status, data_validade | ✅ |
| `posicoes_estoque` | id, codigo, tipo, status, zona, porta_palete, nivel | ✅ |
| `estoque_posicao` | id, posicao_id, produto_id, lote_id, quantidade | ✅ |
| `regras_ponto_pedido` | id, produto_id, ponto_pedido, estoque_minimo | ✅ |

### 📥 Operações (6 tabelas)

| Tabela | Campos Principais | RLS |
|--------|-------------------|-----|
| `eventos_triagem` | id, lote_id, operador_id, resultado, data_inicio, data_fim | ✅ |
| `eventos_picking` | id, tarefa_id, operador_id, quantidade_separada | ✅ |
| `tarefas` | id, tipo, status, operador_id, quantidade, prioridade | ✅ |
| `ondas_separacao` | id, codigo, status, total_tarefas | ✅ |
| `rastreamento_historico` | id, tipo_evento, produto_id, lote_id, data_evento | ✅ |
| `trocas_devolucoes` | id, tipo, motivo, status, cliente, produto | ✅ |

### 📦 Expedição (3 tabelas)

| Tabela | Campos Principais | RLS |
|--------|-------------------|-----|
| `romaneios` | id, codigo, status, motorista, data_saida | ✅ |
| `romaneio_itens` | id, romaneio_id, cliente, endereco_entrega | ✅ |
| `comprovantes_entrega` | id, romaneio_id, status, assinatura_url | ✅ |

### 🎮 Gamificação (8 tabelas)

| Tabela | Campos Principais | RLS |
|--------|-------------------|-----|
| `gamificacao_usuarios` | id, user_id, xp_total, nivel | ✅ |
| `xp_historico` | id, user_id, quantidade, tipo, descricao | ✅ |
| `conquistas_definicoes` | id, codigo, nome, criterio, meta, pontos | ✅ |
| `conquistas_usuarios` | id, user_id, conquista_id, progresso, desbloqueada | ✅ |
| `desafios_diarios` | id, titulo, tipo, meta, xp_recompensa, data_ativo | ✅ |
| `desafios_usuarios` | id, user_id, desafio_id, progresso, concluido | ✅ |
| `streaks_usuarios` | id, user_id, streak_atual, streak_recorde | ✅ |
| `streaks_historico` | id, user_id, data, xp_ganho | ✅ |

### 📊 KPIs & Alertas (4 tabelas)

| Tabela | Campos Principais | RLS |
|--------|-------------------|-----|
| `metricas_operacionais` | id, data, taxa_ocupacao, acuracidade_picking | ✅ |
| `metas_kpi` | id, metrica, valor_meta, tipo | ✅ |
| `alertas_config` | id, tipo, severidade, threshold_valor | ✅ |
| `alertas_historico` | id, tipo, titulo, status, severidade | ✅ |

### 📋 Inventário (3 tabelas)

| Tabela | Campos Principais | RLS |
|--------|-------------------|-----|
| `inventario_ciclos` | id, nome, status, data_agendada, acuracidade | ✅ |
| `inventario_contagens` | id, ciclo_id, posicao_id, quantidade_contada | ✅ |
| `inventario_config` | id, meta_acuracidade, threshold_divergencia | ✅ |

### 👤 Usuários (4 tabelas)

| Tabela | Campos Principais | RLS |
|--------|-------------------|-----|
| `profiles` | id, nome, email | ✅ |
| `user_roles` | id, user_id, role (admin/supervisor/operador) | ✅ |
| `produtividade_operador` | id, operador_id, tarefas_concluidas, taxa_acerto | ✅ |
| `notificacoes` | id, user_id, titulo, mensagem, lida | ✅ |

---

## 🔧 FUNÇÕES DO BANCO DE DADOS (11 FUNÇÕES)

| Função | Trigger | Descrição |
|--------|---------|-----------|
| `adicionar_xp` | - | Adiciona XP e verifica level up |
| `registrar_checkin_diario` | - | Check-in diário para streaks |
| `trigger_xp_triagem_completa` | ✅ | XP automático após triagem |
| `trigger_xp_tarefa_completa` | ✅ | XP automático após tarefa |
| `trigger_atualizar_conquistas` | ✅ | Atualiza progresso conquistas |
| `trigger_atualizar_desafios` | ✅ | Atualiza progresso desafios |
| `trigger_notificacao_recebimento` | ✅ | Notificações de recebimento |
| `has_role` | - | Verifica role do usuário |
| `get_user_role` | - | Obtém role do usuário |
| `handle_new_user` | ✅ | Cria profile para novo usuário |
| `update_updated_at_column` | ✅ | Atualiza timestamp updated_at |

---

## 🧪 TESTES

### E2E (Playwright) - 14 SPECS

```
e2e/
├── accessibility.spec.ts     # Testes de acessibilidade
├── auth.spec.ts              # Testes de autenticação
├── configuracoes.spec.ts     # Testes de configurações
├── dashboard.spec.ts         # Testes do dashboard
├── estoque.spec.ts           # Testes de estoque
├── gamificacao.spec.ts       # Testes de gamificação
├── mobile.spec.ts            # Testes mobile
├── movimentacao.spec.ts      # Testes de movimentação
├── navigation.spec.ts        # Testes de navegação
├── performance.spec.ts       # Testes de performance
├── pwa.spec.ts               # Testes PWA
├── recebimento.spec.ts       # Testes de recebimento
├── relatorios.spec.ts        # Testes de relatórios
└── triagem.spec.ts           # Testes de triagem
```

### Unitários (Vitest) - 31 ARQUIVOS

**Hooks (24 testes):**
- useAtividadeRecente.test.ts
- useAuditLog.test.ts
- useBalanca.test.ts
- useBulkActions.test.ts
- useConquistas.test.tsx
- useCurvaABC.test.ts
- useDashboard.test.ts
- useDesafiosDiarios.test.tsx
- useDivergencias.test.tsx
- useEstoque.test.ts
- useFornecedores.test.ts
- useGamificacao.test.ts
- useInventarioCiclico.test.ts
- useKPIAlerts.test.ts
- useKPIsOperacionais.test.ts
- useMovimentacoes.test.ts
- useNotificacoes.test.ts
- useProdutividade.test.ts
- useRanking.test.ts
- useRealtimeKPIs.test.ts
- useRecebimentos.test.ts
- useRomaneios.test.tsx
- useScanner.test.ts
- useStreaks.test.ts
- useTarefas.test.ts
- useTouchGestures.test.ts
- useTriagemFotos.test.ts
- useTriagemTimer.test.ts
- useTriagens.test.ts
- useTrocasDevolucoes.test.tsx

**Lib (4 testes):**
- cache.test.ts
- rateLimiter.test.ts
- retry.test.ts
- validation.test.ts

**Utils (2 testes):**
- date.test.ts
- number.test.ts

**Services (4 testes):**
- gamificacaoService.test.ts
- posicaoService.test.ts
- recebimentoService.test.ts
- triagemService.test.ts

**Extras (7 testes):**
- src/tests/component-204..210.test.ts
- src/tests/final-test-225.test.ts
- src/tests/final-test-226.test.ts
- src/tests/final-test-227.test.ts
- src/tests/final-test-228.test.ts
- src/tests/final-test-229.test.ts
- src/tests/final-test-230.test.ts

---

## 📚 DOCUMENTAÇÃO (24 ARQUIVOS)

```
docs/
├── ACCESSIBILITY.md          # Guia de acessibilidade
├── ADMIN_GUIDE.md            # Guia do administrador
├── API.md                    # Documentação da API
├── API_ENDPOINTS.md          # Endpoints da API
├── API_SUPABASE.md           # API Supabase/Edge Functions
├── ARCHITECTURE.md           # Arquitetura do sistema
├── CHANGELOG.md              # Histórico de mudanças
├── CODING_STANDARDS.md       # Padrões de código
├── COMPONENTS.md             # Documentação de componentes
├── DATABASE.md               # Documentação do banco
├── DATABASE_SCHEMA.md        # Schema do banco
├── DEPLOYMENT.md             # Guia de deploy
├── DEVELOPMENT.md            # Guia de desenvolvimento
├── GAMIFICATION.md           # Sistema de gamificação
├── HOOKS.md                  # Documentação de hooks
├── INTEGRATIONS.md           # Integrações
├── INVENTARIO_PROJETO.md     # Este arquivo
├── MOBILE.md                 # Documentação mobile
├── PAGES.md                  # Documentação de páginas
├── PERFORMANCE.md            # Otimização de performance
├── SECURITY.md               # Segurança
├── TESTING.md                # Guia de testes
├── TROUBLESHOOTING.md        # Resolução de problemas
└── USER_GUIDE.md             # Guia do usuário
```

---

## ⚙️ CONFIGURAÇÃO & CI/CD

### GitHub Workflows (5 workflows)

| Workflow | Arquivo | Função |
|----------|---------|--------|
| CI | `ci.yml` | Lint, typecheck, build, test |
| Deploy | `deploy.yml` | Deploy automático |
| E2E | `e2e.yml` | Testes E2E Playwright |
| Lighthouse | `lighthouse.yml` | Auditoria de performance |
| Security | `security.yml` | Scan de segurança |

### Scripts (`scripts/`) - 4 ARQUIVOS

| Script | Função |
|--------|--------|
| `backup.sh` | Backup do banco de dados |
| `generate-types.ts` | Geração de tipos Supabase |
| `seed-data.ts` | Seed de dados de produção |
| `seed-dev.ts` | Seed de dados de desenvolvimento |

### Public (`public/`) - 6 ARQUIVOS

| Arquivo | Função |
|---------|--------|
| `favicon.ico` | Ícone do site |
| `manifest.json` | Manifesto PWA |
| `offline.html` | Página offline |
| `placeholder.svg` | Imagem placeholder |
| `robots.txt` | Configuração SEO |
| `sw.js` | Service Worker PWA |

### Tests (`tests/`) - 3 ARQUIVOS

| Pasta/Arquivo | Função |
|---------------|--------|
| `mocks/supabase.ts` | Mock do cliente Supabase |
| `utils/render.tsx` | Utilitários de renderização |
| `setup.ts` | Setup global de testes |

---

## 📈 ESTATÍSTICAS FINAIS DO PROJETO

| Métrica | Valor |
|---------|-------|
| **Total de Arquivos** | ~400+ |
| **Total de Pastas** | ~80+ |
| **Componentes React** | 160+ |
| **Componentes UI (shadcn)** | 71 |
| **Hooks Customizados** | 48 |
| **Páginas** | 27 |
| **Services** | 8 |
| **Edge Functions** | 7 |
| **Tabelas DB** | 33 |
| **Funções DB** | 11 |
| **Arquivos de Docs** | 24 |
| **Testes E2E** | 14 specs |
| **Testes Unitários** | 31 arquivos |
| **GitHub Workflows** | 5 |

---

## 🔒 SEGURANÇA (RLS)

Todas as 33 tabelas possuem **Row Level Security** habilitado:
- ✅ Leitura pública para dados não sensíveis
- ✅ CRUD restrito por `auth.uid()` para dados do usuário
- ✅ Acesso administrativo via função `has_role()`
- ✅ Proteção contra DELETE em tabelas críticas
- ✅ Políticas específicas por operação (SELECT, INSERT, UPDATE, DELETE)

---

## 📝 NOTAS IMPORTANTES

### 1. Arquivos Auto-Gerados (NÃO EDITAR)
- `src/integrations/supabase/client.ts`
- `src/integrations/supabase/types.ts`
- `.env`
- `supabase/config.toml`

### 2. Arquivos com `// @ts-nocheck`
Arquivos que precisam revisão futura para correção de tipos:
- Vários arquivos `.test.ts`
- Alguns services que usam tabelas legacy
- Algumas páginas com APIs desatualizadas

### 3. Sincronização Necessária
- Alguns hooks/services podem referenciar tabelas antigas
- Tipos precisam ser atualizados após novas migrações

### 4. Colaboração Lovable + Claude
Este projeto foi construído em parceria entre:
- **Lovable AI** - IDE e ambiente de desenvolvimento
- **Claude (Anthropic)** - Assistente de código e análise

Alguns arquivos podem ter sido criados diretamente via Claude/GitHub, não pelo Lovable.

---

*Documento gerado automaticamente pelo Lovable em parceria com Claude (Anthropic) - 2025-12-22*
