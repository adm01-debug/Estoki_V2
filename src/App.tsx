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
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        {/* Rota pública - Login/Registro */}
        <Route path="/auth" element={<Auth />} />
        
        {/* Rotas protegidas - Todos os usuários autenticados */}
        <Route path="/" element={
          <ProtectedRoute>
            <Index />
          </ProtectedRoute>
        } />
        
        {/* Operações - operador, supervisor, admin */}
        <Route path="/recebimento" element={
          <ProtectedRoute allowedRoles={["operador", "supervisor", "admin"]}>
            <Recebimento />
          </ProtectedRoute>
        } />
        <Route path="/recebimento/:id" element={
          <ProtectedRoute allowedRoles={["operador", "supervisor", "admin"]}>
            <ConferenciaRecebimento />
          </ProtectedRoute>
        } />
        <Route path="/triagem" element={
          <ProtectedRoute allowedRoles={["operador", "supervisor", "admin"]}>
            <Triagem />
          </ProtectedRoute>
        } />
        <Route path="/triagem/:id" element={
          <ProtectedRoute allowedRoles={["operador", "supervisor", "admin"]}>
            <FormularioTriagem />
          </ProtectedRoute>
        } />
        <Route path="/minha-produtividade" element={
          <ProtectedRoute allowedRoles={["operador", "supervisor", "admin"]}>
            <DashboardTriador />
          </ProtectedRoute>
        } />
        <Route path="/estoque" element={
          <ProtectedRoute allowedRoles={["operador", "supervisor", "admin"]}>
            <Estoque />
          </ProtectedRoute>
        } />
        <Route path="/scanner" element={
          <ProtectedRoute allowedRoles={["operador", "supervisor", "admin"]}>
            <Scanner />
          </ProtectedRoute>
        } />
        <Route path="/movimentacao" element={
          <ProtectedRoute allowedRoles={["operador", "supervisor", "admin"]}>
            <Movimentacao />
          </ProtectedRoute>
        } />
        <Route path="/armazenamento" element={
          <ProtectedRoute allowedRoles={["operador", "supervisor", "admin"]}>
            <Armazenamento />
          </ProtectedRoute>
        } />
        <Route path="/inventario" element={
          <ProtectedRoute allowedRoles={["operador", "supervisor", "admin"]}>
            <Estoque />
          </ProtectedRoute>
        } />
        
        {/* Gestão - supervisor, admin */}
        <Route path="/dashboard" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/relatorios" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <Relatorios />
          </ProtectedRoute>
        } />
        <Route path="/produtividade" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <Produtividade />
          </ProtectedRoute>
        } />
        <Route path="/inventario-ciclico" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <InventarioCiclico />
          </ProtectedRoute>
        } />
        <Route path="/curva-abc" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <CurvaABC />
          </ProtectedRoute>
        } />
        <Route path="/gestao-tarefas" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <GestaoTarefas />
          </ProtectedRoute>
        } />
        <Route path="/alertas" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <AlertasInteligentes />
          </ProtectedRoute>
        } />
        <Route path="/kpis" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <KPIsOperacionais />
          </ProtectedRoute>
        } />
        <Route path="/rastreabilidade" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <Rastreabilidade />
          </ProtectedRoute>
        } />
        <Route path="/qualidade-fornecedores" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <RelatorioFornecedores />
          </ProtectedRoute>
        } />
        <Route path="/trocas-devolucoes" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <TrocasDevolucoes />
          </ProtectedRoute>
        } />
        <Route path="/dashboard-trocas" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <DashboardTrocas />
          </ProtectedRoute>
        } />
        <Route path="/divergencias" element={
          <ProtectedRoute allowedRoles={["supervisor", "admin"]}>
            <RelatorioDivergencias />
          </ProtectedRoute>
        } />
        
        {/* Configurações - apenas admin */}
        <Route path="/configuracoes" element={
          <ProtectedRoute allowedRoles={["admin"]}>
            <Configuracoes />
          </ProtectedRoute>
        } />
        
        {/* 404 */}
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <AuthProvider>
        <NotificationProvider>
          <TooltipProvider>
            <Toaster />
            <Sonner />
            <BrowserRouter>
              <AnimatedRoutes />
            </BrowserRouter>
          </TooltipProvider>
        </NotificationProvider>
      </AuthProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
