import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { LoadingFallback } from "@/components/common/LoadingFallback";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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

// Shipping
const Romaneios = lazy(() => import("@/pages/Romaneios"));
const ShippingPage = lazy(() => import("@/pages/shipping/ShippingPage"));
const KanbanPipeline = lazy(() => import("@/pages/KanbanPipeline"));

// Triagem Detail
const DashboardTriador = lazy(() => import("@/pages/DashboardTriador"));
const FormularioTriagem = lazy(() => import("@/pages/FormularioTriagem"));
const QualityPage = lazy(() => import("@/pages/quality/QualityPage"));

export const wmsRoutes = (
  <>
    {/* WMS Operations */}
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
  </>
);
