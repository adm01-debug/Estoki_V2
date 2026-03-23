import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const Relatorios = lazy(() => import("@/pages/Relatorios"));
const KPIsOperacionais = lazy(() => import("@/pages/KPIsOperacionais"));
const Produtividade = lazy(() => import("@/pages/Produtividade"));
const Rastreabilidade = lazy(() => import("@/pages/Rastreabilidade"));
const RelatorioDivergencias = lazy(() => import("@/pages/RelatorioDivergencias"));
const RelatorioFornecedores = lazy(() => import("@/pages/RelatorioFornecedores"));
const AlertasInteligentes = lazy(() => import("@/pages/AlertasInteligentes"));

const TrocasDevolucoes = lazy(() => import("@/pages/TrocasDevolucoes"));
const DashboardTrocas = lazy(() => import("@/pages/DashboardTrocas"));

export const analyticsRoutes = (
  <>
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
  </>
);
