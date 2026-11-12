import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Suspense, lazy } from "react";
import { HelmetProvider } from "react-helmet-async";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { AppProvider } from "@/contexts/AppContext";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { TransitionProvider } from "@/contexts/TransitionContext";
import { ErrorBoundary } from "@/components/common/ErrorBoundary";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { KeyboardShortcuts } from "./KeyboardShortcuts";

// Widgets não críticos para o primeiro paint — carregados sob demanda para
// tirar o peso do bundle inicial (PWA prompts, telemetria).
const PerformanceMonitor = lazy(() =>
  import("@/features/analytics/components/PerformanceMonitor").then((m) => ({
    default: m.PerformanceMonitor,
  }))
);
const InstallPrompt = lazy(() =>
  import("@/components/pwa/InstallPrompt").then((m) => ({ default: m.InstallPrompt }))
);
const UpdatePrompt = lazy(() =>
  import("@/components/pwa/UpdatePrompt").then((m) => ({ default: m.UpdatePrompt }))
);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
      refetchOnReconnect: "always",
      networkMode: "offlineFirst",
    },
    mutations: {
      retry: 0,
      networkMode: "online",
    },
  },
});

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <HelmetProvider>
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider>
            <AuthProvider>
              <AppProvider>
                <NotificationProvider>
                  <KeyboardShortcuts />
                  <Sonner />
                  <Toaster />
                  <Suspense fallback={null}>
                    <InstallPrompt />
                    <UpdatePrompt />
                    <PerformanceMonitor />
                  </Suspense>
                  <TransitionProvider>{children}</TransitionProvider>
                </NotificationProvider>
              </AppProvider>
            </AuthProvider>
          </ThemeProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </HelmetProvider>
  );
}
