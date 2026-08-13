import { memo } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Activity,
  ArrowRight,
  Package,
  Search,
  AlertTriangle,
  ArrowLeftRight,
  CheckCircle2,
  Clock,
  MoreVertical,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { getStatusClasses } from "@/lib/statusColors";

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" as const } },
};

const getActivityIcon = (type: string) => {
  switch (type) {
    case "recebimento":
      return Package;
    case "triagem":
      return Search;
    case "divergencia":
      return AlertTriangle;
    case "movimentacao":
      return ArrowLeftRight;
    case "tarefa":
      return CheckCircle2;
    default:
      return Clock;
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

export const IndexAtividade = memo(({ atividades, loading, onSeeAll }: Props) => {
  return (
    <motion.section variants={itemVariants}>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.2em] text-primary/60">
          <span className="h-px w-4 bg-primary/30" />
          Atividade Recente
        </h2>
        <Button
          variant="ghost"
          size="sm"
          className="gap-1 text-xs text-primary hover:text-primary"
          onClick={onSeeAll}
        >
          Ver tudo <ArrowRight className="h-3 w-3" />
        </Button>
      </div>
      <Card className="glass-card overflow-hidden border-border/30">
        <CardContent className="p-0">
          <div className="divide-y divide-border/30">
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="flex items-center gap-3 p-4">
                  <Skeleton className="h-10 w-10 rounded-xl" />
                  <div className="flex-1">
                    <Skeleton className="mb-1.5 h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/4" />
                  </div>
                </div>
              ))
            ) : atividades.length === 0 ? (
              <div className="p-10 text-center text-muted-foreground">
                <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-muted/50">
                  <Activity className="h-6 w-6 opacity-40" />
                </div>
                <p className="text-sm font-medium">Nenhuma atividade recente</p>
                <p className="mt-1 text-xs text-muted-foreground/60">
                  As atividades aparecerão aqui
                </p>
              </div>
            ) : (
              <TooltipProvider>
                {atividades.map((activity, index) => {
                  const Icon = getActivityIcon(activity.type);
                  return (
                    <div
                      key={activity.id}
                      className="group/item relative flex cursor-pointer items-center gap-3 overflow-hidden p-4 transition-all transition-colors duration-200 hover:bg-muted/30 hover:pl-5"
                    >
                      {/* Indicador lateral dinâmico */}
                      <div
                        className={cn(
                          "absolute bottom-0 left-0 top-0 w-1 opacity-0 transition-opacity group-hover/item:opacity-100",
                          activity.status === "success"
                            ? "bg-success"
                            : activity.status === "danger"
                              ? "bg-destructive"
                              : activity.status === "warning"
                                ? "bg-warning"
                                : "bg-primary"
                        )}
                      />

                      <div
                        className={cn(
                          "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-sm transition-transform group-hover/item:scale-110",
                          getStatusClasses(activity.status)
                        )}
                      >
                        <Icon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-bold tracking-tight text-foreground transition-colors group-hover/item:text-primary">
                          {activity.desc}
                        </p>
                        <div className="mt-0.5 flex items-center gap-2">
                          <Clock className="h-3 w-3 text-muted-foreground/60" />
                          <p className="text-[11px] font-medium text-muted-foreground">
                            {activity.time}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Badge
                              variant="outline"
                              className={cn(
                                "rounded-full border-none px-2 text-[10px] font-bold uppercase tracking-wider",
                                getStatusClasses(activity.status)
                              )}
                            >
                              {activity.type}
                            </Badge>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p className="text-xs">Evento de {activity.type}</p>
                          </TooltipContent>
                        </Tooltip>

                        <div className="flex items-center opacity-0 transition-opacity group-hover/item:opacity-100">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 hover:bg-primary/10 hover:text-primary"
                          >
                            <ExternalLink className="h-3.5 w-3.5" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <MoreVertical className="h-4 w-4 text-muted-foreground" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </TooltipProvider>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.section>
  );
});

IndexAtividade.displayName = "IndexAtividade";
