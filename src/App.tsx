import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import { AuthProvider } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { OnboardingTourProvider } from "@/components/onboarding/OnboardingTour";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Recebimento from "./pages/Recebimento";
import ConferenciaRecebimento from "./pages/ConferenciaRecebimento";
import Triagem from "./pages/Triagem";
import FormularioTriagem from "./pages/FormularioTriagem";
import Estoque from "./pages/Estoque";
import Scanner from "./pages/Scanner";
import Movimentacao from "./pages/Movimentacao";
import Armazenamento from "./pages/Armazenamento";
import Dashboard from "./pages/Dashboard";
import DashboardTriador from "./pages/DashboardTriador";
import Relatorios from "./pages/Relatorios";
import Produtividade from "./pages/Produtividade";
import InventarioCiclico from "./pages/InventarioCiclico";
import CurvaABC from "./pages/CurvaABC";
import GestaoTarefas from "./pages/GestaoTarefas";
import AlertasInteligentes from "./pages/AlertasInteligentes";
import KPIsOperacionais from "./pages/KPIsOperacionais";
import Rastreabilidade from "./pages/Rastreabilidade";
import RelatorioFornecedores from "./pages/RelatorioFornecedores";
import TrocasDevolucoes from "./pages/TrocasDevolucoes";
import DashboardTrocas from "./pages/DashboardTrocas";
import RelatorioDivergencias from "./pages/RelatorioDivergencias";
import Configuracoes from "./pages/Configuracoes";
import Romaneios from "./pages/Romaneios";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Index />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recebimento"
          element={
            <ProtectedRoute>
              <Recebimento />
            </ProtectedRoute>
          }
        />
        <Route
          path="/recebimento/:id"
          element={
            <ProtectedRoute>
              <ConferenciaRecebimento />
            </ProtectedRoute>
          }
        />
        <Route
          path="/triagem"
          element={
            <ProtectedRoute>
              <Triagem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/triagem/:id"
          element={
            <ProtectedRoute>
              <FormularioTriagem />
            </ProtectedRoute>
          }
        />
        <Route
          path="/minha-produtividade"
          element={
            <ProtectedRoute>
              <DashboardTriador />
            </ProtectedRoute>
          }
        />
        <Route
          path="/estoque"
          element={
            <ProtectedRoute>
              <Estoque />
            </ProtectedRoute>
          }
        />
        <Route
          path="/scanner"
          element={
            <ProtectedRoute>
              <Scanner />
            </ProtectedRoute>
          }
        />
        <Route
          path="/movimentacao"
          element={
            <ProtectedRoute>
              <Movimentacao />
            </ProtectedRoute>
          }
        />
        <Route
          path="/armazenamento"
          element={
            <ProtectedRoute>
              <Armazenamento />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventario"
          element={
            <ProtectedRoute>
              <InventarioCiclico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/relatorios"
          element={
            <ProtectedRoute>
              <Relatorios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/produtividade"
          element={
            <ProtectedRoute>
              <Produtividade />
            </ProtectedRoute>
          }
        />
        <Route
          path="/inventario-ciclico"
          element={
            <ProtectedRoute>
              <InventarioCiclico />
            </ProtectedRoute>
          }
        />
        <Route
          path="/curva-abc"
          element={
            <ProtectedRoute>
              <CurvaABC />
            </ProtectedRoute>
          }
        />
        <Route
          path="/gestao-tarefas"
          element={
            <ProtectedRoute>
              <GestaoTarefas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/alertas"
          element={
            <ProtectedRoute>
              <AlertasInteligentes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/kpis"
          element={
            <ProtectedRoute>
              <KPIsOperacionais />
            </ProtectedRoute>
          }
        />
        <Route
          path="/rastreabilidade"
          element={
            <ProtectedRoute>
              <Rastreabilidade />
            </ProtectedRoute>
          }
        />
        <Route
          path="/qualidade-fornecedores"
          element={
            <ProtectedRoute>
              <RelatorioFornecedores />
            </ProtectedRoute>
          }
        />
        <Route
          path="/trocas-devolucoes"
          element={
            <ProtectedRoute>
              <TrocasDevolucoes />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard-trocas"
          element={
            <ProtectedRoute>
              <DashboardTrocas />
            </ProtectedRoute>
          }
        />
        <Route
          path="/divergencias"
          element={
            <ProtectedRoute>
              <RelatorioDivergencias />
            </ProtectedRoute>
          }
        />
        <Route
          path="/romaneios"
          element={
            <ProtectedRoute>
              <Romaneios />
            </ProtectedRoute>
          }
        />
        <Route
          path="/configuracoes"
          element={
            <ProtectedRoute>
              <Configuracoes />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <ErrorBoundary>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="estoki-theme">
        <TooltipProvider>
          <NotificationProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AuthProvider>
                <OnboardingTourProvider>
                  <AnimatedRoutes />
                </OnboardingTourProvider>
              </AuthProvider>
            </BrowserRouter>
          </NotificationProvider>
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  </ErrorBoundary>
);

export default App;
