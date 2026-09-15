import { Suspense, lazy } from "react";
import { Route } from "react-router-dom";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { RouteErrorBoundary } from "@/components/common/RouteErrorBoundary";

const UsersPage = lazy(() => import("@/pages/admin/UsersPage"));
const RolesPage = lazy(() => import("@/pages/admin/RolesPage"));
const AdminSettingsPage = lazy(() => import("@/pages/admin/SettingsPage"));
const AuditLogPage = lazy(() => import("@/pages/admin/AuditLogPage"));
const IntegrationsPage = lazy(() => import("@/pages/admin/IntegrationsPage"));
const AdminTelemetriaPage = lazy(() => import("@/pages/admin/AdminTelemetriaPage"));
const Seguranca = lazy(() => import("@/pages/Seguranca"));
const Governanca = lazy(() => import("@/pages/Governanca"));
const SimulationPage = lazy(() => import("@/pages/admin/SimulationPage"));
const BackendHealthPage = lazy(() => import("@/pages/admin/BackendHealthPage"));
const AuditoriaCriticaPage = lazy(() => import("@/pages/admin/AuditoriaCriticaPage"));
const CircuitBreakersPage = lazy(() => import("@/pages/admin/CircuitBreakersPage"));
const ApiPortalPage = lazy(() => import("@/pages/admin/ApiPortalPage"));

export const adminRoutes = (
  <>
    <Route
      path="admin/saude-backend"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="dashboard" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <BackendHealthPage />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="admin/circuit-breakers"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="dashboard" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <CircuitBreakersPage />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="admin/api"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="dashboard" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <ApiPortalPage />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="admin/simulacao"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="dashboard" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <SimulationPage />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="admin/usuarios"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="table" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <UsersPage />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="admin/roles"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="table" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <RolesPage />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="admin/configuracoes"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="form" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminSettingsPage />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="admin/auditoria"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="table" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuditLogPage />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="admin/auditoria-critica"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="table" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <AuditoriaCriticaPage />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="admin/integracoes"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="table" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <IntegrationsPage />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="admin/telemetria"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="dashboard" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <AdminTelemetriaPage />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="seguranca"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="form" />}>
            <ProtectedRoute allowedRoles={["admin"]}>
              <Seguranca />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
    <Route
      path="governanca"
      element={
        <RouteErrorBoundary>
          <Suspense fallback={<RouteLoadingFallback type="table" />}>
            <ProtectedRoute allowedRoles={["admin", "supervisor"]}>
              <Governanca />
            </ProtectedRoute>
          </Suspense>
        </RouteErrorBoundary>
      }
    />
  </>
);
