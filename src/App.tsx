import { Suspense, lazy } from "react";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { HelmetProvider } from 'react-helmet-async';
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";
import AppLayout from "./components/layout/AppLayout";
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
const Index = lazy(() => import("./pages/Index"));

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
      networkMode: 'offlineFirst',
    },
    mutations: {
      retry: 0,
      networkMode: 'online',
    },
  },
});

const App = () => (
  <HelmetProvider>
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <AppProvider>
            <NotificationProvider>
              <Sonner />
              <InstallPrompt />
              <UpdatePrompt />
              <BrowserRouter>
                <Routes>
                  {/* Public routes */}
                  {publicRoutes}

                  {/* Protected routes */}
                  <Route path="/" element={<AppLayout />}>
                    <Route index element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><Index /></Suspense>} />
                    <Route path="dashboard" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><Dashboard /></Suspense>} />
                    <Route path="monitor" element={<Suspense fallback={<RouteLoadingFallback type="dashboard" />}><DashboardOperacional /></Suspense>} />

                    {wmsRoutes}
                    {analyticsRoutes}
                    {adminRoutes}
                    {featureRoutes}
                  </Route>
                </Routes>
              </BrowserRouter>
            </NotificationProvider>
          </AppProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
  </HelmetProvider>
);

export default App;
