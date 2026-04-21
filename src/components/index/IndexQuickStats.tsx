import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Zap, CheckCircle2, Target, XCircle, LucideIcon } from "lucide-react";

interface Stat {
  icon: LucideIcon;
  value: number;
  label: string;
  bgClass: string;
  textClass: string;
  borderClass: string;
}

interface Props {
  loading: boolean;
  totalRecebimentos: number;
  totalTriagens: number;
  divergencias: number;
}

export function IndexQuickStats({ loading, totalRecebimentos, totalTriagens, divergencias }: Props) {
  const stats: Stat[] = [
    { icon: CheckCircle2, value: totalRecebimentos, label: "Entradas", bgClass: "bg-success/10", textClass: "text-success", borderClass: "border-success/20" },
    { icon: Target, value: totalTriagens, label: "Triagens", bgClass: "bg-primary/10", textClass: "text-primary", borderClass: "border-primary/20" },
    { icon: XCircle, value: divergencias, label: "Divergências", bgClass: "bg-destructive/10", textClass: "text-destructive", borderClass: "border-destructive/20" },
  ];

  return (
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
        {loading ? (
          Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-14" />)
        ) : (
          stats.map((stat, index) => (
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
  );
}
