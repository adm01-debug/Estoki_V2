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

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
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
              <BrowserRouter>
                <Suspense fallback={<LoadingFallback />}>
                  <Routes>
                    <Route path="/auth" element={<Auth />} />
                    <Route path="/2fa" element={<TwoFactorAuth />} />
                    <Route path="/" element={<AppLayout />}>
                      <Route index element={<Index />} />
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="estoque" element={<Estoque />} />
                      <Route path="triagem" element={<Triagem />} />
                      <Route path="recebimento" element={<Recebimento />} />
                      <Route path="configuracoes" element={<Configuracoes />} />
                      <Route path="relatorios" element={<Relatorios />} />
                      <Route path="scanner" element={<Scanner />} />
                      <Route path="movimentacao" element={<Movimentacao />} />
                      <Route path="rastreabilidade" element={<Rastreabilidade />} />
                      <Route path="kpis" element={<KPIsOperacionais />} />
                      <Route path="produtividade" element={<Produtividade />} />
                      <Route path="alertas" element={<AlertasInteligentes />} />
                      <Route path="inventario" element={<InventarioCiclico />} />
                      <Route path="curva-abc" element={<CurvaABC />} />
                      <Route path="tarefas" element={<GestaoTarefas />} />
                      <Route path="armazenamento" element={<Armazenamento />} />
                      <Route path="triador" element={<DashboardTriador />} />
                      <Route path="formulario-triagem" element={<FormularioTriagem />} />
                      <Route path="conferencia" element={<ConferenciaRecebimento />} />
                      <Route path="trocas" element={<TrocasDevolucoes />} />
                      <Route path="trocas-dashboard" element={<DashboardTrocas />} />
                      <Route path="romaneios" element={<Romaneios />} />
                      <Route path="divergencias" element={<RelatorioDivergencias />} />
                      <Route path="fornecedores" element={<RelatorioFornecedores />} />
                      <Route path="seguranca" element={<Seguranca />} />
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
