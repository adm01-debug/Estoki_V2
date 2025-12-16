import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Recebimento from "./pages/Recebimento";
import ConferenciaRecebimento from "./pages/ConferenciaRecebimento";
import Triagem from "./pages/Triagem";
import Estoque from "./pages/Estoque";
import Scanner from "./pages/Scanner";
import Movimentacao from "./pages/Movimentacao";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/recebimento" element={<Recebimento />} />
          <Route path="/recebimento/:id" element={<ConferenciaRecebimento />} />
          <Route path="/triagem" element={<Triagem />} />
          <Route path="/estoque" element={<Estoque />} />
          <Route path="/scanner" element={<Scanner />} />
          <Route path="/movimentacao" element={<Movimentacao />} />
          <Route path="/inventario" element={<Estoque />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
