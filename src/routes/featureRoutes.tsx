import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { LoadingFallback } from "@/components/common/LoadingFallback";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
    <Route path="categorias" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><CategoriesPage /></Suspense>} />
    <Route path="clientes" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><CustomersPage /></Suspense>} />
    <Route path="clientes/:id" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><CustomerDetailPage /></Suspense>} />
    <Route path="pedidos" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><OrdersPage /></Suspense>} />
    <Route path="pedidos/:id" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><OrderDetailPage /></Suspense>} />
    <Route path="seriais" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><SerialsPage /></Suspense>} />
    <Route path="armazens" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><WarehousesPage /></Suspense>} />
    <Route path="armazens/:id" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><WarehouseDetailPage /></Suspense>} />

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
  </>
);
