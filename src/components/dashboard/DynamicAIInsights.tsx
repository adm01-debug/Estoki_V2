import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle, Zap, ShieldCheck, Target, BarChart3 } from "lucide-react";
import { useMemo, useState, useEffect } from "react";
import { DashboardKPIs } from "@/features/dashboard/hooks/useDashboard";
import { cn } from "@/lib/utils";
import { haptics } from "@/utils/haptics";

interface DynamicAIInsightsProps {
  kpis: DashboardKPIs;
}

export const DynamicAIInsights = ({ kpis }: DynamicAIInsightsProps) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const insights = useMemo(() => {
    const { taxaOcupacao, giroMedio, triagensPendentes, itensParados30dias } = kpis;
    const list = [];
    
    if (taxaOcupacao > 90) {
      list.push({
        id: "cap-critica",
        title: "Capacidade Crítica",
        message: `O armazém está com ${taxaOcupacao}% de ocupação. Considere expedir itens parados há +30 dias para liberar espaço.`,
        icon: <AlertCircle className="h-6 w-6 text-red-500" />,
        color: "border-red-500/30 bg-red-500/5",
        badge: "Urgente"
      });
    }
    
    if (giroMedio > 20) {
      list.push({
        id: "alerta-giro",
        title: "Alerta de Giro",
        message: `O giro médio de ${giroMedio} dias está acima da meta (15 dias). Analise itens de baixa movimentação.`,
        icon: <TrendingDown className="h-6 w-6 text-amber-500" />,
        color: "border-amber-500/30 bg-amber-500/5",
        badge: "Eficiência"
      });
    }

    if (triagensPendentes > 10) {
      list.push({
        id: "gargalo-triagem",
        title: "Gargalo na Triagem",
        message: `Existem ${triagensPendentes} triagens pendentes. O acúmulo pode impactar o tempo de disponibilização para venda.`,
        icon: <Sparkles className="h-6 w-6 text-primary" />,
        color: "border-primary/30 bg-primary/5",
        badge: "Fluxo"
      });
    }

    if (itensParados30dias > 50) {
      list.push({
        id: "custo-oportunidade",
        title: "Custo de Oportunidade",
        message: `Você tem ${itensParados30dias} itens parados há mais de um mês. Isso representa capital imobilizado.`,
        icon: <BarChart3 className="h-6 w-6 text-blue-500" />,
        color: "border-blue-500/30 bg-blue-500/5",
        badge: "Financeiro"
      });
    }

    // Default positive insights
    list.push({
      id: "fluxo-otimizado",
      title: "Fluxo Otimizado",
      message: "As operações estão operando em ritmo de excelência. O Lead Time médio está 12% melhor que no mês passado.",
      icon: <ShieldCheck className="h-6 w-6 text-success" />,
      color: "border-success/30 bg-success/5",
      badge: "Performance"
    });

    list.push({
      id: "proativo-ia",
      title: "Predição Proativa",
      message: "A IA prevê um aumento de 15% nas entradas para a próxima semana. Prepare as áreas de recebimento.",
      icon: <Zap className="h-6 w-6 text-indigo-500" />,
      color: "border-indigo-500/30 bg-indigo-500/5",
      badge: "AI Prediction"
    });

    return list;
  }, [kpis]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % insights.length);
    }, 8000);
    return () => clearInterval(timer);
  }, [insights.length]);

  const insight = insights[currentIndex];

  const handleNext = () => {
    haptics.light();
    setCurrentIndex((prev) => (prev + 1) % insights.length);
  };

  return (
    <div className="relative group">
      <AnimatePresence mode="wait">
        <motion.div 
          key={insight.id}
          initial={{ opacity: 0, scale: 0.98, y: 5 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 1.02, y: -5 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={handleNext}
          className={cn(
            "p-5 rounded-3xl border flex items-center gap-4 shadow-sm transition-all cursor-pointer relative overflow-hidden",
            insight.color
          )}
        >
          <div className="absolute top-0 right-0 p-3">
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-white/40 dark:bg-black/20 backdrop-blur-sm border border-current/10">
              <Target className="h-3 w-3" />
              <span className="text-[9px] font-black uppercase tracking-tighter">{insight.badge}</span>
            </div>
          </div>

          <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center border border-current/10 shadow-inner shrink-0">
            {insight.icon}
          </div>
          <div className="flex-1 pr-12">
            <p className="text-sm font-black text-foreground uppercase tracking-tight flex items-center gap-2">
              {insight.title}
              <span className="w-1 h-1 rounded-full bg-current/30" />
              <span className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase">Smart Intelligence</span>
            </p>
            <p className="text-xs text-muted-foreground font-medium leading-relaxed max-w-2xl">
              {insight.message}
            </p>
          </div>

          <div className="absolute bottom-0 left-0 h-1 bg-current/10 w-full">
            <motion.div 
              key={`bar-${insight.id}`}
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 8, ease: "linear" }}
              className="h-full bg-current opacity-20"
            />
          </div>
        </motion.div>
      </AnimatePresence>
      
      <div className="absolute -bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
        {insights.map((_, i) => (
          <div 
            key={i} 
            className={cn(
              "h-1 transition-all rounded-full",
              i === currentIndex ? "w-4 bg-primary" : "w-1.5 bg-muted-foreground/30"
            )} 
          />
        ))}
      </div>
    </div>
  );
};
