import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteErrorBoundary } from "@/components/common/RouteErrorBoundary";

const Relatorios = lazy(() => import("@/pages/Relatorios"));
const KPIsOperacionais = lazy(() => import("@/features/analytics/pages/KPIsPage"));
const Produtividade = lazy(() => import("@/pages/Produtividade"));
const Rastreabilidade = lazy(() => import("@/pages/Rastreabilidade"));
const RelatorioDivergencias = lazy(() => import("@/pages/RelatorioDivergencias"));
const RelatorioFornecedores = lazy(() => import("@/pages/RelatorioFornecedores"));
const AlertasInteligentes = lazy(() => import("@/pages/AlertasInteligentes"));

const TrocasDevolucoes = lazy(() => import("@/pages/TrocasDevolucoes"));
const DashboardTrocas = lazy(() => import("@/pages/DashboardTrocas"));

export const analyticsRoutes = (
  <>
    <Route path="relatorios" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Relatorios /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="kpis-operacionais" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><KPIsOperacionais /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="produtividade" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Produtividade /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="alertas" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><AlertasInteligentes /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="rastreabilidade" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Rastreabilidade /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="divergencias" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><RelatorioDivergencias /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="fornecedores" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><RelatorioFornecedores /></ProtectedRoute></Suspense></RouteErrorBoundary>} />

    {/* Returns */}
    <Route path="trocas" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><TrocasDevolucoes /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
    <Route path="trocas-dashboard" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><DashboardTrocas /></ProtectedRoute></Suspense></RouteErrorBoundary>} />
  </>
);
