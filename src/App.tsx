 import { Suspense, lazy } from "react";
 import { BrowserRouter, Routes, Route } from "react-router-dom";
 import { GlobalLoadingBar } from "@/components/common/GlobalLoadingBar";
import { AppProviders } from "@/components/common/AppProviders";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import AppLayout from "./components/layout/AppLayout";
import { RouteErrorBoundary } from "@/components/common/RouteErrorBoundary";
import { InstallPrompt } from "./components/pwa/InstallPrompt";
import { UpdatePrompt } from "./components/pwa/UpdatePrompt";

// ── Route modules ──
import { publicRoutes } from "@/routes/publicRoutes";
import { adminRoutes } from "@/routes/adminRoutes";
import { wmsRoutes } from "@/routes/wmsRoutes";
import { analyticsRoutes } from "@/routes/analyticsRoutes";
import { featureRoutes } from "@/routes/featureRoutes";

// ── Core pages ──
const Dashboard = lazy(() => import("./pages/Dashboard"));
const DashboardOperacional = lazy(() => import("./pages/DashboardOperacional"));
const Index = lazy(() => import("./features/dashboard/pages/DashboardPage"));

const Hub = lazy(() => import("./pages/Hub"));
 const App = () => (
   <AppProviders>
     <BrowserRouter>
       <GlobalLoadingBar />
       <Routes>
        {/* Public routes */}
        {publicRoutes}

        {/* Protected routes */}
        <Route path="/" element={<AppLayout />}>
          <Route index element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><Index /></Suspense></RouteErrorBoundary>} />
          <Route path="dashboard" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><Dashboard /></Suspense></RouteErrorBoundary>} />
          <Route path="monitor" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><DashboardOperacional /></Suspense></RouteErrorBoundary>} />

          {wmsRoutes}
          {analyticsRoutes}
          <Route path="hub" element={<RouteErrorBoundary><Suspense fallback={<RouteLoadingFallback type="dashboard" />}><Hub /></Suspense></RouteErrorBoundary>} />
          {adminRoutes}
          {featureRoutes}
        </Route>
      </Routes>
    </BrowserRouter>
  </AppProviders>
);

export default App;
