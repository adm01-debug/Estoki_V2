// @ts-nocheck
import { useNavigate } from "react-router-dom";
import { useCallback, useRef, useMemo } from "react";
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
  Wifi,
  Zap,
  Target,
  Activity
} from "lucide-react";
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

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } }
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile } = useAuth();
  const { stats, isLoading: loadingKpis } = useDashboard();
  const { atividades, loading: loadingAtividades } = useAtividadeRecente(5);
  const { recebimentos } = useRecebimentos();
  const { getEstatisticas, loading: loadingEstoque } = useEstoque();

  const containerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(async () => {
    window.location.reload();
  }, []);
  const { bind, isRefreshing, pullDistance, pullThreshold } = usePullToRefresh(handleRefresh);

  const realtimeStatus = useRealtimeKPIs({
    showToasts: false,
  });

  const estatisticas = useMemo(() => getEstatisticas(), [getEstatisticas]);

  const { aguardandoRecebimento, divergencias, triagemPendente, itensEstoque, ocupacaoPP, ocupacaoBoxes } = useMemo(() => {
    const recebimentosList = recebimentos || [];
    const aguardando = recebimentosList.filter(r => 
      r.status === 'aguardando' || r.status === 'em_transito'
    ).length;
    const div = recebimentosList.filter(r => r.status === 'divergencia').length;
    const triagem = stats?.totalTriagens || 0;
    const itens = estatisticas.posicoesOcupadas;
    const pp = Math.round(estatisticas.taxaOcupacao);
    const boxes = estatisticas.taxaOcupacao > 0 ? Math.round(estatisticas.taxaOcupacao * 0.8) : 0;
    return { aguardandoRecebimento: aguardando, divergencias: div, triagemPendente: triagem, itensEstoque: itens, ocupacaoPP: pp, ocupacaoBoxes: boxes };
  }, [recebimentos, stats, estatisticas]);

  const userName = profile?.nome?.split(' ')[0] || 'Operador';
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 className="h-8 w-8 text-primary" />
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <motion.div 
        className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Hero Section */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                  {getGreeting()}, <span className="gradient-text">{userName}</span>! 👋
                </h1>
                {realtimeStatus.isConnected && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1.5 animate-pulse">
                    <Wifi className="h-3 w-3" />
                    Live
                  </Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">Resumo completo do seu armazém</p>
            </div>
            <Button 
              className="gap-2 hidden sm:flex glow-button bg-primary hover:bg-primary/90"
              onClick={() => navigate("/dashboard")}
            >
              <BarChart3 className="h-4 w-4" />
              Dashboard
            </Button>
          </div>
        </motion.section>

        {/* KPIs Grid */}
        <motion.section variants={itemVariants}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {loadingKpis ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Skeleton key={i} className="h-28 rounded-xl" />
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
                  variants={itemVariants}
                  whileHover={{ y: -4, transition: { duration: 0.2 } }}
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
        </motion.section>

        {/* Stats Cards */}
        <motion.section 
          className="grid grid-cols-1 lg:grid-cols-3 gap-4"
          variants={itemVariants}
        >
          {/* Ocupação Card */}
          <Card className="col-span-1 lg:col-span-2 glass-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-primary" />
                </div>
                Taxa de Ocupação
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loadingEstoque ? (
                <div className="flex items-center justify-around py-4">
                  <Skeleton className="h-24 w-24 rounded-full" />
                  <Skeleton className="h-24 w-24 rounded-full" />
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-around py-6">
                    <motion.div 
                      className="text-center"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.3, type: "spring" }}
                    >
                      <ProgressRing 
                        value={ocupacaoPP} 
                        variant={ocupacaoPP > 90 ? "danger" : ocupacaoPP > 70 ? "warning" : "success"}
                        label="Porta-Paletes"
                        size={130}
                        strokeWidth={12}
                      />
                    </motion.div>
                    <div className="h-24 w-px bg-border/30" />
                    <motion.div 
                      className="text-center"
                      initial={{ scale: 0.5, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.6, delay: 0.4, type: "spring" }}
                    >
                      <ProgressRing 
                        value={ocupacaoBoxes} 
                        variant={ocupacaoBoxes > 90 ? "danger" : ocupacaoBoxes > 70 ? "warning" : "success"}
                        label="Boxes"
                        size={130}
                        strokeWidth={12}
                      />
                    </motion.div>
                  </div>
                  <div className="flex justify-between text-sm text-muted-foreground pt-3 border-t border-border/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-success" />
                      <span>{estatisticas.posicoesOcupadas} ocupadas</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                      <span>{estatisticas.posicoesLivres} livres</span>
                    </div>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card className="glass-card border-border/30">
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Zap className="h-4 w-4 text-primary" />
                </div>
                Hoje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {loadingKpis ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <Skeleton key={i} className="h-14" />
                ))
              ) : (
                [
                  { icon: CheckCircle2, value: stats?.totalRecebimentos || 0, label: "Entradas", bgClass: "bg-success/10", textClass: "text-success", borderClass: "border-success/20" },
                  { icon: Target, value: stats?.totalTriagens || 0, label: "Triagens", bgClass: "bg-primary/10", textClass: "text-primary", borderClass: "border-primary/20" },
                  { icon: XCircle, value: divergencias, label: "Divergências", bgClass: "bg-destructive/10", textClass: "text-destructive", borderClass: "border-destructive/20" },
                ].map((stat, index) => (
                  <motion.div 
                    key={stat.label}
                    className={`flex items-center justify-between p-3 rounded-xl border ${stat.borderClass} ${stat.bgClass}/5`}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }}
                    whileHover={{ scale: 1.02 }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-xl ${stat.bgClass} flex items-center justify-center`}>
                        <stat.icon className={`h-5 w-5 ${stat.textClass}`} />
                      </div>
                      <div>
                        <p className={`text-2xl font-extrabold ${stat.textClass}`}>{stat.value}</p>
                        <p className="text-[11px] text-muted-foreground font-medium">{stat.label}</p>
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
          <motion.section variants={itemVariants}>
            <h2 className="text-xs font-bold text-primary/60 mb-3 uppercase tracking-[0.2em] flex items-center gap-2">
              <span className="w-4 h-px bg-primary/30" />
              Operações Rápidas
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
                  variants={itemVariants}
                  whileHover={{ y: -2 }}
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
          <motion.section variants={itemVariants}>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-bold text-primary/60 uppercase tracking-[0.2em] flex items-center gap-2">
                <span className="w-4 h-px bg-primary/30" />
                Atividade Recente
              </h2>
              <Button variant="ghost" size="sm" className="text-xs gap-1 text-primary hover:text-primary" onClick={() => navigate("/rastreabilidade")}>
                Ver tudo <ArrowRight className="h-3 w-3" />
              </Button>
            </div>
            <Card className="glass-card border-border/30 overflow-hidden">
              <CardContent className="p-0">
                <div className="divide-y divide-border/30">
                  {loadingAtividades ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <div key={i} className="flex items-center gap-3 p-4">
                        <Skeleton className="w-10 h-10 rounded-xl" />
                        <div className="flex-1">
                          <Skeleton className="h-4 w-3/4 mb-1.5" />
                          <Skeleton className="h-3 w-1/4" />
                        </div>
                      </div>
                    ))
                  ) : atividades.length === 0 ? (
                    <div className="p-10 text-center text-muted-foreground">
                      <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-3">
                        <Activity className="h-6 w-6 opacity-40" />
                      </div>
                      <p className="text-sm font-medium">Nenhuma atividade recente</p>
                      <p className="text-xs text-muted-foreground/60 mt-1">As atividades aparecerão aqui</p>
                    </div>
                  ) : (
                    atividades.map((activity, index) => {
                      const Icon = getActivityIcon(activity.type);
                      return (
                        <motion.div 
                          key={activity.id}
                          className="flex items-center gap-3 p-4 hover:bg-muted/30 transition-colors cursor-pointer"
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ duration: 0.3, delay: 0.6 + index * 0.08 }}
                          whileHover={{ x: 4 }}
                        >
                          <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getStatusColor(activity.status)}`}>
                            <Icon className="h-4 w-4" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-foreground truncate">
                              {activity.desc}
                            </p>
                            <p className="text-xs text-muted-foreground">{activity.time}</p>
                          </div>
                          <Badge 
                            variant="outline" 
                            className={`text-[10px] font-semibold ${getStatusColor(activity.status)}`}
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
      </motion.div>
    </PageTransition>
  );
}
