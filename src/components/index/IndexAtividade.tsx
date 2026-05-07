import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Activity, ArrowRight, Package, Search, AlertTriangle, ArrowLeftRight, CheckCircle2, Clock } from "lucide-react";
import { getStatusClasses } from "@/lib/statusColors";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

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

interface Atividade {
  id: string | number;
  type: string;
  desc: string;
  time: string;
  status: string;
}

interface Props {
  atividades: Atividade[];
  loading: boolean;
  onSeeAll: () => void;
}

export function IndexAtividade({ atividades, loading, onSeeAll }: Props) {
  return (
    <motion.section variants={itemVariants} className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-overline whitespace-nowrap">Atividade Recente</h2>
          <div className="h-px w-32 bg-gradient-to-r from-border/50 to-transparent" />
        </div>
        <Button 
          variant="ghost" 
          size="sm" 
          className="text-xs font-bold gap-2 text-primary hover:text-primary hover:bg-primary/5 transition-all rounded-lg" 
          onClick={onSeeAll}
        >
          Visualizar Histórico <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
      
      <div className="premium-glass border-border/20 shadow-premium overflow-hidden">
        <div className="divide-y divide-border/10">
          {loading ? (
            Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center gap-4 p-5">
                <Skeleton className="w-12 h-12 rounded-2xl" />
                <div className="flex-1 space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))
          ) : atividades.length === 0 ? (
            <div className="p-16 text-center">
              <div className="w-16 h-16 rounded-[2rem] bg-muted/20 flex items-center justify-center mx-auto mb-4 border border-border/50">
                <Activity className="h-8 w-8 text-muted-foreground/40" />
              </div>
              <p className="text-base font-bold text-foreground tracking-tight">Ambiente em repouso</p>
              <p className="text-sm text-muted-foreground/60 mt-1 max-w-[200px] mx-auto">As atualizações do sistema aparecerão aqui em tempo real.</p>
            </div>
          ) : (
            atividades.map((activity, index) => {
              const Icon = getActivityIcon(activity.type);
              return (
                <motion.div
                  key={activity.id}
                  className="flex items-center gap-4 p-5 hover:bg-white/[0.02] transition-colors cursor-pointer group"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.5, delay: 0.1 + index * 0.05, ease: [0.16, 1, 0.3, 1] }}
                >
                  <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 group-hover:rotate-3",
                    getStatusClasses(activity.status)
                  )}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground tracking-tight group-hover:text-primary transition-colors">{activity.desc}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <Clock className="h-3 w-3 text-muted-foreground/60" />
                      <p className="text-xs text-muted-foreground/70 font-medium">{activity.time}</p>
                    </div>
                  </div>
                  <Badge variant="outline" className={cn(
                    "text-[10px] font-bold uppercase tracking-wider py-1 px-3 premium-glass",
                    getStatusClasses(activity.status)
                  )}>
                    {activity.type}
                  </Badge>
                  <ArrowRight className="h-4 w-4 text-muted-foreground/20 group-hover:text-primary/50 group-hover:translate-x-1 transition-all" />
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.section>
  );
}
}
