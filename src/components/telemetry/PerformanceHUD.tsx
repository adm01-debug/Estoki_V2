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
          "flex items-center gap-3 px-3 py-1.5 rounded-full border backdrop-blur-md shadow-lg cursor-pointer transition-all",
          isCritical ? "bg-red-500/10 border-red-500/30 text-red-600" :
          isDegraded ? "bg-yellow-500/10 border-yellow-500/30 text-yellow-600" :
          "bg-background/50 border-border/20 text-muted-foreground"
        )}
        onClick={() => setShowDetails(!showDetails)}
      >
        <Activity className={cn("h-3.5 w-3.5", !isCritical && !isDegraded && "text-primary")} />
        <span className="text-[10px] font-black uppercase tracking-widest">
          {avgLatency}ms / {errorRate}% ER
        </span>
        
        {(isDegraded || isCritical) && (
          <Badge variant="destructive" className="h-4 px-1.5 text-[8px] animate-pulse">
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
            className="absolute bottom-full mb-2 left-0 w-64 bg-card border border-border/50 rounded-2xl p-4 shadow-2xl backdrop-blur-xl"
          >
            <h4 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2">
              <Zap className="h-3 w-3 text-primary" />
              Métricas de Performance
            </h4>
            <div className="space-y-3">
              <MetricItem label="Latência Média" value={`${avgLatency}ms`} status={avgLatency < 500 ? 'ok' : avgLatency < 1000 ? 'warn' : 'error'} />
              <MetricItem label="Taxa de Erro" value={`${errorRate}%`} status={errorRate < 5 ? 'ok' : errorRate < 10 ? 'warn' : 'error'} />
            </div>
            {isCritical && (
              <div className="mt-4 p-2 rounded-lg bg-red-500/10 border border-red-500/20 flex items-start gap-2">
                <AlertTriangle className="h-3 w-3 text-red-600 shrink-0 mt-0.5" />
                <p className="text-[9px] text-red-600 font-bold leading-tight">
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

const MetricItem = ({ label, value, status }: { label: string, value: string, status: 'ok' | 'warn' | 'error' }) => (
  <div className="flex items-center justify-between">
    <span className="text-[10px] font-medium text-muted-foreground uppercase">{label}</span>
    <span className={cn(
      "text-[10px] font-black",
      status === 'ok' ? "text-success" : status === 'warn' ? "text-yellow-600" : "text-red-600"
    )}>{value}</span>
  </div>
);

import { useState } from "react";
