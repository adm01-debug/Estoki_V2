import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { LoadingFallback } from "@/components/common/LoadingFallback";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteErrorBoundary } from "@/components/common/RouteErrorBoundary";

// Customers & Orders
const CustomersPage = lazy(() => import("@/pages/customers/CustomersPage"));
const CustomerDetailPage = lazy(() => import("@/pages/customers/CustomerDetailPage"));
const OrdersPage = lazy(() => import("@/pages/orders/OrdersPage"));
const OrderDetailPage = lazy(() => import("@/pages/orders/OrderDetailPage"));
const SerialsPage = lazy(() => import("@/pages/serials/SerialsPage"));
const CategoriesPage = lazy(() => import("@/pages/categories/CategoriesPage"));
const WarehousesPage = lazy(() => import("@/pages/warehouses/WarehousesPage"));
const WarehouseDetailPage = lazy(() => import("@/pages/warehouses/WarehouseDetailPage"));

// User & Misc
const Configuracoes = lazy(() => import("@/pages/Configuracoes"));
const ProfilePage = lazy(() => import("@/pages/profile/ProfilePage"));
const HelpPage = lazy(() => import("@/pages/help/HelpPage"));
const NotificationsPage = lazy(() => import("@/pages/notifications/NotificationsPage"));
const Gamificacao = lazy(() => import("@/pages/Gamificacao"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// New Features
const AssistenteIA = lazy(() => import("@/pages/AssistenteIA"));
const ImportExport = lazy(() => import("@/pages/ImportExport"));
const Automacoes = lazy(() => import("@/pages/Automacoes"));
const DashboardTempoReal = lazy(() => import("@/pages/DashboardTempoReal"));
const RelatoriosAgendados = lazy(() => import("@/pages/RelatoriosAgendados"));
const AprovacaoMovimentacoes = lazy(() => import("@/pages/AprovacaoMovimentacoes"));
const FornecedoresAvancado = lazy(() => import("@/pages/FornecedoresAvancado"));
const ModoOffline = lazy(() => import("@/pages/ModoOffline"));
const EndereçamentoAutomatico = lazy(() => import("@/pages/EndereçamentoAutomatico"));
const IntegracaoTransportadoras = lazy(() => import("@/pages/IntegracaoTransportadoras"));
const PrevisaoDemandaIA = lazy(() => import("@/pages/PrevisaoDemandaIA"));
const Etiquetas = lazy(() => import("@/pages/Etiquetas"));

export const featureRoutes = (
  <>
    {/* Customers & Orders */}
    <Route path="categorias" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><CategoriesPage /></Suspense></RouteErrorBoundary>} />
    <Route path="clientes" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><CustomersPage /></Suspense></RouteErrorBoundary>} />
    <Route path="clientes/:id" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="form" />}><CustomerDetailPage /></Suspense></RouteErrorBoundary>} />
    <Route path="pedidos" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><OrdersPage /></Suspense></RouteErrorBoundary>} />
    <Route path="pedidos/:id" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="form" />}><OrderDetailPage /></Suspense></RouteErrorBoundary>} />
    <Route path="seriais" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><SerialsPage /></Suspense></RouteErrorBoundary>} />
    <Route path="armazens" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><WarehousesPage /></Suspense></RouteErrorBoundary>} />
    <Route path="armazens/:id" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="form" />}><WarehouseDetailPage /></Suspense></RouteErrorBoundary>} />

    {/* User */}
    <Route path="configuracoes" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="form" />}><Configuracoes /></Suspense></RouteErrorBoundary>} />
    <Route path="perfil" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="form" />}><ProfilePage /></Suspense></RouteErrorBoundary>} />
    <Route path="ajuda" element={<RouteErrorBoundary><Suspense fallback={<LoadingFallback />}><HelpPage /></Suspense></RouteErrorBoundary>} />
    <Route path="notificacoes" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><NotificationsPage /></Suspense></RouteErrorBoundary>} />
    <Route path="gamificacao" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><Gamificacao /></Suspense></RouteErrorBoundary>} />
    <Route path="assistente-ia" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><AssistenteIA /></Suspense></RouteErrorBoundary>} />
    <Route path="import-export" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ImportExport /></Suspense></RouteErrorBoundary>} />
    <Route path="automacoes" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Automacoes /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="dashboard-realtime" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><DashboardTempoReal /></Suspense></RouteErrorBoundary>} />
    <Route path="relatorios-agendados" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><RelatoriosAgendados /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="aprovacoes" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><AprovacaoMovimentacoes /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="fornecedores-avancado" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><FornecedoresAvancado /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="modo-offline" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ModoOffline /></Suspense></RouteErrorBoundary>} />
    <Route path="enderecamento" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><EndereçamentoAutomatico /></Suspense></RouteErrorBoundary>} />
    <Route path="transportadoras" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><IntegracaoTransportadoras /></Suspense></RouteErrorBoundary>} />
    <Route path="previsao-demanda" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><PrevisaoDemandaIA /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="etiquetas" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="form" />}><Etiquetas /></Suspense></RouteErrorBoundary>} />

    <Route path="*" element={<RouteErrorBoundary><Suspense fallback={<LoadingFallback />}><NotFound /></Suspense></RouteErrorBoundary>} />
  </>
);
