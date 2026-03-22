import { Suspense, lazy } from "react";
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { LoadingFallback } from "@/components/common/LoadingFallback";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import AppLayout from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import { UpdatePrompt } from "./components/pwa/UpdatePrompt";

// ── Core pages (prefetched — loaded first) ──
const Dashboard = lazy(() => import(/* webpackChunkName: "dashboard", webpackPrefetch: true */ "./pages/Dashboard"));
const DashboardOperacional = lazy(() => import(/* webpackChunkName: "dashboard" */ "./pages/DashboardOperacional"));
const Index = lazy(() => import(/* webpackChunkName: "index", webpackPrefetch: true */ "./pages/Index"));
const Auth = lazy(() => import(/* webpackChunkName: "auth", webpackPrefetch: true */ "./pages/Auth"));

// ── WMS Operations ──
const Estoque = lazy(() => import(/* webpackChunkName: "wms-ops", webpackPrefetch: true */ "./pages/Estoque"));
const Triagem = lazy(() => import(/* webpackChunkName: "wms-ops", webpackPrefetch: true */ "./pages/Triagem"));
const Recebimento = lazy(() => import(/* webpackChunkName: "wms-ops", webpackPrefetch: true */ "./pages/Recebimento"));
const Movimentacao = lazy(() => import(/* webpackChunkName: "wms-ops" */ "./pages/Movimentacao"));
const Armazenamento = lazy(() => import(/* webpackChunkName: "wms-ops" */ "./pages/Armazenamento"));
const ConferenciaRecebimento = lazy(() => import(/* webpackChunkName: "wms-ops" */ "./pages/ConferenciaRecebimento"));
const Scanner = lazy(() => import(/* webpackChunkName: "scanner" */ "./pages/Scanner"));

// ── Products & Inventory ──
const Produtos = lazy(() => import(/* webpackChunkName: "inventory" */ "./pages/Produtos"));
const Lotes = lazy(() => import(/* webpackChunkName: "inventory" */ "./pages/Lotes"));
const Posicoes = lazy(() => import(/* webpackChunkName: "inventory" */ "./pages/Posicoes"));
const InventarioCiclico = lazy(() => import(/* webpackChunkName: "inventory" */ "./pages/InventarioCiclico"));
const CurvaABC = lazy(() => import(/* webpackChunkName: "inventory" */ "./pages/CurvaABC"));
const OcupacaoVisual = lazy(() => import(/* webpackChunkName: "inventory" */ "./pages/OcupacaoVisual"));

// ── Picking & Waves ──
const PickingPage = lazy(() => import(/* webpackChunkName: "picking" */ "./pages/picking/PickingPage"));
const PutawayPage = lazy(() => import(/* webpackChunkName: "picking" */ "./pages/putaway/PutawayPage"));
const Ondas = lazy(() => import(/* webpackChunkName: "picking" */ "./pages/Ondas"));
const GestaoTarefas = lazy(() => import(/* webpackChunkName: "picking" */ "./pages/GestaoTarefas"));

// ── Shipping & Delivery ──
const Romaneios = lazy(() => import(/* webpackChunkName: "shipping" */ "./pages/Romaneios"));
const ShippingPage = lazy(() => import(/* webpackChunkName: "shipping" */ "./pages/shipping/ShippingPage"));
const KanbanPipeline = lazy(() => import(/* webpackChunkName: "shipping" */ "./pages/KanbanPipeline"));

// ── Triagem Detail ──
const DashboardTriador = lazy(() => import(/* webpackChunkName: "triagem-detail" */ "./pages/DashboardTriador"));
const FormularioTriagem = lazy(() => import(/* webpackChunkName: "triagem-detail" */ "./pages/FormularioTriagem"));
const QualityPage = lazy(() => import(/* webpackChunkName: "triagem-detail" */ "./pages/quality/QualityPage"));

