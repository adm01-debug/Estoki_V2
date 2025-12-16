import { useNavigate } from "react-router-dom";
import { 
  Package, 
  Search, 
  Warehouse, 
  ArrowLeftRight, 
  ClipboardList,
  QrCode,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  XCircle,
  ArrowRight,
  BarChart3
} from "lucide-react";
import { AppLayout } from "@/components/layout/AppLayout";
import { KPICard } from "@/components/dashboard/KPICard";
import { MenuButton } from "@/components/dashboard/MenuButton";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const mockKPIs = {
  aguardandoRecebimento: 12,
  triagemPendente: 5,
  itensEstoque: 847,
  divergencias: 3,
  ocupacaoPP: 85,
  ocupacaoBoxes: 67,
  movimentacoesHoje: 45,
  aprovacaoTriagem: 94,
};

const recentActivity = [
  { id: 1, type: "recebimento", desc: "NF 12345 conferida", time: "há 5 min", status: "success" },
  { id: 2, type: "triagem", desc: "Lote #789 aprovado", time: "há 12 min", status: "success" },
  { id: 3, type: "divergencia", desc: "Divergência NF 11234", time: "há 25 min", status: "danger" },
  { id: 4, type: "movimentacao", desc: "Transfer. PP01 → PP03", time: "há 1h", status: "default" },
  { id: 5, type: "triagem", desc: "Lote #788 reprovado", time: "há 2h", status: "warning" },
];

const getActivityIcon = (type: string) => {
  switch (type) {
    case "recebimento": return Package;
    case "triagem": return Search;
    case "divergencia": return AlertTriangle;
    case "movimentacao": return ArrowLeftRight;
    default: return Clock;
  }
};

const getStatusColor = (status: string) => {
  switch (status) {
    case "success": return "bg-success/10 text-success border-success/20";
    case "danger": return "bg-destructive/10 text-destructive border-destructive/20";
    case "warning": return "bg-warning/10 text-warning border-warning/20";
    default: return "bg-muted text-muted-foreground border-border";
  }
};

export default function Dashboard() {
  const navigate = useNavigate();

  return (
    <AppLayout>
      <div className="p-4 lg:pl-72 space-y-6">
        {/* Hero Section */}
        <section className="animate-fade-in">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Bom dia, João! 👋</h1>
              <p className="text-muted-foreground">Aqui está o resumo do seu estoque</p>
            </div>
            <Button 
              variant="outline" 
              className="gap-2 hidden sm:flex"
              onClick={() => navigate("/dashboard")}
            >
              <BarChart3 className="h-4 w-4" />
              Ver Dashboard
            </Button>
          </div>
        </section>

        {/* KPIs Grid */}
        <section className="animate-fade-in" style={{ animationDelay: "0.1s" }}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <KPICard 
              icon={Package} 
              value={mockKPIs.aguardandoRecebimento} 
              label="Aguardando" 
              sublabel="Recebimento" 
              variant="warning" 
              trend={{ value: 8, isUp: true }}
              onClick={() => navigate("/recebimento")} 
            />
            <KPICard 
              icon={Search} 
              value={mockKPIs.triagemPendente} 
              label="Triagem" 
              sublabel="Pendente" 
              trend={{ value: 12, isUp: false }}
              onClick={() => navigate("/triagem")} 
            />
            <KPICard 
              icon={Warehouse} 
              value={mockKPIs.itensEstoque.toLocaleString()} 
              label="Itens" 
              sublabel="Em Estoque" 
              variant="success"
              onClick={() => navigate("/estoque")} 
            />
            <KPICard 
              icon={AlertTriangle} 
              value={mockKPIs.divergencias} 
              label="Divergências" 
              sublabel="Pendentes"
              variant="danger" 
            />
          </div>
        </section>

        {/* Stats Cards */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4 animate-fade-in" style={{ animationDelay: "0.2s" }}>
          {/* Ocupação Card */}
          <Card className="col-span-1 md:col-span-2">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Taxa de Ocupação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-around py-4">
                <div className="text-center">
                  <ProgressRing 
                    value={mockKPIs.ocupacaoPP} 
                    variant={mockKPIs.ocupacaoPP > 90 ? "danger" : mockKPIs.ocupacaoPP > 70 ? "warning" : "success"}
                    label="Porta-Paletes"
                  />
                </div>
                <div className="h-20 w-px bg-border" />
                <div className="text-center">
                  <ProgressRing 
                    value={mockKPIs.ocupacaoBoxes} 
                    variant="success"
                    label="Boxes"
                  />
                </div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                <span>128 posições ocupadas</span>
                <span>22 posições livres</span>
              </div>
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-semibold">Hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center">
                    <CheckCircle2 className="h-5 w-5 text-success" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-success">{mockKPIs.movimentacoesHoje}</p>
                    <p className="text-xs text-muted-foreground">Movimentações</p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
                    <Search className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-primary">{mockKPIs.aprovacaoTriagem}%</p>
                    <p className="text-xs text-muted-foreground">Aprovação Triagem</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-destructive/10 flex items-center justify-center">
                    <XCircle className="h-5 w-5 text-destructive" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-destructive">2</p>
                    <p className="text-xs text-muted-foreground">Itens Reprovados</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Operations & Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Operations */}
          <section className="animate-fade-in" style={{ animationDelay: "0.3s" }}>
            <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
              Operações
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <MenuButton 
                icon={Package} 
                label="Recebimento" 
                description="Conferir materiais"
                badge={mockKPIs.aguardandoRecebimento}
                onClick={() => navigate("/recebimento")} 
              />
              <MenuButton 
                icon={Search} 
                label="Triagem" 
                description="Controle qualidade"
                badge={mockKPIs.triagemPendente}
                onClick={() => navigate("/triagem")} 
              />
              <MenuButton 
                icon={Warehouse} 
                label="Estoque" 
                description="Mapa visual" 
                variant="gradient"
                onClick={() => navigate("/estoque")} 
              />
              <MenuButton 
                icon={ArrowLeftRight} 
                label="Movimentação" 
                description="Transferências"
                onClick={() => navigate("/movimentacao")} 
              />
              <MenuButton 
                icon={QrCode} 
                label="Scanner" 
                description="Ler QR Code"
                onClick={() => navigate("/scanner")} 
              />
              <MenuButton 
                icon={ClipboardList} 
                label="Relatórios" 
                description="Exportar dados"
                onClick={() => navigate("/dashboard")} 
              />
            </div>
          </section>

          {/* Recent Activity */}
          <section className="animate-fade-in" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                Atividade Recente
              </h2>
              <Button variant="ghost" size="sm" className="text-xs gap-1">
                Ver tudo <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <Card>
              <CardContent className="p-0">
                <div className="divide-y divide-border">
                  {recentActivity.map((activity, index) => {
                    const Icon = getActivityIcon(activity.type);
                    return (
                      <div 
                        key={activity.id}
                        className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                        style={{ animationDelay: `${0.5 + index * 0.1}s` }}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${getStatusColor(activity.status)}`}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-foreground truncate">
                            {activity.desc}
                          </p>
                          <p className="text-xs text-muted-foreground">{activity.time}</p>
                        </div>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getStatusColor(activity.status)}`}
                        >
                          {activity.type}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>
      </div>
    </AppLayout>
  );
}
