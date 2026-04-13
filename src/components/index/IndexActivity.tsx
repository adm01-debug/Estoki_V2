import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowRight, Activity, Package, Search, AlertTriangle, ArrowLeftRight, CheckCircle2, Clock } from "lucide-react";
import { getStatusClasses } from "@/lib/statusColors";

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

interface ActivityItem {
  id: string;
  type: string;
  desc: string;
  time: string;
  status: string;
}

interface IndexActivityProps {
  atividades: ActivityItem[];
  loading: boolean;
}

export function IndexActivity({ atividades, loading }: IndexActivityProps) {
  const navigate = useNavigate();

  return (
    <div>
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
            {loading ? (
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
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center border ${getStatusClasses(activity.status)}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">{activity.desc}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                    <Badge variant="outline" className={`text-[10px] font-semibold ${getStatusClasses(activity.status)}`}>
                      {activity.type}
                    </Badge>
                  </motion.div>
                );
              })
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