// ── Analytics & Reports ──
const Relatorios = lazy(() => import(/* webpackChunkName: "analytics" */ "./pages/Relatorios"));
const KPIsOperacionais = lazy(() => import(/* webpackChunkName: "analytics" */ "./pages/KPIsOperacionais"));
const Produtividade = lazy(() => import(/* webpackChunkName: "analytics" */ "./pages/Produtividade"));
const Rastreabilidade = lazy(() => import(/* webpackChunkName: "analytics" */ "./pages/Rastreabilidade"));
const RelatorioDivergencias = lazy(() => import(/* webpackChunkName: "analytics" */ "./pages/RelatorioDivergencias"));
const RelatorioFornecedores = lazy(() => import(/* webpackChunkName: "analytics" */ "./pages/RelatorioFornecedores"));
const AlertasInteligentes = lazy(() => import(/* webpackChunkName: "analytics" */ "./pages/AlertasInteligentes"));

// ── Returns ──
const TrocasDevolucoes = lazy(() => import(/* webpackChunkName: "returns" */ "./pages/TrocasDevolucoes"));
const DashboardTrocas = lazy(() => import(/* webpackChunkName: "returns" */ "./pages/DashboardTrocas"));

// ── Customers & Orders ──
const CustomersPage = lazy(() => import(/* webpackChunkName: "customers" */ "./pages/customers/CustomersPage"));
const CustomerDetailPage = lazy(() => import(/* webpackChunkName: "customers" */ "./pages/customers/CustomerDetailPage"));
const OrdersPage = lazy(() => import(/* webpackChunkName: "orders" */ "./pages/orders/OrdersPage"));
const OrderDetailPage = lazy(() => import(/* webpackChunkName: "orders" */ "./pages/orders/OrderDetailPage"));
const SerialsPage = lazy(() => import(/* webpackChunkName: "serials" */ "./pages/serials/SerialsPage"));
const CategoriesPage = lazy(() => import(/* webpackChunkName: "categories" */ "./pages/categories/CategoriesPage"));
const WarehousesPage = lazy(() => import(/* webpackChunkName: "warehouses" */ "./pages/warehouses/WarehousesPage"));
const WarehouseDetailPage = lazy(() => import(/* webpackChunkName: "warehouses" */ "./pages/warehouses/WarehouseDetailPage"));

// ── Admin ──
const UsersPage = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/admin/UsersPage"));
const RolesPage = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/admin/RolesPage"));
const AdminSettingsPage = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/admin/SettingsPage"));
const AuditLogPage = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/admin/AuditLogPage"));
const IntegrationsPage = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/admin/IntegrationsPage"));
const Seguranca = lazy(() => import(/* webpackChunkName: "admin" */ "./pages/Seguranca"));
const Governanca = lazy(() => import(/* webpackChunkName: "governance" */ "./pages/Governanca"));

// ── User & Misc ──
const Configuracoes = lazy(() => import(/* webpackChunkName: "user" */ "./pages/Configuracoes"));
const ProfilePage = lazy(() => import(/* webpackChunkName: "user" */ "./pages/profile/ProfilePage"));
const HelpPage = lazy(() => import(/* webpackChunkName: "user" */ "./pages/help/HelpPage"));
const NotificationsPage = lazy(() => import(/* webpackChunkName: "user" */ "./pages/notifications/NotificationsPage"));
const Gamificacao = lazy(() => import(/* webpackChunkName: "user" */ "./pages/Gamificacao"));
const TwoFactorAuth = lazy(() => import(/* webpackChunkName: "auth" */ "./pages/TwoFactorAuth"));
const NotFound = lazy(() => import(/* webpackChunkName: "user" */ "./pages/NotFound"));
const Unauthorized = lazy(() => import(/* webpackChunkName: "user" */ "./pages/Unauthorized"));

