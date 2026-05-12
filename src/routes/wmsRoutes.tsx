import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { LoadingFallback } from "@/components/common/LoadingFallback";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteErrorBoundary } from "@/components/common/RouteErrorBoundary";

// WMS Operations
const Estoque = lazy(() => import("@/pages/Estoque"));
const Triagem = lazy(() => import("@/pages/Triagem"));
const Recebimento = lazy(() => import("@/pages/Recebimento"));
const Movimentacao = lazy(() => import("@/pages/Movimentacao"));
const Armazenamento = lazy(() => import("@/pages/Armazenamento"));
const ConferenciaRecebimento = lazy(() => import("@/pages/ConferenciaRecebimento"));
const Scanner = lazy(() => import("@/pages/Scanner"));

// Products & Inventory
const Produtos = lazy(() => import("@/pages/Produtos"));
const Lotes = lazy(() => import("@/pages/Lotes"));
const Posicoes = lazy(() => import("@/pages/Posicoes"));
const InventarioCiclico = lazy(() => import("@/pages/InventarioCiclico"));
const CurvaABC = lazy(() => import("@/pages/CurvaABC"));
const OcupacaoVisual = lazy(() => import("@/pages/OcupacaoVisual"));

// Picking & Waves
const PickingPage = lazy(() => import("@/pages/picking/PickingPage"));
const PutawayPage = lazy(() => import("@/pages/putaway/PutawayPage"));
const Ondas = lazy(() => import("@/pages/Ondas"));
const GestaoTarefas = lazy(() => import("@/pages/GestaoTarefas"));
const AjustesEstoque = lazy(() => import("@/pages/AjustesEstoque"));

// Shipping
const Romaneios = lazy(() => import("@/pages/Romaneios"));
const ShippingPage = lazy(() => import("@/pages/shipping/ShippingPage"));
const KanbanPipeline = lazy(() => import("@/pages/KanbanPipeline"));

// Triagem Detail
const DashboardTriador = lazy(() => import("@/pages/DashboardTriador"));
const FormularioTriagem = lazy(() => import("@/pages/FormularioTriagem"));
const QualityPage = lazy(() => import("@/pages/quality/QualityPage"));
const OrdersPage = lazy(() => import("@/pages/orders/OrdersPage"));

export const wmsRoutes = (
  <>
    {/* WMS Operations */}
    <Route path="estoque" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><Estoque /></Suspense></RouteErrorBoundary>} />
    <Route path="triagem" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><Triagem /></Suspense></RouteErrorBoundary>} />
    <Route path="recebimento" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><Recebimento /></Suspense></RouteErrorBoundary>} />
    <Route path="movimentacao" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><Movimentacao /></Suspense></RouteErrorBoundary>} />
    <Route path="armazenamento" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><Armazenamento /></Suspense></RouteErrorBoundary>} />
    <Route path="conferencia" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="form" />}><ConferenciaRecebimento /></Suspense></RouteErrorBoundary>} />
    <Route path="scanner" element={<RouteErrorBoundary><Suspense fallback={<LoadingFallback />}><Scanner /></Suspense></RouteErrorBoundary>} />

    {/* Products & Inventory */}
    <Route path="produtos" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><Produtos /></Suspense></RouteErrorBoundary>} />
    <Route path="lotes" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><Lotes /></Suspense></RouteErrorBoundary>} />
    <Route path="posicoes" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Posicoes /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="inventario" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><InventarioCiclico /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="curva-abc" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><CurvaABC /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="ocupacao" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><OcupacaoVisual /></Suspense></RouteErrorBoundary>} />

    {/* Picking & Waves */}
    <Route path="picking" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><PickingPage /></Suspense></RouteErrorBoundary>} />
    <Route path="putaway" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><PutawayPage /></Suspense></RouteErrorBoundary>} />
    <Route path="ondas" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Ondas /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="tarefas" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><GestaoTarefas /></Suspense></RouteErrorBoundary>} />
    <Route path="ajustes" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><AjustesEstoque /></Suspense></RouteErrorBoundary>} />

    {/* Shipping */}
    <Route path="romaneios" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><Romaneios /></Suspense></RouteErrorBoundary>} />
    <Route path="expedicao" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ShippingPage /></Suspense></RouteErrorBoundary>} />
    <Route path="kanban" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><KanbanPipeline /></Suspense></RouteErrorBoundary>} />

    {/* Triagem Detail */}
    <Route path="triador" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><DashboardTriador /></Suspense></RouteErrorBoundary>} />
    <Route path="formulario-triagem" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="form" />}><FormularioTriagem /></Suspense></RouteErrorBoundary>} />
    <Route path="qualidade" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><QualityPage /></Suspense></RouteErrorBoundary>} />
    <Route path="pedidos" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><OrdersPage /></Suspense></RouteErrorBoundary>} />
  </>
);
