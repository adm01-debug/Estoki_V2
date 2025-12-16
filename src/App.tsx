import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence } from "framer-motion";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import { NotificationProvider } from "@/contexts/NotificationContext";
import Index from "./pages/Index";
import Recebimento from "./pages/Recebimento";
import ConferenciaRecebimento from "./pages/ConferenciaRecebimento";
import Triagem from "./pages/Triagem";
import FormularioTriagem from "./pages/FormularioTriagem";
import Estoque from "./pages/Estoque";
import Scanner from "./pages/Scanner";
import Movimentacao from "./pages/Movimentacao";
import Armazenamento from "./pages/Armazenamento";
import Dashboard from "./pages/Dashboard";
import Relatorios from "./pages/Relatorios";
import Produtividade from "./pages/Produtividade";
import InventarioCiclico from "./pages/InventarioCiclico";
import CurvaABC from "./pages/CurvaABC";
import Configuracoes from "./pages/Configuracoes";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Index />} />
        <Route path="/recebimento" element={<Recebimento />} />
        <Route path="/recebimento/:id" element={<ConferenciaRecebimento />} />
        <Route path="/triagem" element={<Triagem />} />
        <Route path="/triagem/:id" element={<FormularioTriagem />} />
        <Route path="/estoque" element={<Estoque />} />
        <Route path="/scanner" element={<Scanner />} />
        <Route path="/movimentacao" element={<Movimentacao />} />
        <Route path="/armazenamento" element={<Armazenamento />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/relatorios" element={<Relatorios />} />
        <Route path="/produtividade" element={<Produtividade />} />
        <Route path="/configuracoes" element={<Configuracoes />} />
        <Route path="/inventario-ciclico" element={<InventarioCiclico />} />
        <Route path="/curva-abc" element={<CurvaABC />} />
        <Route path="/inventario" element={<Estoque />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </AnimatePresence>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <NotificationProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <AnimatedRoutes />
          </BrowserRouter>
        </TooltipProvider>
      </NotificationProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
