import { usePerformance } from "@/utils/performance";
import { AlertTriangle, Activity, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export const PerformanceHUD = () => {
  const { avgLatency, errorRate } = usePerformance();
  const [showDetails, setShowDetails] = useState(false);

  const isDegraded = avgLatency > 500 || errorRate > 5;
  const isCritical = avgLatency > 1500 || errorRate > 15;

  if (avgLatency === 0) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className={cn(
          "flex cursor-pointer items-center gap-3 rounded-full border px-3 py-1.5 shadow-lg backdrop-blur-md transition-all",
          isCritical
            ? "border-red-500/30 bg-red-500/10 text-red-600"
            : isDegraded
              ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-600"
              : "border-border/20 bg-background/50 text-muted-foreground"
        )}
        onClick={() => setShowDetails(!showDetails)}
      >
        <Activity className={cn("h-3.5 w-3.5", !isCritical && !isDegraded && "text-primary")} />
        <span className="text-[10px] font-black uppercase tracking-widest">
          {avgLatency}ms / {errorRate}% ER
        </span>

        {(isDegraded || isCritical) && (
          <Badge variant="destructive" className="h-4 animate-pulse px-1.5 text-[8px]">
            ALERTA
          </Badge>
        )}
      </motion.div>

      <AnimatePresence>
        {showDetails && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-full left-0 mb-2 w-64 rounded-2xl border border-border/50 bg-card p-4 shadow-2xl backdrop-blur-xl"
          >
            <h4 className="mb-3 flex items-center gap-2 text-xs font-black uppercase tracking-widest">
              <Zap className="h-3 w-3 text-primary" />
              Métricas de Performance
            </h4>
            <div className="space-y-3">
              <MetricItem
                label="Latência Média"
                value={`${avgLatency}ms`}
                status={avgLatency < 500 ? "ok" : avgLatency < 1000 ? "warn" : "error"}
              />
              <MetricItem
                label="Taxa de Erro"
                value={`${errorRate}%`}
                status={errorRate < 5 ? "ok" : errorRate < 10 ? "warn" : "error"}
              />
            </div>
            {isCritical && (
              <div className="mt-4 flex items-start gap-2 rounded-lg border border-red-500/20 bg-red-500/10 p-2">
                <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0 text-red-600" />
                <p className="text-[9px] font-bold leading-tight text-red-600">
                  Sistema operando em condições críticas. Latência elevada detectada.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const MetricItem = ({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: "ok" | "warn" | "error";
}) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-medium uppercase text-muted-foreground">{label}</span>
    <span
      className={cn(
        "text-[10px] font-black",
        status === "ok" ? "text-success" : status === "warn" ? "text-yellow-600" : "text-red-600"
      )}
    >
      {value}
    </span>
  </div>
);

import { useState } from "react";
