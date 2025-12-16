import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Search, 
  Warehouse, 
  ArrowLeftRight, 
  ClipboardList,
  QrCode,
  AlertTriangle,
  MapPin,
  Truck
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { MenuButton } from "@/components/dashboard/MenuButton";

const mockKPIs = {
  aguardandoRecebimento: 12,
  triagemPendente: 5,
  itensEstoque: 847,
  divergencias: 3,
  ocupacaoPP: 85,
  boxesOcupados: 8,
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="p-4 lg:pl-72 space-y-6 animate-fade-in">
        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Visão Geral</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            <KPICard icon={Package} value={mockKPIs.aguardandoRecebimento} label="Aguard." sublabel="Recebimento" variant="warning" onClick={() => navigate("/recebimento")} />
            <KPICard icon={Search} value={mockKPIs.triagemPendente} label="Triagem" sublabel="Pendente" onClick={() => navigate("/triagem")} />
            <KPICard icon={Warehouse} value={mockKPIs.itensEstoque} label="Estoque" sublabel="Itens" variant="success" onClick={() => navigate("/estoque")} />
            <KPICard icon={AlertTriangle} value={mockKPIs.divergencias} label="Diverg." variant="danger" />
            <KPICard icon={MapPin} value={`${mockKPIs.ocupacaoPP}%`} label="Ocupação" sublabel="PP" onClick={() => navigate("/estoque")} />
            <KPICard icon={Truck} value={mockKPIs.boxesOcupados} label="Boxes" sublabel="Ocupados" variant="success" />
          </div>
        </section>

        <div className="border-t border-border" />

        <section>
          <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">Operações</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <MenuButton icon={Package} label="Recebimento" description="Conferir materiais" onClick={() => navigate("/recebimento")} />
            <MenuButton icon={Search} label="Triagem" description="Controle qualidade" onClick={() => navigate("/triagem")} />
            <MenuButton icon={Warehouse} label="Estoque" description="Mapa visual" onClick={() => navigate("/estoque")} variant="primary" />
            <MenuButton icon={ArrowLeftRight} label="Movimentação" description="Transferências" onClick={() => navigate("/movimentacao")} />
            <MenuButton icon={ClipboardList} label="Inventário" description="Relatórios" onClick={() => navigate("/inventario")} />
            <MenuButton icon={QrCode} label="Scanner" description="Ler QR Code" onClick={() => navigate("/scanner")} />
          </div>
        </section>
      </div>
    </AppLayout>
  );
}
