 import { SEO } from "@/components/common/SEO";
 import { useNavigate } from "react-router-dom";
 import { useMemo, Suspense, lazy } from "react";
 import { motion } from "framer-motion";
 import { Package, Search, Warehouse, AlertTriangle } from "lucide-react";
 import { PageTransition } from "@/components/layout/PageTransition";
 import { useDashboard } from "@/hooks/useDashboard";
 import { useAtividadeRecente } from "@/hooks/useAtividadeRecente";
 import { useAuth } from "@/contexts/AuthContext";
 import { useRecebimentos } from "@/features/receiving/hooks/useRecebimentos";
 import { useEstoque } from "@/features/inventory/hooks/useEstoque";
 import { useRealtimeKPIs } from "@/features/analytics/hooks/useRealtimeKPIs";
 import { IndexHero } from "@/components/index/IndexHero";
 import { IndexKPIs } from "@/components/index/IndexKPIs";
 import { IndexOcupacaoCard } from "@/components/index/IndexOcupacaoCard";
 import { IndexQuickStats } from "@/components/index/IndexQuickStats";
 import { RouteLoadingFallback } from "@/components/common/RouteLoadingFallback";

 const IndexOperations = lazy(() => import("@/components/index/IndexOperations").then(m => ({ default: m.IndexOperations })));
 const IndexAtividade = lazy(() => import("@/components/index/IndexAtividade").then(m => ({ default: m.IndexAtividade })));

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

export default function Dashboard() {
  const navigate = useNavigate();
  const { profile, user } = useAuth();
  const { kpis: stats, loading: loadingKpis } = useDashboard();
  const { atividades, loading: loadingAtividades } = useAtividadeRecente(5);
  const { recebimentos } = useRecebimentos();
  const { getEstatisticas, loading: loadingEstoque } = useEstoque();
  const realtimeStatus = useRealtimeKPIs({ showToasts: false });

  const estatisticas = useMemo(() => getEstatisticas(), [getEstatisticas]);

   const { aguardandoRecebimento, divergencias, triagemPendente, itensEstoque, ocupacaoPP, ocupacaoBoxes } = useMemo(() => {
     const recebimentosList = recebimentos || [];
     const aguardando = recebimentosList.filter(r => r.status === 'aguardando' || r.status === 'em_transito').length;
     const div = recebimentosList.filter(r => r.status === 'divergencia').length;
     const triagem = stats?.triagensPendentes || 0;
     const itens = estatisticas.posicoesOcupadas;
     const pp = Math.round(estatisticas.taxaOcupacao);
     const boxes = estatisticas.taxaOcupacao > 0 ? Math.round(estatisticas.taxaOcupacao * 0.8) : 0;
     return { aguardandoRecebimento: aguardando, divergencias: div, triagemPendente: triagem, itensEstoque: itens, ocupacaoPP: pp, ocupacaoBoxes: boxes };
   }, [recebimentos, stats, estatisticas]);

  const userName = profile?.nome?.split(' ')[0] || user?.email?.split('@')[0] || 'Usuário';

   if (loadingKpis && loadingEstoque) {
     return <RouteLoadingFallback type="dashboard" />;
   }

   const kpiItems = [
     { 
       icon: Package, 
       value: aguardandoRecebimento, 
       label: "Aguardando", 
       sublabel: "Recebimento", 
       variant: "warning" as const, 
       path: "/recebimento",
       trend: { value: 12, isUp: true, label: "vs ontem" }
     },
     { 
       icon: Search, 
       value: triagemPendente, 
       label: "Triagem", 
       sublabel: "Pendente", 
       variant: "default" as const, 
       path: "/triagem",
       trend: { value: 5, isUp: false, label: "vs ontem" }
     },
     { 
       icon: Warehouse, 
       value: itensEstoque.toLocaleString(), 
       label: "Posições", 
       sublabel: "Ocupadas", 
       variant: "success" as const, 
       path: "/estoque",
       trend: { value: 2, isUp: true, label: "vs ontem" }
     },
     { 
       icon: AlertTriangle, 
       value: divergencias, 
       label: "Divergências", 
       sublabel: "Pendentes", 
       variant: "danger" as const, 
       path: "/divergencias",
       trend: { value: 0, isUp: true, label: "vs ontem" }
     },
   ];

   const totalRecebimentos = stats?.entradasHoje || 0;
   const totalTriagens = stats?.triagensHoje || 0;

  return (
    <PageTransition>
      <SEO title="Painel Principal" description="Visão geral do armazém com KPIs em tempo real, alertas e atividades recentes." path="/" />
      <motion.div className="p-4 md:p-6 space-y-6 max-w-[1400px] mx-auto" variants={containerVariants} initial="hidden" animate="visible">
        <IndexHero userName={userName} isConnected={realtimeStatus.isConnected} onDashboardClick={() => navigate("/dashboard")} />

         <motion.section variants={itemVariants} className="content-visibility-auto">
          <IndexKPIs items={kpiItems} loading={loadingKpis} onNavigate={navigate} />
        </motion.section>

         <motion.section className="grid grid-cols-1 lg:grid-cols-3 gap-4 content-visibility-auto" variants={itemVariants}>
          <IndexOcupacaoCard
            loading={loadingEstoque}
            ocupacaoPP={ocupacaoPP}
            ocupacaoBoxes={ocupacaoBoxes}
            posicoesOcupadas={estatisticas.posicoesOcupadas}
            posicoesLivres={estatisticas.posicoesLivres}
          />
          <IndexQuickStats loading={loadingKpis} totalRecebimentos={totalRecebimentos} totalTriagens={totalTriagens} divergencias={divergencias} />
        </motion.section>

          <Suspense fallback={<RouteLoadingFallback type="list" />}>
           <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 content-visibility-auto">
             <IndexOperations aguardandoRecebimento={aguardandoRecebimento} triagemPendente={triagemPendente} onNavigate={navigate} />
             <IndexAtividade atividades={atividades} loading={loadingAtividades} onSeeAll={() => navigate("/rastreabilidade")} />
           </div>
         </Suspense>
      </motion.div>
    </PageTransition>
  );
}
