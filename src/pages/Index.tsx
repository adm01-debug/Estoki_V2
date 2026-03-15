// @ts-nocheck
import { useNavigate } from "react-router-dom";
import { useCallback, useRef } from "react";
import { usePullToRefresh } from "@/hooks/useTouchGestures";
import { motion } from "framer-motion";
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
  BarChart3,
  Loader2,
  Wifi
} from "lucide-react";
// AppLayout is provided by the router, no need to import
import { KPICard } from "@/components/dashboard/KPICard";
import { MenuButton } from "@/components/dashboard/MenuButton";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageTransition } from "@/components/layout/PageTransition";
import { Skeleton } from "@/components/ui/skeleton";
import { useDashboard } from "@/hooks/useDashboard";
import { useAtividadeRecente } from "@/hooks/useAtividadeRecente";
import { useAuth } from "@/contexts/AuthContext";
import { useRecebimentos } from "@/hooks/useRecebimentos";
import { useEstoque } from "@/hooks/useEstoque";
import { useRealtimeKPIs } from "@/hooks/useRealtimeKPIs";

const getActivityIcon = (type: string) => {
  switch (type) {
    case "recebimento": return Package;
    case "triagem": return Search;
    case "divergencia": return AlertTriangle;
    case "movimentacao": return ArrowLeftRight;
    case "tarefa": return CheckCircle2;
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

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { stats, isLoading: loadingKpis } = useDashboard();
  const { atividades, loading: loadingAtividades } = useAtividadeRecente(5);
  const { recebimentos } = useRecebimentos();
  const { getEstatisticas, loading: loadingEstoque } = useEstoque();

  // Enable realtime updates
  // Pull to refresh
  const containerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(async () => {
    // Força reload leve - o realtime já cuida do resto
    window.location.reload();
  }, []);
  const { bind, isRefreshing, pullDistance, pullThreshold } = usePullToRefresh(handleRefresh);

  const realtimeStatus = useRealtimeKPIs({
    showToasts: false,
  });

  const estatisticas = getEstatisticas();

  // Calcular KPIs baseados em dados reais
  const recebimentosList = recebimentos || [];
  const aguardandoRecebimento = recebimentosList.filter(r => 
    r.status === 'aguardando' || r.status === 'em_transito'
  ).length;
  
  const divergencias = recebimentosList.filter(r => r.status === 'divergencia').length;
  
  const triagemPendente = stats?.totalTriagens || 0;
  const itensEstoque = estatisticas.posicoesOcupadas;
  const ocupacaoPP = Math.round(estatisticas.taxaOcupacao);
  const ocupacaoBoxes = estatisticas.taxaOcupacao > 0 ? Math.round(estatisticas.taxaOcupacao * 0.8) : 0;

  const userName = profile?.nome?.split(' ')[0] || 'Operador';

  if (loadingKpis && loadingEstoque) {
    return (
      <div className="p-4 space-y-6">
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="p-4 space-y-6">
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
          >
            <div className="flex items-center justify-between mb-4">
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl font-bold text-foreground">{getGreeting()}, {userName}! 👋</h1>
                  {realtimeStatus.isConnected && (
                    <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/30 gap-1">
                      <Wifi className="h-3 w-3" />
                      Ao vivo
                    </Badge>
                  )}
                </div>
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
          </motion.section>

          {/* KPIs Grid */}
          <section>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {loadingKpis ? (
                Array.from({ length: 4 }).map((_, i) => (
                  <Skeleton key={i} className="h-24 rounded-xl" />
                ))
              ) : (
                [
                  { 
                    icon: Package, 
                    value: aguardandoRecebimento, 
                    label: "Aguardando", 
                    sublabel: "Recebimento", 
                    variant: "warning" as const, 
                    path: "/recebimento" 
                  },
                  { 
                    icon: Search, 
                    value: triagemPendente, 
                    label: "Triagem", 
                    sublabel: "Pendente", 
                    variant: "default" as const, 
                    path: "/triagem" 
                  },
                  { 
                    icon: Warehouse, 
                    value: itensEstoque.toLocaleString(), 
                    label: "Posições", 
                    sublabel: "Ocupadas", 
                    variant: "success" as const, 
                    path: "/estoque" 
                  },
                  { 
                    icon: AlertTriangle, 
                    value: divergencias, 
                    label: "Divergências", 
                    sublabel: "Pendentes", 
                    variant: "danger" as const,
                    path: "/divergencias"
                  },
                ].map((kpi, index) => (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 + index * 0.1 }}
                  >
                    <KPICard 
                      icon={kpi.icon} 
                      value={kpi.value} 
                      label={kpi.label} 
                      sublabel={kpi.sublabel} 
                      variant={kpi.variant}
                      onClick={kpi.path ? () => navigate(kpi.path) : undefined} 
                    />
                  </motion.div>
                ))
              )}
            </div>
          </section>

          {/* Stats Cards */}
          <motion.section 
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.3 }}
          >
            {/* Ocupação Card */}
            <Card className="col-span-1 md:col-span-2">
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-primary" />
                  Taxa de Ocupação
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loadingEstoque ? (
                  <div className="flex items-center justify-around py-4">
                    <Skeleton className="h-20 w-20 rounded-full" />
                    <div className="h-20 w-px bg-border" />
                    <Skeleton className="h-20 w-20 rounded-full" />
                  </div>
                ) : (
                  <>
                    <div className="flex items-center justify-around py-4">
                      <motion.div 
                        className="text-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.4 }}
                      >
                        <ProgressRing 
                          value={ocupacaoPP} 
                          variant={ocupacaoPP > 90 ? "danger" : ocupacaoPP > 70 ? "warning" : "success"}
                          label="Porta-Paletes"
                        />
                      </motion.div>
                      <div className="h-20 w-px bg-border" />
                      <motion.div 
                        className="text-center"
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ duration: 0.5, delay: 0.5 }}
                      >
                        <ProgressRing 
                          value={ocupacaoBoxes} 
                          variant={ocupacaoBoxes > 90 ? "danger" : ocupacaoBoxes > 70 ? "warning" : "success"}
                          label="Boxes"
                        />
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-sm text-muted-foreground pt-2 border-t">
                      <span>{estatisticas.posicoesOcupadas} posições ocupadas</span>
                      <span>{estatisticas.posicoesLivres} posições livres</span>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-semibold">Hoje</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {loadingKpis ? (
                  Array.from({ length: 3 }).map((_, i) => (
                    <Skeleton key={i} className="h-12" />
                  ))
                ) : (
                  [
                    { icon: CheckCircle2, value: stats?.totalRecebimentos || 0, label: "Entradas", bgClass: "bg-green-500/10", textClass: "text-green-600" },
                    { icon: Search, value: stats?.totalTriagens || 0, label: "Triagens Concluídas", bgClass: "bg-primary/10", textClass: "text-primary" },
                    { icon: XCircle, value: divergencias, label: "Divergências", bgClass: "bg-destructive/10", textClass: "text-destructive" },
                  ].map((stat, index) => (
                    <motion.div 
                      key={stat.label}
                      className="flex items-center justify-between"
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${stat.bgClass} flex items-center justify-center`}>
                          <stat.icon className={`h-5 w-5 ${stat.textClass}`} />
                        </div>
                        <div>
                          <p className={`text-2xl font-bold ${stat.textClass}`}>{stat.value}</p>
                          <p className="text-xs text-muted-foreground">{stat.label}</p>
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}
              </CardContent>
            </Card>
          </motion.section>

          {/* Operations & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Operations */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.4 }}
            >
              <h2 className="text-sm font-medium text-muted-foreground mb-3 uppercase tracking-wide">
                Operações
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  { icon: Package, label: "Recebimento", description: "Conferir materiais", badge: aguardandoRecebimento, path: "/recebimento" },
                  { icon: Search, label: "Triagem", description: "Controle qualidade", badge: triagemPendente, path: "/triagem" },
                  { icon: Warehouse, label: "Estoque", description: "Mapa visual", variant: "gradient" as const, path: "/estoque" },
                  { icon: ArrowLeftRight, label: "Movimentação", description: "Transferências", path: "/movimentacao" },
                  { icon: QrCode, label: "Scanner", description: "Ler QR Code", path: "/scanner" },
                  { icon: ClipboardList, label: "Relatórios", description: "Exportar dados", path: "/relatorios" },
                ].map((item, index) => (
                  <motion.div
                    key={item.label}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.08 }}
                  >
                    <MenuButton 
                      icon={item.icon} 
                      label={item.label} 
                      description={item.description}
                      badge={item.badge}
                      variant={item.variant}
                      onClick={() => navigate(item.path)} 
                    />
                  </motion.div>
                ))}
              </div>
            </motion.section>

            {/* Recent Activity */}
            <motion.section
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: 0.5 }}
            >
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-medium text-muted-foreground uppercase tracking-wide">
                  Atividade Recente
                </h2>
                <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={() => navigate("/rastreabilidade")}>
                  Ver tudo <ArrowRight className="h-3 w-3" />
                </Button>
              </div>
              <Card>
                <CardContent className="p-0">
                  <div className="divide-y divide-border">
                    {loadingAtividades ? (
                      Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex items-center gap-3 p-4">
                          <Skeleton className="w-9 h-9 rounded-lg" />
                          <div className="flex-1">
                            <Skeleton className="h-4 w-3/4 mb-1" />
                            <Skeleton className="h-3 w-1/4" />
                          </div>
                        </div>
                      ))
                    ) : atividades.length === 0 ? (
                      <div className="p-8 text-center text-muted-foreground">
                        <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">Nenhuma atividade recente</p>
                      </div>
                    ) : (
                      atividades.map((activity, index) => {
                        const Icon = getActivityIcon(activity.type);
                        return (
                          <motion.div 
                            key={activity.id}
                            className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors cursor-pointer"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: 0.6 + index * 0.1 }}
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
                          </motion.div>
                        );
                      })
                    )}
                  </div>
                </CardContent>
              </Card>
            </motion.section>
          </div>
      </div>
    </PageTransition>
  );
}

