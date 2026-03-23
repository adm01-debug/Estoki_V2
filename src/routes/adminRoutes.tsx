import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

const UsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const RolesPage = lazy(() => import("@/pages/admin/RolesPage"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
const AuditLogPage = lazy(() => import("@/pages/admin/AuditLogPage"));
const IntegrationsPage = lazy(() => import("@/pages/admin/IntegrationsPage"));
const AdminTelemetriaPage = lazy(() => import("@/pages/admin/AdminTelemetriaPage"));
const Seguranca = lazy(() => import("@/pages/Seguranca"));
const Governanca = lazy(() => import("@/pages/Governanca"));

export const adminRoutes = (
  <>
    <Route path="admin/usuarios" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin"]}><UsersPage /></ProtectedRoute></Suspense>} />
    <Route path="admin/roles" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin"]}><RolesPage /></ProtectedRoute></Suspense>} />
    <Route path="admin/configuracoes" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><ProtectedRoute allowedRoles={["admin"]}><AdminSettingsPage /></ProtectedRoute></Suspense>} />
    <Route path="admin/auditoria" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin"]}><AuditLogPage /></ProtectedRoute></Suspense>} />
    <Route path="admin/integracoes" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin"]}><IntegrationsPage /></ProtectedRoute></Suspense>} />
    <Route path="admin/telemetria" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><ProtectedRoute allowedRoles={["admin"]}><AdminTelemetriaPage /></ProtectedRoute></Suspense>} />
    <Route path="seguranca" element={<Suspense fallback={<RouteLoadingFallback type="form" />}><ProtectedRoute allowedRoles={["admin"]}><Seguranca /></ProtectedRoute></Suspense>} />
    <Route path="governanca" element={<Suspense fallback={<RouteLoadingFallback type="table" />}><ProtectedRoute allowedRoles={["admin", "supervisor"]}><Governanca /></ProtectedRoute></Suspense>} />
  </>
);
