import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <AuthProvider>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/" element={<ProtectedRoute><Index /></ProtectedRoute>} />
            <Route path="/recebimento" element={<ProtectedRoute><Recebimento /></ProtectedRoute>} />
            <Route path="/recebimento/:id" element={<ProtectedRoute><ConferenciaRecebimento /></ProtectedRoute>} />
            <Route path="/triagem" element={<ProtectedRoute><Triagem /></ProtectedRoute>} />
            <Route path="/triagem/:id" element={<ProtectedRoute><FormularioTriagem /></ProtectedRoute>} />
            <Route path="/estoque" element={<ProtectedRoute><Estoque /></ProtectedRoute>} />
            <Route path="/scanner" element={<ProtectedRoute><Scanner /></ProtectedRoute>} />
            <Route path="/movimentacao" element={<ProtectedRoute><Movimentacao /></ProtectedRoute>} />
            <Route path="/armazenamento" element={<ProtectedRoute><Armazenamento /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute allowedRoles={["supervisor", "admin"]}><Dashboard /></ProtectedRoute>} />
            <Route path="/configuracoes" element={<ProtectedRoute><Configuracoes /></ProtectedRoute>} />
            <Route path="/inventario" element={<ProtectedRoute><Estoque /></ProtectedRoute>} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </AuthProvider>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
