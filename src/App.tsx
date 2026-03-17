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
import AppLayout from "./components/layout/AppLayout";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import { UpdatePrompt } from "./components/pwa/UpdatePrompt";

// Lazy loaded pages for better performance
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Estoque = lazy(() => import("./pages/Estoque"));
const Triagem = lazy(() => import("./pages/Triagem"));
const Recebimento = lazy(() => import("./pages/Recebimento"));
const Auth = lazy(() => import("./pages/Auth"));
const Index = lazy(() => import("./pages/Index"));
const NotFound = lazy(() => import("./pages/NotFound"));
const Unauthorized = lazy(() => import("./pages/Unauthorized"));
const Configuracoes = lazy(() => import("./pages/Configuracoes"));
const Relatorios = lazy(() => import("./pages/Relatorios"));
const Scanner = lazy(() => import("./pages/Scanner"));
const Movimentacao = lazy(() => import("./pages/Movimentacao"));
const Rastreabilidade = lazy(() => import("./pages/Rastreabilidade"));
const KPIsOperacionais = lazy(() => import("./pages/KPIsOperacionais"));
const Produtividade = lazy(() => import("./pages/Produtividade"));
const AlertasInteligentes = lazy(() => import("./pages/AlertasInteligentes"));
const InventarioCiclico = lazy(() => import("./pages/InventarioCiclico"));
const CurvaABC = lazy(() => import("./pages/CurvaABC"));
const GestaoTarefas = lazy(() => import("./pages/GestaoTarefas"));
const Armazenamento = lazy(() => import("./pages/Armazenamento"));
const DashboardTriador = lazy(() => import("./pages/DashboardTriador"));
const FormularioTriagem = lazy(() => import("./pages/FormularioTriagem"));
const ConferenciaRecebimento = lazy(() => import("./pages/ConferenciaRecebimento"));
const TrocasDevolucoes = lazy(() => import("./pages/TrocasDevolucoes"));
const DashboardTrocas = lazy(() => import("./pages/DashboardTrocas"));
const Romaneios = lazy(() => import("./pages/Romaneios"));
const RelatorioDivergencias = lazy(() => import("./pages/RelatorioDivergencias"));
const RelatorioFornecedores = lazy(() => import("./pages/RelatorioFornecedores"));
const Seguranca = lazy(() => import("./pages/Seguranca"));
const TwoFactorAuth = lazy(() => import("./pages/TwoFactorAuth"));
const Produtos = lazy(() => import("./pages/Produtos"));
const Lotes = lazy(() => import("./pages/Lotes"));
const Posicoes = lazy(() => import("./pages/Posicoes"));
const Ondas = lazy(() => import("./pages/Ondas"));
const Gamificacao = lazy(() => import("./pages/Gamificacao"));
const OcupacaoVisual = lazy(() => import("./pages/OcupacaoVisual"));