// ── New Features ──
const AssistenteIA = lazy(() => import(/* webpackChunkName: "ai" */ "./pages/AssistenteIA"));
const ImportExport = lazy(() => import(/* webpackChunkName: "import-export" */ "./pages/ImportExport"));
const Automacoes = lazy(() => import(/* webpackChunkName: "automacoes" */ "./pages/Automacoes"));
const DashboardTempoReal = lazy(() => import(/* webpackChunkName: "realtime" */ "./pages/DashboardTempoReal"));
const RelatoriosAgendados = lazy(() => import(/* webpackChunkName: "reports" */ "./pages/RelatoriosAgendados"));
const AprovacaoMovimentacoes = lazy(() => import(/* webpackChunkName: "approvals" */ "./pages/AprovacaoMovimentacoes"));
const FornecedoresAvancado = lazy(() => import(/* webpackChunkName: "suppliers" */ "./pages/FornecedoresAvancado"));
const ModoOffline = lazy(() => import(/* webpackChunkName: "offline" */ "./pages/ModoOffline"));
const EndereçamentoAutomatico = lazy(() => import(/* webpackChunkName: "addressing" */ "./pages/EndereçamentoAutomatico"));
const IntegracaoTransportadoras = lazy(() => import(/* webpackChunkName: "carriers" */ "./pages/IntegracaoTransportadoras"));
const PrevisaoDemandaIA = lazy(() => import(/* webpackChunkName: "demand" */ "./pages/PrevisaoDemandaIA"));
const Etiquetas = lazy(() => import(/* webpackChunkName: "etiquetas" */ "./pages/Etiquetas"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,      // 5 min — avoid refetching fresh data
      gcTime: 10 * 60 * 1000,         // 10 min — keep cache in memory longer
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      networkMode: 'offlineFirst',     // use cache when offline
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
    },
  },
});

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <NotificationProvider>
              <Toaster />
              <Sonner />
              <InstallPrompt />
              <UpdatePrompt />
              <BrowserRouter>
                <Routes>
                  {/* Public routes - minimal fallback */}
                  <Route path="/auth" element={<Suspense fallback={<LoadingFallback />}><Auth /></Suspense>} />
                  <Route path="/2fa" element={<Suspense fallback={<LoadingFallback />}><TwoFactorAuth /></Suspense>} />
                  <Route path="/unauthorized" element={<Suspense fallback={<LoadingFallback />}><Unauthorized /></Suspense>} />

                  {/* Protected routes with contextual skeletons */}
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><Index /></Suspense>} />
                    <Route path="dashboard" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><Dashboard /></Suspense>} />
                    <Route path="monitor" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><DashboardOperacional /></Suspense>} />

                    {/* WMS Operations - table skeletons */}
                    <Route path="estoque" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><Estoque /></Suspense>} />
                    <Route path="triagem" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><Triagem /></Suspense>} />
                    <Route path="recebimento" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><Recebimento /></Suspense>} />
                    <Route path="movimentacao" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><Movimentacao /></Suspense>} />
                    <Route path="armazenamento" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><Armazenamento /></Suspense>} />
                    <Route path="conferencia" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><ConferenciaRecebimento /></Suspense>} />
                    <Route path="scanner" element={<Suspense fallback={<LoadingFallback />}><Scanner /></Suspense>} />

                    {/* Products & Inventory */}
                    <Route path="produtos" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><Produtos /></Suspense>} />
                    <Route path="lotes" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><Lotes /></Suspense>} />
                    <Route path="posicoes" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Posicoes /></ProtectedRoute></Suspense>} />
                    <Route path="inventario" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><InventarioCiclico /></ProtectedRoute></Suspense>} />
                    <Route path="curva-abc" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><CurvaABC /></ProtectedRoute></Suspense>} />
                    <Route path="ocupacao" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><OcupacaoVisual /></Suspense>} />

                    {/* Picking & Waves */}
                    <Route path="picking" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><PickingPage /></Suspense>} />
                    <Route path="putaway" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><PutawayPage /></Suspense>} />
                    <Route path="ondas" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Ondas /></ProtectedRoute></Suspense>} />
                    <Route path="tarefas" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><GestaoTarefas /></Suspense>} />

                    {/* Shipping */}
                    <Route path="romaneios" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><Romaneios /></Suspense>} />
                    <Route path="expedicao" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ShippingPage /></Suspense>} />
                    <Route path="kanban" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><KanbanPipeline /></Suspense>} />

                    {/* Triagem Detail */}
                    <Route path="triador" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><DashboardTriador /></Suspense>} />
                    <Route path="formulario-triagem" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><FormularioTriagem /></Suspense>} />
                    <Route path="qualidade" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><QualityPage /></Suspense>} />

                    {/* Analytics & Reports */}
                    <Route path="relatorios" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Relatorios /></ProtectedRoute></Suspense>} />
                    <Route path="kpis-operacionais" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><KPIsOperacionais /></ProtectedRoute></Suspense>} />
                    <Route path="produtividade" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Produtividade /></ProtectedRoute></Suspense>} />
                    <Route path="alertas" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><AlertasInteligentes /></ProtectedRoute></Suspense>} />
                    <Route path="rastreabilidade" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Rastreabilidade /></ProtectedRoute></Suspense>} />
                    <Route path="divergencias" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><RelatorioDivergencias /></ProtectedRoute></Suspense>} />
                    <Route path="fornecedores" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><RelatorioFornecedores /></ProtectedRoute></Suspense>} />

                    {/* Returns */}
                    <Route path="trocas" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><TrocasDevolucoes /></ProtectedRoute></Suspense>} />
                    <Route path="trocas-dashboard" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><DashboardTrocas /></ProtectedRoute></Suspense>} />

                    {/* Customers & Orders */}
                    <Route path="categorias" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><CategoriesPage /></Suspense>} />
                    <Route path="clientes" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><CustomersPage /></Suspense>} />
                    <Route path="clientes/:id" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><CustomerDetailPage /></Suspense>} />
                    <Route path="pedidos" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><OrdersPage /></Suspense>} />
                    <Route path="pedidos/:id" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><OrderDetailPage /></Suspense>} />
                    <Route path="seriais" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><SerialsPage /></Suspense>} />
                    <Route path="armazens" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><WarehousesPage /></Suspense>} />
                    <Route path="armazens/:id" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><WarehouseDetailPage /></Suspense>} />

                    {/* Admin */}
                    <Route path="admin/usuarios" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute></Suspense>} />
                    <Route path="admin/roles" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin"]}><RolesPage /></ProtectedRoute></Suspense>} />
                    <Route path="admin/configuracoes" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><ProtectedRoute allowedRoles={["admin"]}><AdminSettingsPage /></ProtectedRoute></Suspense>} />
                    <Route path="admin/auditoria" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin"]}><AuditLogPage /></ProtectedRoute></Suspense>} />
                    <Route path="admin/integracoes" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin"]}><IntegrationsPage /></ProtectedRoute></Suspense>} />
                    <Route path="seguranca" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><ProtectedRoute allowedRoles={["admin"]}><Seguranca /></ProtectedRoute></Suspense>} />
                    <Route path="governanca" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Governanca /></ProtectedRoute></Suspense>} />

                    {/* User */}
                    <Route path="configuracoes" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><Configuracoes /></Suspense>} />
                    <Route path="perfil" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><ProfilePage /></Suspense>} />
                    <Route path="ajuda" element={<Suspense fallback={<LoadingFallback />}><HelpPage /></Suspense>} />
                    <Route path="notificacoes" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><NotificationsPage /></Suspense>} />
                    <Route path="gamificacao" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><Gamificacao /></Suspense>} />
                    <Route path="assistente-ia" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><AssistenteIA /></Suspense>} />
                    <Route path="import-export" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ImportExport /></Suspense>} />
                    <Route path="automacoes" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Automacoes /></ProtectedRoute></Suspense>} />
                    <Route path="dashboard-realtime" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><DashboardTempoReal /></Suspense>} />
                    <Route path="relatorios-agendados" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><RelatoriosAgendados /></ProtectedRoute></Suspense>} />
                    <Route path="aprovacoes" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><AprovacaoMovimentacoes /></ProtectedRoute></Suspense>} />
                    <Route path="fornecedores-avancado" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><FornecedoresAvancado /></ProtectedRoute></Suspense>} />
                    <Route path="modo-offline" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ModoOffline /></Suspense>} />
                    <Route path="enderecamento" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><EndereçamentoAutomatico /></Suspense>} />
                    <Route path="transportadoras" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><IntegracaoTransportadoras /></Suspense>} />
                    <Route path="previsao-demanda" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><PrevisaoDemandaIA /></ProtectedRoute></Suspense>} />
                    <Route path="etiquetas" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><Etiquetas /></Suspense>} />

                    <Route path="*" element={<Suspense fallback={<LoadingFallback />}><NotFound /></Suspense>} />
                  </Route>
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
