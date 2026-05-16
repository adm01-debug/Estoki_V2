import { motion } from "framer-motion";
import { Sparkles, TrendingUp, TrendingDown, AlertCircle } from "lucide-react";
import { useMemo } from "react";
import { DashboardKPIs } from "@/features/dashboard/hooks/useDashboard";

interface DynamicAIInsightsProps {
  kpis: DashboardKPIs;
}

export const DynamicAIInsights = ({ kpis }: DynamicAIInsightsProps) => {
  const insight = useMemo(() => {
    const { taxaOcupacao, giroMedio, triagensPendentes, itensParados30dias } = kpis;
    
    if (taxaOcupacao > 90) {
      return {
        title: "Capacidade Crítica",
        message: `O armazém está com ${taxaOcupacao}% de ocupação. Considere expedir itens parados há +30 dias para liberar espaço.`,
        icon: <AlertCircle className="h-6 w-6 text-red-500" />,
        color: "border-red-500/30 bg-red-500/5"
      };
    }
    
    if (giroMedio > 20) {
      return {
        title: "Alerta de Giro",
        message: `O giro médio de ${giroMedio} dias está acima da meta (15 dias). Analise itens de baixa movimentação.`,
        icon: <TrendingDown className="h-6 w-6 text-warning" />,
        color: "border-warning/30 bg-warning/5"
      };
    }

    if (triagensPendentes > 10) {
      return {
        title: "Gargalo na Triagem",
        message: `Existem ${triagensPendentes} triagens pendentes. O acúmulo pode impactar o tempo de disponibilização para venda.`,
        icon: <Sparkles className="h-6 w-6 text-primary" />,
        color: "border-primary/30 bg-primary/5"
      };
    }

    return {
      title: "IA Insight: Fluxo Otimizado",
      message: "As operações estão operando em ritmo de excelência. Continue monitorando o fluxo de saída hoje.",
      icon: <Sparkles className="h-6 w-6 text-success" />,
      color: "border-success/30 bg-success/5"
    };
  }, [kpis]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`p-5 rounded-3xl border flex items-center gap-4 shadow-sm transition-all ${insight.color}`}
    >
      <div className="w-12 h-12 rounded-2xl bg-white/50 dark:bg-black/20 flex items-center justify-center border border-current/10 shadow-inner">
        {insight.icon}
      </div>
      <div>
        <p className="text-sm font-black text-foreground uppercase tracking-tight">{insight.title}</p>
        <p className="text-xs text-muted-foreground font-medium leading-relaxed">
          {insight.message}
        </p>
      </div>
    </motion.div>
  );
};