// Additional pages
const UsersPage = lazy(() => import("./pages/admin/UsersPage"));
const RolesPage = lazy(() => import("./pages/admin/RolesPage"));
const AdminSettingsPage = lazy(() => import("./pages/admin/SettingsPage"));
const AuditLogPage = lazy(() => import("./pages/admin/AuditLogPage"));
const IntegrationsPage = lazy(() => import("./pages/admin/IntegrationsPage"));
const CategoriesPage = lazy(() => import("./pages/categories/CategoriesPage"));
const CustomersPage = lazy(() => import("./pages/customers/CustomersPage"));
const CustomerDetailPage = lazy(() => import("./pages/customers/CustomerDetailPage"));
const OrdersPage = lazy(() => import("./pages/orders/OrdersPage"));
const OrderDetailPage = lazy(() => import("./pages/orders/OrderDetailPage"));
const SerialsPage = lazy(() => import("./pages/serials/SerialsPage"));
const ShippingPage = lazy(() => import("./pages/shipping/ShippingPage"));
const WarehousesPage = lazy(() => import("./pages/warehouses/WarehousesPage"));
const WarehouseDetailPage = lazy(() => import("./pages/warehouses/WarehouseDetailPage"));
const ProfilePage = lazy(() => import("./pages/profile/ProfilePage"));
const HelpPage = lazy(() => import("./pages/help/HelpPage"));
const NotificationsPage = lazy(() => import("./pages/notifications/NotificationsPage"));
const PickingPage = lazy(() => import("./pages/picking/PickingPage"));
const PutawayPage = lazy(() => import("./pages/putaway/PutawayPage"));
const QualityPage = lazy(() => import("./pages/quality/QualityPage"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
    mutations: {
      retry: 0,
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
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/2fa" element={<TwoFactorAuth />} />
                    <Route path="/unauthorized" element={<Unauthorized />} />
                    <Route path="/" element={<AppLayout />}>
                      <Route index element={<Index />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="estoque" element={<Estoque />} />
                      <Route path="triagem" element={<Triagem />} />
                      <Route path="recebimento" element={<Recebimento />} />
                      <Route path="configuracoes" element={<Configuracoes />} />
                      <Route path="relatorios" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><Relatorios /></ProtectedRoute>} />
                      <Route path="scanner" element={<Scanner />} />
                      <Route path="movimentacao" element={<Movimentacao />} />
                      <Route path="rastreabilidade" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><Rastreabilidade /></ProtectedRoute>} />
                      <Route path="kpis-operacionais" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><KPIsOperacionais /></ProtectedRoute>} />
                      <Route path="produtividade" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><Produtividade /></ProtectedRoute>} />
                      <Route path="alertas" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><AlertasInteligentes /></ProtectedRoute>} />
                      <Route path="inventario" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><InventarioCiclico /></ProtectedRoute>} />
                      <Route path="curva-abc" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><CurvaABC /></ProtectedRoute>} />
                      <Route path="tarefas" element={<GestaoTarefas />} />
                      <Route path="armazenamento" element={<Armazenamento />} />
                      <Route path="triador" element={<DashboardTriador />} />
                      <Route path="formulario-triagem" element={<FormularioTriagem />} />
                      <Route path="conferencia" element={<ConferenciaRecebimento />} />
                      <Route path="trocas" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><TrocasDevolucoes /></ProtectedRoute>} />
                      <Route path="trocas-dashboard" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><DashboardTrocas /></ProtectedRoute>} />
                      <Route path="romaneios" element={<Romaneios />} />
                      <Route path="divergencias" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><RelatorioDivergencias /></ProtectedRoute>} />
                      <Route path="fornecedores" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><RelatorioFornecedores /></ProtectedRoute>} />
                      <Route path="seguranca" element={<ProtectedRoute allowedRoles={["admin"]}><Seguranca /></ProtectedRoute>} />
                      <Route path="produtos" element={<Produtos />} />
                      <Route path="lotes" element={<Lotes />} />
                      <Route path="posicoes" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><Posicoes /></ProtectedRoute>} />
                      <Route path="ondas" element={<ProtectedRoute allowedRoles={["admin", "supervisor"]}><Ondas /></ProtectedRoute>} />
                      <Route path="gamificacao" element={<Gamificacao />} />
                      <Route path="ocupacao" element={<OcupacaoVisual />} />
                      {/* Admin - Protected */}
                      <Route path="admin/usuarios" element={<ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute>} />
                      <Route path="admin/roles" element={<ProtectedRoute allowedRoles={["admin"]}><RolesPage /></ProtectedRoute>} />
                      <Route path="admin/configuracoes" element={<ProtectedRoute allowedRoles={["admin"]}><AdminSettingsPage /></ProtectedRoute>} />
                      <Route path="admin/auditoria" element={<ProtectedRoute allowedRoles={["admin"]}><AuditLogPage /></ProtectedRoute>} />
                      <Route path="admin/integracoes" element={<ProtectedRoute allowedRoles={["admin"]}><IntegrationsPage /></ProtectedRoute>} />
                      {/* Cadastros */}
                      <Route path="categorias" element={<CategoriesPage />} />
                      <Route path="clientes" element={<CustomersPage />} />
                      <Route path="clientes/:id" element={<CustomerDetailPage />} />
                      <Route path="pedidos" element={<OrdersPage />} />
                      <Route path="pedidos/:id" element={<OrderDetailPage />} />
                      <Route path="seriais" element={<SerialsPage />} />
                      <Route path="expedicao" element={<ShippingPage />} />
                      <Route path="armazens" element={<WarehousesPage />} />
                      <Route path="armazens/:id" element={<WarehouseDetailPage />} />
                      <Route path="perfil" element={<ProfilePage />} />
                      <Route path="ajuda" element={<HelpPage />} />
                      <Route path="notificacoes" element={<NotificationsPage />} />
                      <Route path="picking" element={<PickingPage />} />
                      <Route path="putaway" element={<PutawayPage />} />
                      <Route path="qualidade" element={<QualityPage />} />
                      <Route path="*" element={<NotFound />} />
                    </Route>
                  </Routes>
                </Suspense>
              </BrowserRouter>
            </NotificationProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
