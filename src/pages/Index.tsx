import { SEO } from "@/components/common/SEO";
import { useNavigate } from "react-router-dom";
import { useCallback, useRef, useMemo } from "react";
import { usePullToRefresh } from "@/hooks/useTouchGestures";
import { motion } from "framer-motion";
import { Package, Search, Warehouse, AlertTriangle, BarChart3, Wifi } from "lucide-react";
import { KPICard } from "@/components/dashboard/KPICard";
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
import { IndexStatsSection } from "@/components/index/IndexStatsSection";
import { IndexOperations } from "@/components/index/IndexOperations";
import { IndexActivity } from "@/components/index/IndexActivity";

const getGreeting = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "Bom dia";
  if (hour < 18) return "Boa tarde";
  return "Boa noite";
};

const containerVariants = { hidden: { opacity: 0 }, visible: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const itemVariants = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } } };

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { kpis: stats, loading: loadingKpis, refetch: refetchDashboard } = useDashboard();
  const { atividades, loading: loadingAtividades } = useAtividadeRecente(5);
  const { recebimentos } = useRecebimentos();
  const { getEstatisticas, loading: loadingEstoque } = useEstoque();

  const containerRef = useRef<HTMLDivElement>(null);
  const handleRefresh = useCallback(async () => { await refetchDashboard(); }, [refetchDashboard]);
  const { bind, isRefreshing, pullDistance, pullThreshold } = usePullToRefresh(handleRefresh);

  const realtimeStatus = useRealtimeKPIs({ showToasts: false });
  const estatisticas = useMemo(() => getEstatisticas(), [getEstatisticas]);

  const { aguardandoRecebimento, divergencias, triagemPendente, itensEstoque, ocupacaoPP, ocupacaoBoxes } = useMemo(() => {
    const recebimentosList = recebimentos || [];
    return {
      aguardandoRecebimento: recebimentosList.filter(r => r.status === 'aguardando' || r.status === 'em_transito').length,
      divergencias: recebimentosList.filter(r => r.status === 'divergencia').length,
      triagemPendente: (stats as any)?.totalTriagens || 0,
      itensEstoque: estatisticas.posicoesOcupadas,
      ocupacaoPP: Math.round(estatisticas.taxaOcupacao),
      ocupacaoBoxes: estatisticas.taxaOcupacao > 0 ? Math.round(estatisticas.taxaOcupacao * 0.8) : 0,
    };
  }, [recebimentos, stats, estatisticas]);

  const userName = profile?.nome?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário';

  if (loadingKpis && loadingEstoque) {
    return (
      <div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between"><div><Skeleton className="h-8 w-64 mb-2" /><Skeleton className="h-4 w-48" /></div><Skeleton className="h-10 w-32 hidden sm:block" /></div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">{Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}</div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4"><Skeleton className="col-span-1 lg:col-span-2 h-64 rounded-xl" /><Skeleton className="h-64 rounded-xl" /></div>
      </div>
    );
  }

  return (
    <PageTransition>
      <SEO title="Painel Principal" description="Visão geral do armazém com KPIs em tempo real, alertas e atividades recentes." path="/" />
      <motion.div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        {/* Hero */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl md:text-3xl font-extrabold text-foreground tracking-tight">
                  {getGreeting()}, <span className="gradient-text">{userName}</span>! 👋
                </h1>
                {realtimeStatus.isConnected && (
                  <Badge variant="outline" className="bg-success/10 text-success border-success/30 gap-1.5 animate-pulse"><Wifi className="h-3 w-3" />Live</Badge>
                )}
              </div>
              <p className="text-muted-foreground mt-1">Resumo completo do seu armazém</p>
            </div>
            <Button className="gap-2 hidden sm:flex glow-button bg-primary hover:bg-primary/90" onClick={() => navigate("/dashboard")}>
              <BarChart3 className="h-4 w-4" />Dashboard
            </Button>
          </div>
        </motion.section>

        {/* KPIs */}
        <motion.section variants={itemVariants}>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
            {loadingKpis ? Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28 rounded-xl" />) : (
              [
                { icon: Package, value: aguardandoRecebimento, label: "Aguardando", sublabel: "Recebimento", variant: "warning" as const, path: "/recebimento" },
                { icon: Search, value: triagemPendente, label: "Triagem", sublabel: "Pendente", variant: "default" as const, path: "/triagem" },
                { icon: Warehouse, value: itensEstoque.toLocaleString(), label: "Posições", sublabel: "Ocupadas", variant: "success" as const, path: "/estoque" },
                { icon: AlertTriangle, value: divergencias, label: "Divergências", sublabel: "Pendentes", variant: "danger" as const, path: "/divergencias" },
              ].map((kpi) => (
                <motion.div key={kpi.label} variants={itemVariants} whileHover={{ y: -4, transition: { duration: 0.2 } }}>
                  <KPICard icon={kpi.icon} value={kpi.value} label={kpi.label} sublabel={kpi.sublabel} variant={kpi.variant} onClick={() => navigate(kpi.path)} />
                </motion.div>
              ))
            )}
          </div>
        </motion.section>

        <IndexStatsSection
          ocupacaoPP={ocupacaoPP} ocupacaoBoxes={ocupacaoBoxes}
          posicoesOcupadas={estatisticas.posicoesOcupadas} posicoesLivres={estatisticas.posicoesLivres}
          totalRecebimentos={(stats as any)?.totalRecebimentos || 0} totalTriagens={(stats as any)?.totalTriagens || 0} divergencias={divergencias}
          loadingEstoque={loadingEstoque} loadingKpis={loadingKpis}
        />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <IndexOperations aguardandoRecebimento={aguardandoRecebimento} triagemPendente={triagemPendente} />
          <IndexActivity atividades={atividades} loading={loadingAtividades} />
        </div>
      </motion.div>
    </PageTransition>
  );
}
