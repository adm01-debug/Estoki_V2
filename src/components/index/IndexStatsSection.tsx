import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ProgressRing } from "@/components/dashboard/ProgressRing";
import { TrendingUp, Zap, CheckCircle2, XCircle, Target } from "lucide-react";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

interface IndexStatsSectionProps {
  ocupacaoPP: number;
  ocupacaoBoxes: number;
  posicoesOcupadas: number;
  posicoesLivres: number;
  totalRecebimentos: number;
  totalTriagens: number;
  divergencias: number;
  loadingEstoque: boolean;
  loadingKpis: boolean;
}

export function IndexStatsSection({
  ocupacaoPP, ocupacaoBoxes, posicoesOcupadas, posicoesLivres,
  totalRecebimentos, totalTriagens, divergencias,
  loadingEstoque, loadingKpis,
}: IndexStatsSectionProps) {
  return (
    <motion.section className="grid grid-cols-1 lg:grid-cols-3 gap-4" variants={itemVariants}>
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
                <motion.div className="text-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.3, type: "spring" }}>
                  <ProgressRing value={ocupacaoPP} variant={ocupacaoPP > 90 ? "danger" : ocupacaoPP > 70 ? "warning" : "success"} label="Porta-Paletes" size={130} strokeWidth={12} />
                </motion.div>
                <div className="h-24 w-px bg-border/30" />
                <motion.div className="text-center" initial={{ scale: 0.5, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.6, delay: 0.4, type: "spring" }}>
                  <ProgressRing value={ocupacaoBoxes} variant={ocupacaoBoxes > 90 ? "danger" : ocupacaoBoxes > 70 ? "warning" : "success"} label="Boxes" size={130} strokeWidth={12} />
                </motion.div>
              </div>
              <div className="flex justify-between text-sm text-muted-foreground pt-3 border-t border-border/30">
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-success" /><span>{posicoesOcupadas} ocupadas</span></div>
                <div className="flex items-center gap-2"><div className="w-2 h-2 rounded-full bg-muted-foreground/30" /><span>{posicoesLivres} livres</span></div>
              </div>
            </>
          )}
        </CardContent>
      </Card>

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
            Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)
          ) : (
            [
              { icon: CheckCircle2, value: totalRecebimentos, label: "Entradas", bgClass: "bg-success/10", textClass: "text-success", borderClass: "border-success/20" },
              { icon: Target, value: totalTriagens, label: "Triagens", bgClass: "bg-primary/10", textClass: "text-primary", borderClass: "border-primary/20" },
              { icon: XCircle, value: divergencias, label: "Divergências", bgClass: "bg-destructive/10", textClass: "text-destructive", borderClass: "border-destructive/20" },
            ].map((stat, index) => (
              <motion.div key={stat.label}
                className={`flex items-center justify-between p-3 rounded-xl border ${stat.borderClass} ${stat.bgClass}/5`}
                initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: 0.5 + index * 0.1 }} whileHover={{ scale: 1.02 }}
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
  );
}
